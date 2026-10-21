from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

OUT=Path(__file__).parent
INK='#172c43'; BLUE='#eaf1f8'; EDGE='#47657f'; GREEN='#eaf4ef'; RED='#fbecec'
FONT='C:/Windows/Fonts/arial.ttf'
BOLD='C:/Windows/Fonts/arialbd.ttf'
def canvas(w,h):
    im=Image.new('RGB',(w,h),'white'); return im,ImageDraw.Draw(im)
def text(d,xy,s,size=30,bold=False,fill=INK,anchor='mm'):
    d.multiline_text(xy,s,font=ImageFont.truetype(BOLD if bold else FONT,size),fill=fill,anchor=anchor,align='center',spacing=10)
def box(d,rect,label,sub='',fill=BLUE,size=30):
    d.rounded_rectangle(rect,radius=14,fill=fill,outline=EDGE,width=3)
    x=(rect[0]+rect[2])/2;y=(rect[1]+rect[3])/2
    text(d,(x,y-40 if '\n' in sub else y-19 if sub else y),label,size,True)
    if sub:text(d,(x,y+32),sub,23)
def arrow(d,a,b,label='',color=EDGE,dash=False):
    if dash:
        dist=math.dist(a,b)
        for t in range(0,int(dist),18):
            p=t/dist;q=min(t+10,dist)/dist
            d.line((a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p,a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q),fill=color,width=3)
    else:d.line((a,b),fill=color,width=4)
    angle=math.atan2(b[1]-a[1],b[0]-a[0]);r=16
    d.polygon([b,(b[0]-r*math.cos(angle-.45),b[1]-r*math.sin(angle-.45)),(b[0]-r*math.cos(angle+.45),b[1]-r*math.sin(angle+.45))],fill=color)
    if label:text(d,((a[0]+b[0])/2,(a[1]+b[1])/2-23),label,23)
def save(im,n):im.save(OUT/f'figure-{n}.png',dpi=(300,300))

im,d=canvas(1800,1120)
text(d,(900,55),'System architecture and safety-first request routing',37,True)
nodes=[(80,130,550,265,'Next.js client','Symptom intake and response display'),(650,130,1140,265,'FastAPI gateway','Validation and request orchestration'),(650,355,1140,500,'Deterministic safety gate','Evaluate documented red-flag rules'),(1240,355,1730,500,'Emergency override','Return emergency response',RED),(650,590,1140,735,'PostgreSQL + pgvector','Query embeddings and source retrieval'),(650,825,1140,970,'Local Ollama runtime','Llama 3.2:3B with retrieved context')]
for n in nodes:box(d,n[:4],n[4],n[5],n[6] if len(n)>6 else BLUE)
arrow(d,(550,197),(650,197),'JSON');arrow(d,(895,265),(895,355));arrow(d,(1140,425),(1240,425),'Red flags');arrow(d,(895,500),(895,590),'No red flags');arrow(d,(895,735),(895,825),'Evidence + prompt')
d.line([(650,900),(315,900),(315,265)],fill=EDGE,width=4);arrow(d,(315,360),(315,265));text(d,(340,730),'Guidance, risk tier\nand source attribution',26,anchor='lm')
text(d,(900,1060),'Conceptual design described in Section 1.4',24)
save(im,'1.1')

im,d=canvas(1800,880)
text(d,(900,55),'Literature synthesis to proposed architecture',38,True)
box(d,(90,135,800,315),'Traditional rule systems','Deterministic pathways; structured input')
box(d,(1000,135,1710,315),'Commercial cloud LLMs','Conversational interaction; grounding and privacy concerns')
box(d,(430,450,1370,610),'SAHA multilingual benchmark','Multilingual dialogue and semantic representation')
arrow(d,(445,315),(700,450));arrow(d,(1355,315),(1100,450))
box(d,(320,710,1480,840),'Proposed hybrid safety RAG','Deterministic safety + retrieval + local generation',GREEN)
arrow(d,(900,610),(900,710))
save(im,'2.1')

im,d=canvas(1800,850)
text(d,(900,55),'Medical document ingestion and vectorization',38,True)
labels=[('Clinical PDF','Source title, publisher and provenance'),('Extract and clean','PDF text extraction; normalize whitespace'),('600-word chunks','100-word overlap in Section 7.4 code'),('384-dimensional embeddings','Encode each chunk into a dense vector'),('PostgreSQL + pgvector','Store chunks, source metadata and embeddings')]
for i,(a,b) in enumerate(labels):
    y=110+i*145;box(d,(380,y,1420,y+108),a,b)
    if i<4:arrow(d,(900,y+108),(900,y+145))
save(im,'4.2')

im,d=canvas(1800,1150)
text(d,(900,55),'Software components and service orchestration',38,True)
box(d,(200,130,1600,285),'Presentation tier | Next.js','Chat interface  /  symptom input  /  risk display  /  citations')
box(d,(200,390,1600,650),'Application orchestration tier | FastAPI','Authentication and validation  →  deterministic safety gate\nNon-emergency: embed query  →  retrieve  →  evidence gate  →  prompt')
arrow(d,(900,285),(900,390),'REST / JSON')
box(d,(80,800,850,1010),'Persistence tier','PostgreSQL + pgvector\nUsers, profiles, symptoms, conversations, chunks')
box(d,(950,800,1720,1010),'Local inference tier','Ollama runtime  /  Llama 3.2:3B\nContext-bounded response generation')
arrow(d,(520,650),(465,800),'SQL + vector search');arrow(d,(1280,650),(1335,800),'Prompt + retrieved evidence')
text(d,(900,1090),'Emergency matches return directly from orchestration to presentation.',27)
save(im,'6.1')

im,d=canvas(2100,2000)
text(d,(1050,48),'Emergency interception and grounded RAG interaction',38,True)
xs=[170,590,1010,1430,1850]
for x,label in zip(xs,['Next.js client','FastAPI gateway','Safety gate','PostgreSQL\n+ pgvector','Local Ollama\nLlama 3.2:3B']):
    box(d,(x-145,100,x+145,210),label,size=27)
    for y in range(210,1920,26):d.line((x,y,x,y+14),fill='#9aa9b6',width=2)
def msg(num,a,b,y,label,ret=False):
    arrow(d,(xs[a],y),(xs[b],y),dash=ret)
    text(d,((xs[a]+xs[b])/2,y-28),f'[{num:02d}] {label}',25)
msg(1,0,1,300,'POST symptoms /api/v1/triage')
msg(2,1,2,405,'Evaluate raw symptom input')
d.rectangle((25,470,2075,760),outline=EDGE,width=3)
text(d,(50,500),'alt  Case A: emergency override',27,True,anchor='lm')
msg(3,2,1,605,'Red flags matched',True);msg(4,1,0,710,'Tier 1 emergency response; bypass RAG',True)
d.rectangle((25,780,2075,1930),outline=EDGE,width=3)
text(d,(50,815),'else  Case B: non-emergency RAG',27,True,anchor='lm')
msg(5,2,1,900,'No red flags detected',True)
arrow(d,(590,960),(680,960));d.line((680,960,680,1020),fill=EDGE,width=3);arrow(d,(680,1020),(590,1020));text(d,(1010,989),'[06] Compute query embedding',25)
msg(7,1,3,1100,'Vector similarity search')
msg(8,3,1,1190,'Ranked passages + source metadata',True)
text(d,(1030,1265),'[09] Evidence gate: insufficient evidence → safe fallback',25)
text(d,(1040,1345),'[10] Assemble constrained prompt when evidence is sufficient',25)
msg(11,1,4,1440,'Send grounded prompt')
msg(12,4,1,1530,'Generated response',True)
text(d,(1010,1600),'[13] Validate and format response + citations',25)
msg(14,1,3,1700,'Persist conversation and response')
msg(15,1,0,1830,'Deliver guidance, risk indicator and citations',True)
save(im,'6.2')

im,d=canvas(1800,1600)
text(d,(900,50),'Unified relational and vector database',38,True)
def entity(rect,name,fields):
    d.rounded_rectangle(rect,radius=12,fill='white',outline=EDGE,width=3)
    x1,y1,x2,y2=rect;d.rectangle((x1+2,y1+2,x2-2,y1+65),fill=BLUE)
    text(d,((x1+x2)/2,y1+34),name,29,True)
    for j,line in enumerate(fields):text(d,(x1+22,y1+98+j*43),line,25,anchor='lm')
entity((550,115,1180,410),'users',['PK user_id','email (unique)','hashed_password','full_name / is_active'])
entity((70,550,750,820),'patient_profiles',['PK profile_id','FK user_id (unique)','age / biological_sex','known_allergies / chronic_conditions'])
entity((1030,550,1730,820),'symptom_records',['PK record_id','FK user_id','raw_input_text / extracted_symptoms','duration / severity / emergency flag'])
entity((70,940,750,1160),'conversations',['PK conversation_id','FK user_id','title / started_at / ended_at'])
entity((1030,940,1730,1200),'messages',['PK message_id','FK conversation_id','content / sender_type / risk tier','bypassed_ai / retrieval_latency_ms'])
entity((70,1300,750,1540),'medical_documents',['PK document_id','title / author_publisher','publication_year / file_path'])
entity((1030,1300,1730,1560),'medical_knowledge_chunks',['PK chunk_id  /  FK document_id','chapter / chunk_index / chunk_text','token_count / embedding vector(384)'])
arrow(d,(650,410),(410,550),'1 → 0..1');arrow(d,(1080,410),(1380,550),'1 → 0..*')
d.line([(550,260),(25,260),(25,1050)],fill=EDGE,width=3);arrow(d,(25,1050),(70,1050));text(d,(270,900),'users 1 → 0..*',24)
arrow(d,(750,1050),(1030,1050),'1 → 0..*');arrow(d,(750,1430),(1030,1430),'1 → 0..*')
text(d,(900,1250),'Knowledge tables are independent of patient records.',24)
save(im,'8.1')
print('Created six figures')
