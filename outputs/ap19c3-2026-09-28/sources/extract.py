"""Parse official source files for the bounded AP19C3 article comparison."""
import copy
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parent
articles = {
    'ATSG': ['2', '38', '39', '40', '41', '49', '51', '52', '55', '56', '57', '58', '60', '61'],
    'KVG-20260101': ['1', '1_a', '3', '25', '25_a', '53', '54', '61', '64', '64_a', '67', '80', '85', '87', '89'],
    'KVG-20260701': ['1', '1_a', '3', '25', '25_a', '53', '54', '61', '64', '64_a', '67', '80', '85', '87', '89'],
}
normal = lambda text: re.sub(r'\s+', ' ', text).strip()
result = {}
for name, numbers in articles.items():
    tree = ET.parse(root / f'{name}.xml')
    result[name] = {}
    for number in numbers:
        article = tree.find(f'.//{{*}}article[@eId="art_{number}"]')
        assert article is not None, (name, number)
        body = copy.deepcopy(article)
        notes = body.findall('.//{*}authorialNote')
        for parent in body.iter():
            for child in list(parent):
                if child.tag.endswith('}authorialNote'):
                    # Preserve following article text when stripping notes.
                    index = list(parent).index(child)
                    if index:
                        previous = list(parent)[index - 1]
                        previous.tail = (previous.tail or '') + (child.tail or '')
                    else:
                        parent.text = (parent.text or '') + (child.tail or '')
                    parent.remove(child)
        result[name][number] = {
            'normText': normal(' '.join(body.itertext())),
            'notes': [normal(' '.join(note.itertext())) for note in notes],
            'fullText': normal(' '.join(article.itertext())),
        }
for name, numbers in {'GSOG': ['54'], 'FRG': ['2']}.items():
    law = json.loads((root / f'{name}.json').read_text())['text_of_law']
    selected = law['selected_version']
    chunks = re.split(r"(?=<div class='article'>)", selected['xhtml_tol'])
    result[name] = {
        'future_versions': law['future_versions'],
        'version': {key: selected[key] for key in ['id', 'version_dates_str', 'title', 'pdf_link_tol']},
    }
    for number in numbers:
        matches = [chunk for chunk in chunks if re.search(r"<span class='number'>" + number + r'\s*</span>', chunk[:400])]
        assert len(matches) == 1, (name, number, len(matches))
        result[name][number] = normal(html.unescape(re.sub('<[^>]+>', ' ', matches[0])))

relevant = ['1', '1_a', '25', '64', '67', '80', '85', '87', '89']
result['comparison'] = {
    'relevantArticles': relevant,
    'identicalNormText': all(result['KVG-20260101'][a]['normText'] == result['KVG-20260701'][a]['normText'] for a in relevant),
    'identicalFullTextIncludingNotes': all(result['KVG-20260101'][a]['fullText'] == result['KVG-20260701'][a]['fullText'] for a in relevant),
    'outsideScopeChangedArticlesRead': ['53', '54'],
    'additionalProductExclusionArticlesRead': ['3', '25_a', '61', '64_a'],
}
assert result['comparison']['identicalNormText']
(root / 'article-extracts.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result['comparison'], ensure_ascii=False))
print(json.dumps({name: result[name] for name in ['GSOG', 'FRG']}, ensure_ascii=False, indent=2))
