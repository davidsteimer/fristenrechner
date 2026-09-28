"""Derived pinpoint extracts and body comparisons, not a legal approval."""
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).parent
federal = {
    'StPO': ['85', '89', '90', '91'], 'ZPO': ['138', '142', '143', '145', '146'],
    'BGG': ['44', '45', '46', '100'], 'VwVG': ['20', '21', '22_a', '24'],
    'BPR': ['21', '29', '77', '79', '80'], 'VPR': ['8_a', '8_d', '8_e'], 'Bundesfeiertag': ['1'],
}
cantonal = {
    'VRPG': ['41', '42', '43', '44', '67a', '81', '83'], 'IVOEB': ['51', '53', '55', '56', '64'],
    'IVOEBG': ['3', '4', '5', '6'], 'IVOEBV': ['15', '21a', '22a', '25'],
    'PRG': ['16', '68', '69', '74', '75', '79', '98', '101', '110', '111', '117', '121', '130', '147', '165'],
    'PRV': ['66'],
}
def body(node):
    if node is None:
        raise ValueError('Missing XML article')
    value = node.text or ''
    for child in node:
        if child.tag.split('}')[-1] != 'authorialNote':
            value += body(child)
        value += child.tail or ''
    return value

def norm(value):
    return re.sub(r'\s+', '', value.replace('\u00ad', ''))

extracts = {}
for law, articles in federal.items():
    tree = ET.parse(root / f'{law}.xml')
    extracts[law] = {}
    for article in articles:
        node = tree.find(f'.//{{*}}article[@eId="art_{article}"]')
        extracts[law][article] = {'body': body(node), 'withNotes': ''.join(node.itertext())}
for law, articles in cantonal.items():
    data = json.loads((root / f'{law}.json').read_text())['text_of_law']
    parts = re.split(r"(?=<div class='article'>)", html.unescape(data['selected_version']['xhtml_tol']))
    extracts[law] = {'currentVersion': data['current_version'], 'futureVersions': data['future_versions']}
    for article in articles:
        chunks = [part for part in parts if re.search(r"<span class='number'>" + article + r"\s*(?:</span>|<)", part[:400])]
        if not chunks:
            raise ValueError(f'Missing BELEX article {law} {article}')
        extracts[law][article] = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', chunks[0]))).strip()

future = {}
for law, date, articles in [
    ('VwVG', '20270101', ['1', '2', '20', '21', '22_a', '24', '47', '63', '64', '65']),
    ('VPR', '20270701', ['2_a', '8_a', '8_d', '8_e']),
]:
    old, new = ET.parse(root / f'{law}.xml'), ET.parse(root / f'{law}-{date}.xml')
    future[law] = {}
    for article in articles:
        before, after = [tree.find(f'.//{{*}}article[@eId="art_{article}"]') for tree in [old, new]]
        before_body, after_body = body(before), body(after)
        future[law][article] = {'bodyUnchangedIgnoringWhitespaceAndSoftHyphen': norm(before_body) == norm(after_body), 'before': before_body, 'after': after_body, 'afterWithNotes': ''.join(after.itertext())}

(root / 'article-extracts.json').write_text(json.dumps(extracts, ensure_ascii=False, indent=2) + '\n')
(root / 'future-article-comparison.json').write_text(json.dumps(future, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({law: {art: row['bodyUnchangedIgnoringWhitespaceAndSoftHyphen'] for art, row in rows.items()} for law, rows in future.items()}, ensure_ascii=False, indent=2))
