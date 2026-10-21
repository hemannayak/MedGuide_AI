from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree
from copy import deepcopy
from io import BytesIO
import json,hashlib
from docx import Document
from docx.shared import Cm,Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image

ROOT=Path(__file__).parent
SOURCE=Path(r'C:\Users\Pangoth\AppData\Local\Packages\sandbox.{dc9409c8-d3bc-4f19-8444-c52f55839c13}\AC\Temp/browser-use/exports/Mini Project Report Official-b19a494d-e112-4b07-83f6-0825d35b6ba9.docx')
OUTPUT=ROOT/'Minor Project Report - Required Figures.docx'
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'}
RNS='http://schemas.openxmlformats.org/package/2006/relationships'
CTNS='http://schemas.openxmlformats.org/package/2006/content-types'
ITEMS=[
('1.1',53,'System Architecture of the Medical Triage & Clinical RAG Assistant'),
('2.1',137,'Conceptual Evolution from Literature Review and SAHA Benchmark to Proposed Architecture'),
('4.2',237,'Medical Document Ingestion, Semantic Chunking, and Vectorization Pipeline'),
('6.1',544,'High-Level Software Component and Service Orchestration Architecture'),
('6.2',586,'UML Sequence Diagram of Deterministic Emergency Interception and Grounded RAG Flow'),
('7.1',953,'Next.js Chatbot Interface featuring Symptom Intake and Risk-Level Highlighting'),
('7.2',1119,'Verified Clinical Source Citation Modal and Attribution Cards'),
('8.1',1195,None),
]
with ZipFile(SOURCE) as z: parts={x.filename:z.read(x.filename) for x in z.infolist()}
doc=etree.fromstring(parts['word/document.xml']);body=doc.find('w:body',NS)
original_children=list(body)
original_serial=[etree.tostring(x,method='c14n') for x in original_children]
ps=body.findall('w:p',NS)
rels=etree.fromstring(parts['word/_rels/document.xml.rels'])
cts=etree.fromstring(parts['[Content_Types].xml'])
inserted=[];audit=[]
def para(keep=False):
    d=Document();p=d.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before=Pt(0);p.paragraph_format.space_after=Pt(0)
    p.paragraph_format.line_spacing=1
    p.paragraph_format.keep_with_next=keep
    r=p.add_run();r.font.name='Times New Roman';r.font.size=Pt(12)
    return d,p
def blank(keep=False):
    d,p=para(keep);return deepcopy(p._p)
for index,(num,anchor,title) in enumerate(ITEMS,1):
    image=ROOT/f'figure-{num}.{ "jpg" if num.startswith("7.") else "png"}'
    w,h=Image.open(image).size
    width=min(15.5,21.0*w/h) # Fit the tall sequence on one A4 page with its caption.
    d,p=para(True)
    p.runs[0].add_picture(str(image),width=Cm(width))
    node=deepcopy(p._p)
    old_rid=node.xpath('.//@r:embed')[0]
    new_rid=f'rIdReportFigure{index}'
    for x in node.xpath('.//*[@r:embed]'):x.set('{'+NS['r']+'}embed',new_rid)
    for x in node.xpath('.//wp:docPr'):
        x.set('id',str(10000+index));x.set('name',f'Figure {num}');x.set('descr',title or 'Entity-Relationship (ER) Diagram of the Unified Relational and Vector Database')
    filename=f'report-figure-{num}'+image.suffix
    relation=etree.SubElement(rels,'{'+RNS+'}Relationship',Id=new_rid,Type=NS['r']+'/image',Target='media/'+filename)
    parts['word/media/'+filename]=image.read_bytes()
    extension=image.suffix[1:]
    if not cts.xpath(f'ct:Default[@Extension="{extension}"]',namespaces={'ct':CTNS}):
        etree.SubElement(cts,'{'+CTNS+'}Default',Extension=extension,ContentType='image/jpeg' if extension=='jpg' else 'image/png')
    block=[blank(True),node]
    if title:
        d,p=para(False);r=p.runs[0];r.text=f'Figure {num}: {title}';r.bold=True
        block.extend([deepcopy(p._p),blank()])
        position=body.index(ps[anchor])+1
    else:
        # Reuse the existing bold centered Figure 8.1 caption without touching it.
        position=body.index(ps[anchor])
    for offset,x in enumerate(block):body.insert(position+offset,x);inserted.append(x)
    audit.append({'figure':num,'width_cm':round(width,3),'height_cm':round(width*h/w,3),'anchor_paragraph':anchor,'existing_caption_reused':title is None})
remaining=[x for x in body if x not in inserted]
assert len(remaining)==len(original_children)
assert [etree.tostring(x,method='c14n') for x in remaining]==original_serial,'Existing content or formatting changed'
parts['word/document.xml']=etree.tostring(doc,xml_declaration=True,encoding='UTF-8',standalone=True)
parts['word/_rels/document.xml.rels']=etree.tostring(rels,xml_declaration=True,encoding='UTF-8',standalone=True)
parts['[Content_Types].xml']=etree.tostring(cts,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(OUTPUT,'w',ZIP_DEFLATED) as z:
    for name,data in parts.items():z.writestr(name,data)
changed={'word/document.xml','word/_rels/document.xml.rels','[Content_Types].xml'}
with ZipFile(SOURCE) as a,ZipFile(OUTPUT) as b:
    unchanged=[name for name in a.namelist() if name not in changed]
    assert all(a.read(name)==b.read(name) for name in unchanged)
result={'original_body_elements_unchanged':len(original_children),'original_package_parts_byte_identical':len(unchanged),'new_figures':8,'original_images_preserved':5,'max_width_cm':15.5,'figures':audit,'output':str(OUTPUT)}
(ROOT/'preservation-audit.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
