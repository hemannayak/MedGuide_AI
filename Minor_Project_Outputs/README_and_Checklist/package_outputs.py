from pathlib import Path
import csv,hashlib,json,zipfile
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'Minor_Project_Outputs';CHECK=OUT/'README_and_Checklist'
rows=[
('1.1','System architecture','1.4','System_Architecture','Architecture_and_Database_Diagrams','Generated diagram','Verified implementation diagram; guide differs','Next.js, FastAPI, safety gate, vector database, configured gateway and optional Ollama','Current provider is Groq; local Ollama is shown as an alternative, not the active app path.','System Architecture of the Medical Triage & Clinical RAG Assistant.','Implemented MedGuide AI architecture with deterministic emergency routing and a configurable inference gateway.'),
('4.1','Ingestion and vectorization','4.3.2','Ingestion_Vectorization_Pipeline','Architecture_and_Database_Diagrams','Generated diagram','Verified current code; guide differs','PDF extraction, page metadata, chunking, 384-d embeddings, pgvector','Actual 500-character / 50-character windows and multilingual MiniLM-L12; not 600/100 tokens or L6.','Medical Document Ingestion, Semantic Chunking, and Vectorization Pipeline.','Implemented PDF text extraction, character-window chunking and multilingual MiniLM-L12 vectorization.'),
('4.2','Docker deployment architecture','4.5.1','Docker_Deployment_Architecture','Architecture_and_Database_Diagrams','Illustrative proposed diagram','Proposed only; Docker implementation pending','Four guide services, browser access and conceptual bridge connections','No Compose file or Dockerfiles found. Diagram is explicitly not evidence of a running deployment.','Local Multi-Container Deployment Architecture using Docker Compose.','Proposed Docker service mapping; current verified execution uses host processes.'),
('5.1','FastAPI Swagger documentation','5.3.2','FastAPI_Swagger_Docs','Backend_Screenshots','Genuine application screenshot','Captured and verified','Actual Swagger UI, authentication, symptoms/analyze and ai/chat routes','No /api/v1/triage or /api/v1/ingest. Specific auth routes exist.','FastAPI OpenAPI/Swagger Interactive Backend Documentation and Endpoints.','FastAPI Swagger documentation showing the implemented authentication, symptom-triage and AI chat APIs.'),
('5.2','Ollama model execution','5.3.4','Ollama_Model_Execution','Backend_Screenshots','Genuine browser screenshot of real CLI transcript','Execution verified; native terminal recapture pending','Requested Llama 3.2:3B CLI command and actual response','Model installed and CLI exit 0. This image is labelled a transcript view, not a native terminal screenshot. Follow README native recapture steps.','Local Execution and Prompt Verification of Quantized Llama 3.2:3B via Ollama CLI.','Actual Llama 3.2:3B CLI execution transcript displayed in a browser proof view.'),
('6.1','Software component architecture','6.1.1','Component_Architecture','Architecture_and_Database_Diagrams','Generated diagram','Verified implementation diagram','UI, ApiClient, auth_service, safety/RAG functions, gateway and database','Uses real module/function names; guide service class names are conceptual.','High-Level Software Component and Service Orchestration Architecture.','Implemented frontend components and FastAPI service orchestration.'),
('6.2','UML sequence diagram','6.4','UML_Sequence_Diagram','Architecture_and_Database_Diagrams','Generated diagram','Verified implementation diagram','Auth/consent, conversation persistence, emergency bypass, retrieval/evidence/generation','No unsupported latency claim. Current generation provider is Groq, optional Ollama is documented.','UML Sequence Diagram of Deterministic Emergency Interception and Grounded RAG Flow.','Sequence of deterministic emergency interception and evidence-gated chat generation.'),
('7.1','Default frontend chat','7.8','Default_Chat_Interface','Frontend_Screenshots','Genuine application screenshot','Captured; guide-specific controls absent','Actual authenticated chat header, natural-language input, example prompts and voice control','No 100% local claim or duration/severity chips in chat; those form controls belong to /app/symptoms.','Next.js Chat Interface Featuring Natural Language Symptom Intake and Contextual Chips.','Actual Next.js health companion with multilingual example prompts and natural-language input.'),
('7.2','Emergency scenario','7.8, 7.9','Tier_1_Emergency','Frontend_Screenshots','Genuine application screenshot','Captured and emergency bypass verified','Severe crushing chest pain radiating to the left arm and jaw.','Actual heading differs; red escalation badge and 108/112 shown. Separate guard test proves zero retrieval calls, not sub-15ms latency.','Frontend Output for Tier 1 Emergency Interception Bypassing AI Generation.','Actual emergency escalation output for the specified synthetic chest-pain input.'),
('7.3','Moderate-risk requested scenario','7.8, 7.9','Tier_2_Moderate_Risk','Frontend_Screenshots','Genuine application screenshot','Captured actual output; requested tier presentation unmet','High fever of 102°F for 3 days with persistent painful cough.','Cautious consultation advice and citations returned; no amber tier badge, explicit timeframe or dedicated warning-sign list. Do not claim those are implemented.','Frontend Output for Tier 2 Moderate Acuity Guidance.','Actual cautious consultation response to the synthetic fever and cough scenario; no moderate-tier classification is displayed.'),
('7.4','Low-risk requested scenario','7.8, 7.9','Tier_3_Home_Care','Frontend_Screenshots','Genuine application screenshot','Captured actual output; requested home-care result unmet','Mild runny nose and sneezing since yesterday, no fever.','Response explains evidence gap and recommends professional advice; no green badge or rest/hydration home-care advice was produced.','Frontend Output for Tier 3 Low-Acuity Supportive Home Care Guidance.','Actual evidence-limited response to the synthetic runny-nose scenario; supportive home care was not generated.'),
('7.5','Medical sources inspector','7.10','Verified_Medical_Sources','Frontend_Screenshots','Genuine application screenshot','Captured actual inline inspector; modal absent','Actual retrieved WHO titles, publisher, inferred sections and page metadata','Existing control expands inline, not as a modal. Screenshot shows visible source cards; no titles or chapter metadata were invented.','Frontend Evidence Inspector Modal Displaying Grounded Clinical Source Citations.','Expanded inline evidence inspector showing the response’s actual retrieved WHO source metadata.'),
('8.1','Database ER diagram','8.1, 8.2','Database_ER_Diagram','Architecture_and_Database_Diagrams','Generated diagram from live schema','Verified live schema subset','Actual UUID PKs, FKs, columns and vector(384), with document/chunk relationship','Guide messages/medical_knowledge_chunks mapped to real conversation_messages/knowledge_chunks; live database contains 27 tables.','Entity-Relationship (ER) Schema of the Unified Relational and Vector Database.','Relevant subset of the live relational and pgvector schema with actual table names and keys.'),
('8.2','pgvector similarity query','8.5.1','Pgvector_Query_Output','Backend_Screenshots','Genuine browser screenshot of real psql transcript','Query and scores verified; native terminal recapture pending','Real compatible query vector, prepared SQL, nearest three rows and cosine scores','Actual scores 0.8668233, 0.8650898, 0.8644827; target >0.65 achieved for this query. Image is explicitly a browser transcript view. Historical model metadata missing; three sampled re-encodings agree with current encoder.','PostgreSQL psql Console Output Demonstrating Cosine Similarity Vector Retrieval via pgvector.','Actual prepared psql cosine-retrieval output displayed in a browser transcript view.')
]
fields=['figure','title','report_section','expected_filename','evidence_type','status','required_content','verification_and_remaining_steps','requested_caption','recommended_accurate_caption']
items=[]
for number,title,section,suffix,folder,evidence,status,content,notes,caption,accurate in rows:
 name=f'Figure_{number.replace(".","_")}_{suffix}.png'
 f=OUT/folder/name
 # Browser JPEG to PNG changes encoding only, never screenshot contents.
 if f.with_suffix('.jpg').exists(): Image.open(f.with_suffix('.jpg')).convert('RGB').save(f)
 assert f.exists(),str(f)
 with Image.open(f) as im: im.verify()
 items.append(dict(zip(fields,[number,title,section,str(Path(folder)/name),evidence,status,content,notes,f'Figure {number}: {caption}',f'Figure {number}: {accurate}'])))
with (CHECK/'MASTER_CHECKLIST.csv').open('w',encoding='utf-8-sig',newline='') as file:
 w=csv.DictWriter(file,fieldnames=fields);w.writeheader();w.writerows(items)
(CHECK/'MASTER_CHECKLIST.json').write_text(json.dumps(items,indent=2,ensure_ascii=False),encoding='utf-8')
md='# Master checklist for 14 report figures\n\nAll filenames follow the latest execution prompt. Status describes actual verification, not the guide’s hoped-for output. See README.md before inserting captions.\n\n'
md+='| Figure | Report section | Evidence | Status | File |\n|---|---|---|---|---|\n'
for i in items: md+='| '+ ' | '.join(i[k].replace('|','/') for k in ['figure','report_section','evidence_type','status','expected_filename'])+' |\n'
for i in items:
 md+=f"\n## Figure {i['figure']} {i['title']}\n\n- Required content: {i['required_content']}\n- Verification and remaining steps: {i['verification_and_remaining_steps']}\n- Requested caption: {i['requested_caption']}\n- Recommended accurate caption: {i['recommended_accurate_caption']}\n"
(CHECK/'MASTER_CHECKLIST.md').write_text(md,encoding='utf-8')
files=[OUT/i['expected_filename'] for i in items]
files+=list((OUT/'Editable_Diagram_Sources').glob('*.puml'))+list((OUT/'Editable_Diagram_Sources').glob('*.py'))
files += [f for f in CHECK.iterdir() if f.is_file() and f.name not in {'source_report_text.txt','FILE_MANIFEST.json','diagram_review.png','screenshot_review.png','ollama_response.txt','show_ollama.ps1','show_psql.ps1'}]
manifest=[]
for f in sorted(set(files)):
 entry={'file':str(f.relative_to(OUT)),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
 if f.suffix=='.png':
  with Image.open(f) as im:entry['dimensions']=im.size
 manifest.append(entry)
(CHECK/'FILE_MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
files.append(CHECK/'FILE_MANIFEST.json')
archive=ROOT/'Minor_Project_Outputs.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(set(files)):z.write(f,Path('Minor_Project_Outputs')/f.relative_to(OUT))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert sum(n.endswith('.png') for n in z.namelist())==14
 print('Verified ZIP:',len(z.namelist()),'files; 14 PNG figures; archive bytes',archive.stat().st_size)
