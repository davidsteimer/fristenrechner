"""Extract official XML/XHTML for the bounded AP19C2 legal source review."""
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parent
fed = {
    'ATSG': ['2', '38', '39', '40', '41', '49', '51', '52', '55', '56', '58', '60', '61'],
    'AVIG': ['1', '20', '100', '101'],
    'AVIV-20260101': ['26', '77', '119', '128', '46', '66_a', '57_b'],
    'AVIV-20260801': ['26', '77', '119', '128', '46', '66_a', '57_b'],
    'AVIV-20270101': ['26', '77', '119', '128', '46', '66_a', '57_b'],
}
result = {}
for name, articles in fed.items():
    tree = ET.parse(root / f'{name}.xml')
    result[name] = {}
    for article in articles:
        el = tree.find(f'.//{{*}}article[@eId="art_{article}"]')
        result[name][article] = re.sub(r'\s+', ' ', ' '.join(el.itertext())).strip() if el is not None else 'NOT FOUND'
for name, articles in {'AMG': ['35'], 'GSOG': ['54'], 'FRG': ['2']}.items():
    obj = json.loads((root / f'{name}.json').read_text())['text_of_law']
    text = html.unescape(obj['selected_version']['xhtml_tol'])
    parts = re.split(r"(?=<div class='article'>)", text)
    result[name] = {'future_versions': obj['future_versions'], 'version': {k: v for k, v in obj['selected_version'].items() if k not in ['xhtml_tol', 'pdfs']}}
    for article in articles:
        chunks = [p for p in parts if re.search(r"<span class='number'>" + article + r"\s*(?:</span>|<)", p[:400])]
        result[name][article] = re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', chunks[0]))).strip() if chunks else 'NOT FOUND'
for name in ['AS-2025-814', 'AS-2026-258']:
    tree = ET.parse(root / f'{name}.xml')
    body = tree.find('.//{*}body')
    result[name] = re.sub(r'\s+', ' ', ' '.join(body.itertext())).strip()
(root / 'article-extracts.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({name: {'articles': list(arts), 'missing': [k for k, v in arts.items() if v == 'NOT FOUND']} for name, arts in result.items() if isinstance(arts, dict)}, ensure_ascii=False))
