"""Conservative CDC main-article extraction; never ingest whole-site chrome."""
from html.parser import HTMLParser
import hashlib
import re

EXTRACTOR_VERSION = 'cdc-sections-v1'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}


class CDCArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]
        self.capture=None
        self.block=None
        self.parts=[]
        self.section='Overview'
        self.sections=[]
        self.title=''

    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in VOID:return
        classes=attrs.get('class','').split()
        blocked=tag in {'nav','aside','script','style','footer','form','figure','table'} or any(x in classes for x in ('dfe-section__nav','cdc-dfe-body__right','cdc-page-tools'))
        self.stack.append((tag,blocked))
        if 'cdc-dfe-body__center' in classes:self.capture=len(self.stack)
        # CDC title is outside center article; retain only h1 data separately.
        if tag=='h1' and self.block is None:self.block=(tag,len(self.stack));self.parts=[]
        if self.capture and not any(b for _,b in self.stack) and tag in {'h2','h3','h4','p','li'} and self.block is None:
            self.block=(tag,len(self.stack));self.parts=[]

    def handle_data(self,data):
        if self.block and not any(b for _,b in self.stack):self.parts.append(data)

    def handle_endtag(self,tag):
        if tag in VOID:return
        if self.block and self.block==(tag,len(self.stack)):
            value=re.sub(r'\s+',' ',''.join(self.parts)).strip()
            if tag=='h1':self.title=value
            elif tag in {'h2','h3','h4'}:
                self.section=value
            elif value:self.sections.append({'heading':self.section,'text':value})
            self.block=None;self.parts=[]
        if self.capture==len(self.stack):self.capture=None
        # Tolerate ordinary implicit closing tags without admitting navigation.
        if self.stack and self.stack[-1][0]==tag:self.stack.pop()


def extract_cdc_article(html:str)->dict:
    parser=CDCArticleParser();parser.feed(html)
    if not parser.title or len(parser.sections)<2:raise ValueError('CDC main article missing; extraction failed closed')
    content='\n'.join(s['text'] for s in parser.sections)
    if len(content)<300:raise ValueError('Article too short for reviewed ingestion')
    if re.search(r'copyright|all rights reserved',content,re.I):raise ValueError('Explicit reuse restriction needs manual review')
    return {'title':parser.title,'sections':parser.sections,'extractor':EXTRACTOR_VERSION,
            'content_sha256':hashlib.sha256(content.encode()).hexdigest()}


def section_chunks(article:dict,max_chars:int=500)->list[dict]:
    """Preserve adjacent paragraphs within a heading; split at word boundaries."""
    if max_chars<100:raise ValueError('Chunk size too small')
    chunks=[];current='';heading=None
    def flush():
        nonlocal current
        if current:
            chunks.append({'content':current,'section_title':heading or 'Overview'})
            current=''
    for part in article['sections']:
        if part['heading']!=heading:flush();heading=part['heading']
        # Do not turn US service pathways into Indian emergency/referral advice.
        # Excluded verbatim blocks remain in the archived source for audit.
        if re.search(r'\b(?:911|988|1-800|Medicare|Medicaid)\b',part['text']):flush();continue
        for word in part['text'].split():
            if len(word)>max_chars:raise ValueError('Malformed overlong source token')
            if current and len(current)+len(word)+1>max_chars:flush()
            current=(current+' '+word).strip()
    flush()
    seen=set();result=[]
    for chunk in chunks:
        digest=hashlib.sha256(chunk['content'].encode()).hexdigest()
        if digest not in seen:
            seen.add(digest);result.append({**chunk,'content_sha256':digest,'chunk_index':len(result)})
    return result
