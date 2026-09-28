"""Extract the bounded AP19 source articles from fresh official XML/XHTML."""
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parent
raw = root / 'retry-01'
normal = lambda value: re.sub(r'\s+', ' ', value).strip()
records = json.loads((raw / 'fetch-results.json').read_text())
result = {}
for record in records:
    if not record.get('articles'):
        continue
    assert record['status'] == 200 and record['matchesPriorHash'], record['file']
    if record['file'].endswith('.xml'):
        tree = ET.parse(raw / record['file'])
        selected = {}
        for number in record['articles']:
            candidates = ['art_' + number, 'art_' + re.sub(r'([0-9])([a-z])', r'\1_\2', number)]
            matches = [a for a in tree.findall('.//{*}article') if a.attrib.get('eId') in candidates]
            assert len(matches) == 1, (record['file'], number, candidates)
            selected[number] = normal(' '.join(matches[0].itertext()))
        result[record['priorCheckId']] = selected
    else:
        law = json.loads((raw / record['file']).read_text())['text_of_law']
        selected_version = law['selected_version']
        chunks = re.split(r"(?=<div class='article'>)", selected_version['xhtml_tol'])
        selected = {'version': selected_version['id'], 'future_versions': law['future_versions']}
        for number in record['articles']:
            matches = [chunk for chunk in chunks if re.search(r"<span class='number'>" + number + r'\s*</span>', chunk[:400])]
            assert len(matches) == 1, (record['file'], number)
            selected[number] = normal(html.unescape(re.sub('<[^>]+>', ' ', matches[0])))
        result[record['priorCheckId']] = selected

pairs = [('CH-ELG-20260101', 'CH-ELG-20270101'), ('CH-IVG-20260101', 'CH-IVG-20270101'), ('CH-AHVG-20260101', 'CH-AHVG-20270101'), ('CH-IVV-20250601', 'CH-IVV-20270701')]
result['comparison'] = [{'from': a, 'to': b, 'allSelectedArticleTextsEqual': result[a] == result[b]} for a, b in pairs]
assert all(item['allSelectedArticleTextsEqual'] for item in result['comparison'])
with (root / 'article-extracts.json').open('x') as output:
    json.dump(result, output, ensure_ascii=False, indent=2)
    output.write('\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
