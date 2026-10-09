"""Native-preserving completion of the Artifact-authored AP18A V0.4 extension.

Existing worksheets/styles/tables retain their delivered native metadata.
Only the requested text cells and one hyperlink change. The new worksheet is
imported with remapped style IDs, native protection and a new table relationship.
"""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / '.work/ap18a/qa-v04'
CHECKS = json.loads((QA / 'checks.json').read_text())
SOURCE = Path(CHECKS['source'])
FINAL = Path(CHECKS['file'])
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
P = 'http://schemas.openxmlformats.org/package/2006/relationships'
NS = {'s': N}
T = '{'+N+'}'
ET.register_namespace('', N)

def read(file):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        return {name:z.read(name) for name in z.namelist()}

def xml(node):
    # OPC's package readers expect package manifests in their default namespace.
    namespace=node.tag.split('}')[0].lstrip('{')
    ET.register_namespace('',namespace)
    return ET.tostring(node, encoding='utf-8', xml_declaration=True)

def strings(parts):
    return [''.join(e.itertext()) for e in ET.fromstring(parts['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in parts else []

def inline(cell, value):
    for child in list(cell):
        cell.remove(child)
    cell.set('t', 'inlineStr')
    ET.SubElement(ET.SubElement(cell, T+'is'), T+'t').text = value

def text_value(cell, pool):
    if cell.get('t') == 's':
        return pool[int(cell.find('s:v', NS).text)]
    if cell.get('t') == 'inlineStr':
        return ''.join(cell.find('s:is', NS).itertext())
    if cell.get('t') == 'str':
        return cell.find('s:v', NS).text or ''
    raise AssertionError(('Expected authored text', cell.get('r')))

original = read(SOURCE)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == '7fc8663e35e5f579b951da75fdc57e364d6a3dff8758cbb9f564a0e2fed22bfc'
parts = dict(original)
authored = read(QA/'artifact-export.xlsx')
pool = strings(authored)
changes = {1:['A6','A30','A36'], 6:['H11']}
for index, addresses in changes.items():
    key = f'xl/worksheets/sheet{index}.xml'
    before = ET.fromstring(parts[key])
    after = ET.fromstring(authored[key])
    cells = {c.get('r'):c for c in before.findall('s:sheetData/s:row/s:c',NS)}
    author_cells = {c.get('r'):c for c in after.findall('s:sheetData/s:row/s:c',NS)}
    for address in addresses:
        inline(cells[address],text_value(author_cells[address],pool))
    parts[key]=xml(before)

# Preserve native link identity, change only its requested target.
source_sheet=ET.fromstring(parts['xl/worksheets/sheet6.xml'])
link=next(e for e in source_sheet.findall('s:hyperlinks/s:hyperlink',NS) if e.get('ref')=='E11')
rel_key='xl/worksheets/_rels/sheet6.xml.rels'
rels=ET.fromstring(parts[rel_key])
next(e for e in rels if e.get('Id')==link.get('{'+R+'}id')).set('Target',CHECKS['bjUrl'])
parts[rel_key]=xml(rels)

# Append style dependencies rather than rewriting any old effective style.
base_styles=ET.fromstring(parts['xl/styles.xml'])
new_styles=ET.fromstring(authored['xl/styles.xml'])
maps={}
for name in ['fonts','fills','borders']:
    dst=base_styles.find('s:'+name,NS)
    src=new_styles.find('s:'+name,NS)
    offset=len(dst)
    maps[name]={i:offset+i for i in range(len(src))}
    dst.extend(deepcopy(list(src)))
    dst.set('count',str(len(dst)))
dst_fmts=base_styles.find('s:numFmts',NS)
if dst_fmts is None:
    dst_fmts=ET.Element(T+'numFmts',{'count':'0'})
    base_styles.insert(0,dst_fmts)
formats={int(e.get('numFmtId')):int(e.get('numFmtId')) for e in dst_fmts}
next_fmt=max([163]+[int(e.get('numFmtId')) for e in dst_fmts])+1
src_fmts=new_styles.find('s:numFmts',NS)
if src_fmts is not None:
    for fmt in src_fmts:
        match=next((e for e in dst_fmts if e.get('formatCode')==fmt.get('formatCode')),None)
        if match is None:
            match=deepcopy(fmt)
            match.set('numFmtId',str(next_fmt))
            next_fmt+=1
            dst_fmts.append(match)
        formats[int(fmt.get('numFmtId'))]=int(match.get('numFmtId'))
dst_fmts.set('count',str(len(dst_fmts)))

def remap_xf(xf):
    out=deepcopy(xf)
    for field,group in [('fontId','fonts'),('fillId','fills'),('borderId','borders')]:
        if field in out.attrib:
            out.set(field,str(maps[group][int(out.get(field))]))
    if 'numFmtId' in out.attrib:
        old=int(out.get('numFmtId'))
        out.set('numFmtId',str(formats.get(old,old)))
    return out

style_xfs=base_styles.find('s:cellStyleXfs',NS)
style_offset=len(style_xfs)
style_xfs.extend(remap_xf(e) for e in new_styles.find('s:cellStyleXfs',NS))
style_xfs.set('count',str(len(style_xfs)))
xfs=base_styles.find('s:cellXfs',NS)
xf_offset=len(xfs)
for xf in new_styles.find('s:cellXfs',NS):
    added=remap_xf(xf)
    if 'xfId' in added.attrib:
        added.set('xfId',str(int(added.get('xfId'))+style_offset))
    xfs.append(added)
dxfs=base_styles.find('s:dxfs',NS)
dxf_offset=len(dxfs)
src_dxfs=new_styles.find('s:dxfs',NS)
if src_dxfs is not None:
    dxfs.extend(deepcopy(list(src_dxfs)))
dxfs.set('count',str(len(dxfs)))

new_sheet=ET.fromstring(authored['xl/worksheets/sheet9.xml'])
protected={}
for cell in new_sheet.findall('s:sheetData/s:row/s:c',NS):
    if cell.get('t')=='s':
        inline(cell,text_value(cell,pool))
    old=int(cell.get('s','0'))+xf_offset
    row=int(re.search(r'\d+',cell.get('r'))[0])
    locked=not 7<=row<=12
    key=(old,locked)
    if key not in protected:
        xf=deepcopy(xfs[old])
        for item in list(xf):
            if item.tag==T+'protection':
                xf.remove(item)
        xf.set('applyProtection','1')
        ET.SubElement(xf,T+'protection',{'locked':'1' if locked else '0','hidden':'0'})
        protected[key]=len(xfs)
        xfs.append(xf)
    cell.set('s',str(protected[key]))
for rule in new_sheet.findall('s:conditionalFormatting/s:cfRule',NS):
    if rule.get('dxfId') is not None:
        rule.set('dxfId',str(int(rule.get('dxfId'))+dxf_offset))
xfs.set('count',str(len(xfs)))
parts['xl/styles.xml']=xml(base_styles)
pane=new_sheet.find('s:sheetViews/s:sheetView/s:pane',NS)
pane.attrib.update({'xSplit':'1','ySplit':'6','topLeftCell':'B7','activePane':'bottomRight','state':'frozen'})
for old in list(new_sheet):
    if old.tag==T+'sheetProtection':
        new_sheet.remove(old)
protection=ET.Element(T+'sheetProtection',{'sheet':'1','objects':'1','scenarios':'1','autoFilter':'0','sort':'0','selectLockedCells':'0','selectUnlockedCells':'0'})
after=max(i for i,e in enumerate(new_sheet) if e.tag in [T+'sheetData',T+'sheetCalcPr'])
new_sheet.insert(after+1,protection)
table_part=new_sheet.find('s:tableParts/s:tablePart',NS)
table_part.set('{'+R+'}id','ap18AreaTable')
parts['xl/worksheets/sheet9.xml']=xml(new_sheet)
new_rels=ET.Element('{'+P+'}Relationships')
ET.SubElement(new_rels,'{'+P+'}Relationship',{'Id':'ap18AreaTable','Type':R+'/table','Target':'../tables/table8.xml'})
parts['xl/worksheets/_rels/sheet9.xml.rels']=xml(new_rels)
new_table=next(ET.fromstring(value) for key,value in authored.items() if key.startswith('xl/tables/') and key.endswith('.xml') and ET.fromstring(value).get('name')=='AP18_Gebietszuordnungen')
assert 'xl/tables/table8.xml' not in parts
new_table.set('id','8')
parts['xl/tables/table8.xml']=xml(new_table)

workbook=ET.fromstring(parts['xl/workbook.xml'])
sheets=workbook.find('s:sheets',NS)
assert len(sheets)==8
# Insert after Geltungsbereiche while preserving all existing worksheet IDs.
sheets.insert(5,ET.Element(T+'sheet',{'name':'Gebietszuordnungen','sheetId':'9','{'+R+'}id':'ap18AreaSheet'}))
parts['xl/workbook.xml']=xml(workbook)
rels=ET.fromstring(parts['xl/_rels/workbook.xml.rels'])
assert not any(e.get('Id')=='ap18AreaSheet' for e in rels)
ET.SubElement(rels,'{'+P+'}Relationship',{'Id':'ap18AreaSheet','Type':R+'/worksheet','Target':'worksheets/sheet9.xml'})
parts['xl/_rels/workbook.xml.rels']=xml(rels)
CT='http://schemas.openxmlformats.org/package/2006/content-types'
types=ET.fromstring(parts['[Content_Types].xml'])
for part,kind in [('/xl/worksheets/sheet9.xml','worksheet'),('/xl/tables/table8.xml','table')]:
    ET.SubElement(types,'{'+CT+'}Override',{'PartName':part,'ContentType':'application/vnd.openxmlformats-officedocument.spreadsheetml.'+kind+'+xml'})
parts['[Content_Types].xml']=xml(types)
# Keep application metadata consistent with the ninth visible worksheet.
app=ET.fromstring(parts['docProps/app.xml']) if 'docProps/app.xml' in parts else None
vt='{http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes}'
ap='{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}'
titles=app.find(ap+'TitlesOfParts/'+vt+'vector') if app is not None else None
if titles is not None:
    titles[:]=[ET.Element(vt+'lpstr') for _ in sheets]
    for item,sheet in zip(titles,sheets):
        item.text=sheet.get('name')
    titles.set('size',str(len(sheets)))
heading=app.find(ap+'HeadingPairs/'+vt+'vector') if app is not None else None
if heading is not None:
    for value in heading.iter(vt+'i4'):
        value.text='9'
if app is not None:
    parts['docProps/app.xml']=xml(app)

# All pre-existing worksheet content is unchanged apart from four explicit cells.
checked=0
for i in range(1,9):
    key=f'xl/worksheets/sheet{i}.xml'
    before=ET.fromstring(original[key])
    after=ET.fromstring(parts[key])
    a={c.get('r'):c for c in before.findall('s:sheetData/s:row/s:c',NS)}
    b={c.get('r'):c for c in after.findall('s:sheetData/s:row/s:c',NS)}
    assert set(a)==set(b)
    for address,cell in a.items():
        if address not in changes.get(i,[]):
            assert xml(cell)==xml(b[address]),(i,address)
            checked+=1
        else:
            assert cell.get('s')==b[address].get('s')
    if i not in changes:
        assert original[key]==parts[key]
assert all(original[k]==parts[k] for k in original if k.startswith('xl/tables/'))
assert len(new_table.find('s:tableColumns',NS))==18
assert new_table.get('ref')=='A6:R12'
assert not any('vbaProject' in key or 'externalLinks/' in key or key.endswith('connections.xml') for key in parts)
for key,value in parts.items():
    if key.endswith('.xml') or key.endswith('.rels'):
        node=ET.fromstring(value)
        assert not node.findall('.//s:c[@t="e"]',NS),key
        assert b'/Users/' not in value and b'justice.be.ch' not in value,key
with zipfile.ZipFile(FINAL,'w',zipfile.ZIP_DEFLATED) as z:
    for key,value in parts.items():
        z.writestr(key,value)
read(FINAL)
audit={'sha256':hashlib.sha256(FINAL.read_bytes()).hexdigest(),'sourceUnchanged':hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='7fc8663e35e5f579b951da75fdc57e364d6a3dff8758cbb9f564a0e2fed22bfc','unchangedExistingCells':checked,'changedExistingCells':4,'sheets':9,'tables':8,'assignments':6,'newInputCellsUnlocked':108,'sourceHyperlinks':5,'formulaErrorCells':0,'macros':False,'externalDataConnections':False}
(QA/'native-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit))
