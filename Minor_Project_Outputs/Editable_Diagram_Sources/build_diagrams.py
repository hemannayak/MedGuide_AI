"""Report diagrams from inspected implementation; no application/data changes."""
from pathlib import Path
import json, subprocess, shutil, re
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'Minor_Project_Outputs'
SRC=OUT/'Editable_Diagram_Sources'
STYLE='''@startuml
!pragma layout smetana
skinparam dpi 220
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam defaultFontSize 17
skinparam shadowing false
skinparam roundCorner 12
skinparam ArrowColor #44675F
skinparam componentStyle rectangle
skinparam rectangleBackgroundColor #E8F3EF
skinparam databaseBackgroundColor #F6F1E8
skinparam sequenceParticipantBackgroundColor #E8F3EF
skinparam sequenceGroupBackgroundColor #FFFFFF
'''
diagrams={
'Figure_1_1_System_Architecture': '''title MedGuide AI implemented system architecture
rectangle "Next.js 16 frontend :3000\nAuthenticated health companion" as UI
rectangle "FastAPI :8000\nJWT authorization and account consent" as API
rectangle "Deterministic safety gate\nDocumented red-flag patterns" as SG
rectangle "Emergency response\nNo retrieval or LLM call" as ER #FBE7E7
rectangle "Query embedding and retrieval\nMultilingual MiniLM-L12-v2, 384 dimensions" as RET
database "PostgreSQL 18 + pgvector\nknowledge_chunks + medical_documents\nAccount and care records" as DB
rectangle "Evidence sufficiency gate\nInsufficient evidence -> safe refusal" as EG
rectangle "AI gateway\nCurrent configuration: Groq\nqwen/qwen3.8-27b" as AI
rectangle "Ollama :11434\nOptional local provider\nSeparate CLI proof, not current app default" as OL
UI --> API : Authenticated request
API --> SG
SG -right-> ER : Red flags
ER --> API : Immediate escalation text
SG --> RET : Non-emergency
RET <--> DB : Cosine vector search
RET --> EG : Retrieved evidence
EG --> AI : Sufficient context
AI ..> OL : Alternative provider
AI --> API : Output validation and citations
API --> UI : Response type + text + sources
note bottom : Verified against repository and runtime configuration on 23 October 2026.\nNo claim of fully local inference for the current Groq configuration.
''',
'Figure_4_1_Ingestion_Vectorization_Pipeline': '''title Actual medical document ingestion and vectorization
start
:Official PDF with verified provenance\nTitle, publisher and source reference;
:pypdf page text extraction;
:Normalize whitespace\nPreserve page and inferred section metadata;
:Sliding character windows\n500 characters, 50-character overlap\nPage boundaries retained;
:paraphrase-multilingual-MiniLM-L12-v2\nONNX Runtime + attention-mask mean pooling\nSentenceTransformer fallback;
:384-dimensional dense vectors;
:PostgreSQL pgvector\nknowledge_chunks.embedding vector(384)\nFK document_id -> medical_documents.id;
stop
note right : Guide specifies 600 tokens / 100 overlap and L6.\nImplementation uses character windows and L12.\nExisting index model metadata is absent; see retrieval audit.
''',
'Figure_4_2_Docker_Deployment_Architecture': '''title Proposed Docker mapping - NOT configured in this repository
rectangle "Laptop browser" as Browser
node "Conceptual internal Docker bridge\nNo compose.yml or Dockerfiles found" {
 rectangle "frontend-app:3000\nProposed service name" as Front
 rectangle "fastapi-backend:8000\nProposed service name" as API
 database "postgres-pgvector:5432\nProposed service name" as PG
 rectangle "ollama-service:11434\nProposed service name" as Ollama
 Front --> API : REST requests
 API --> PG : SQL / vector retrieval
 API --> Ollama : Optional local generation
}
Browser --> Front : Browser access, published 3000
note bottom : Illustrative deployment design only; no containers were launched.\nObserved execution uses host processes on one laptop.\nCurrent application inference is configured for external Groq, not this proposed Ollama path.
''',
'Figure_6_1_Component_Architecture': '''title Implemented software components and orchestration
package "Next.js frontend" {
 rectangle "AIChatPage\nText input, language, voice review" as UI
 rectangle "MedEvidence\nExpandable retrieved citations" as Evidence
 rectangle "ApiClient\nBearer session requests" as Client
 UI --> Client
 UI --> Evidence
}
package "FastAPI backend" {
 rectangle "auth_service\nRegistration, login, JWT" as Auth
 rectangle "ai endpoint\nPatient ownership + consent" as Endpoint
 rectangle "ai_service.process_ai_chat_query\nDeterministic safety and orchestration" as AI
 rectangle "knowledge_service.generate_embedding\nMiniLM multilingual encoder" as Embed
 rectangle "retrieve_multilingual_chunks\nVector search and evidence gate" as Search
 rectangle "AIGateway\nProvider selection and generation" as Gateway
 Client --> Endpoint
 Client --> Auth
 Endpoint --> AI
 AI --> Embed
 AI --> Search
 AI --> Gateway
}
database "PostgreSQL + pgvector\nAccounts, conversations, care, knowledge" as DB
rectangle "Groq (current)\nOllama (optional local provider)" as LLM
Search --> DB
Auth --> DB
AI --> DB : Save conversation messages
Gateway --> LLM
note bottom : Guide's AuthService / SafetyGateService / VectorSearchService / AIService\nare conceptual responsibilities; actual module/function names are shown.
''',
'Figure_6_2_UML_Sequence_Diagram': '''title Safety-first chat execution sequence
actor User
participant "Next.js frontend" as UI
participant "FastAPI endpoint" as API
participant "ai_service" as AI
database "PostgreSQL / pgvector" as DB
participant "Embedding model" as Embed
participant "AI gateway / provider" as LLM
User -> UI : Submit symptom narrative
UI -> API : POST /api/v1/ai/chat + bearer token
API -> API : Authenticate, get own profile\nNon-emergency requires AI consent
API -> AI : process_ai_chat_query
AI -> DB : Create/load conversation, save user message
AI -> AI : Deterministic red-flag classification
alt Emergency
 AI -> DB : Save emergency response metadata
 AI --> API : EMERGENCY, no retrieved sources
 API --> UI : Immediate emergency response
 UI --> User : Emergency information
else Non-emergency
 AI -> Embed : Generate genuine 384-dimensional query vector
 Embed --> AI : Query embedding
 AI -> DB : Cosine search over approved document chunks
 DB --> AI : Evidence and source metadata
 AI -> AI : Evidence sufficiency gate
 alt Insufficient evidence
  AI --> API : Safe REFUSAL, no invented guidance
 else Sufficient evidence
  AI -> LLM : Context-constrained prompt
  LLM --> AI : Generated response
  AI -> AI : Citation and safety validation
  AI -> DB : Save response and metadata
  AI --> API : Text + response type + citations
 end
 API --> UI : Response
 UI --> User : Guidance or safe refusal + evidence inspector
end
note over API,LLM : No sub-15 ms claim. Current gateway configuration is Groq;\nOllama is an optional provider verified separately via CLI.
'''
}
schema=json.loads((OUT/'README_and_Checklist/database_schema.json').read_text())
tables=['users','patient_profiles','symptom_records','conversations','conversation_messages','medical_documents','knowledge_chunks']
er='title Actual relational and vector schema - relevant subset\nhide circle\nskinparam linetype ortho\n'
for table in tables:
 spec=schema[table];fks={col for fk in spec['fks'] for col in fk['constrained_columns']}
 er+=f'entity "{table}" as {table} {{\n'
 for col in spec['columns']:
  kind='PK' if col['name'] in spec['pk'] else 'FK' if col['name'] in fks else ''
  typ='vector(384)' if table=='knowledge_chunks' and col['name']=='embedding' else col['type']
  er+=f" {'*' if not col['nullable'] else ' '} {col['name']} : {typ}"+(f' <<{kind}>>' if kind else '')+'\n'
 er+='}\n'
 for fk in spec['fks']:
  if fk['referred_table'] in tables: er+=f"{fk['referred_table']} "+('||--o|' if table=='patient_profiles' and fk['referred_table']=='users' else '||--o{')+f" {table} : {','.join(fk['constrained_columns'])}\n"
er+='note bottom : Relevant subset of 27 live tables. users.role_id references roles.id (outside subset).\nGuide names messages / medical_knowledge_chunks differ from actual table names.\nDocument title/publisher are stored in medical_documents; section metadata is JSONB in knowledge_chunks.\nNo real patient values are displayed.\n'
diagrams['Figure_8_1_Database_ER_Diagram']=er
java=next((ROOT/'report_figures/tools').glob('**/bin/java.exe'))
jar=ROOT/'report_figures/tools/plantuml.jar'
for name,body in diagrams.items():
 body=body.replace('own profile\nNon-emergency','own profile\\nNon-emergency')
 body=re.sub(r'"([^"]*)"',lambda m:'"'+m.group(1).replace('\n',r'\n')+'"',body)
 body=re.sub(r'(note (?:bottom|right|over API,LLM)) : (.*)',lambda m:m.group(1)+'\n'+m.group(2)+'\nend note',body,flags=re.S)
 source=SRC/f'{name}.puml';source.write_text(STYLE+body+'\n@enduml\n',encoding='utf-8')
 result=subprocess.run([str(java),'-DPLANTUML_LIMIT_SIZE=8192','-Djava.awt.headless=true','-jar',str(jar),'-tpng',str(source)],capture_output=True,text=True)
 if result.returncode: raise RuntimeError(name+': '+result.stderr)
 shutil.copy2(source.with_suffix('.png'),OUT/'Architecture_and_Database_Diagrams'/f'{name}.png')
 print(name,'rendered')
