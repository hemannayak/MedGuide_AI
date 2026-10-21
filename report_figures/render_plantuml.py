from pathlib import Path
import subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT=Path(__file__).parent
STYLE='''@startuml
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam defaultFontSize 17
skinparam shadowing false
skinparam roundCorner 10
skinparam dpi 220
skinparam ArrowColor #344B61
skinparam LineColor #344B61
skinparam componentStyle rectangle
skinparam packageStyle rectangle
skinparam defaultTextAlignment center
skinparam rectangleBackgroundColor #EFF4F8
skinparam componentBackgroundColor #EFF4F8
skinparam databaseBackgroundColor #EFF4F8
skinparam entityBackgroundColor #EFF4F8
skinparam sequenceParticipantBackgroundColor #EFF4F8
skinparam sequenceGroupBackgroundColor #FFFFFF
'''
DIAGRAMS={
'1.1': '''top to bottom direction
rectangle "Next.js client\\nSymptom intake and response display" as Client
rectangle "FastAPI gateway\\nValidation and orchestration" as API
rectangle "Deterministic red-flag safety gate" as Safety
rectangle "Emergency override\\nReturn emergency response" as Emergency #FBECEC
database "PostgreSQL + pgvector\\nClinical chunks and source metadata" as Store
rectangle "Local Ollama runtime\\nLlama 3.2:3B" as LLM
Client --> API : Symptom input
API --> Safety
Safety -right-> Emergency : Red flags
Safety --> Store : No red flags\\nQuery embedding + retrieval
Store --> LLM : Retrieved evidence\\n+ constrained prompt
LLM -left-> Client : Guidance, risk tier\\nand source attribution
''',
'2.1': '''top to bottom direction
rectangle "Traditional rule systems\\nDeterministic pathways" as Rules
rectangle "Commercial cloud LLMs\\nConversational interaction" as Cloud
rectangle "SAHA multilingual benchmark\\nDialogue and semantic representation" as Saha
rectangle "Proposed hybrid safety RAG\\nDeterministic safety + retrieval\\n+ local generation" as Hybrid #EAF4EF
Rules --> Saha : Safety and structure
Cloud --> Saha : Language interaction
Saha --> Hybrid : Literature synthesis
''',
'4.2': '''start
:Clinical PDF\\nSource and provenance metadata;
:Text extraction and cleaning\\nNormalize whitespace and remove artifacts;
:600-word chunks\\n100-word overlap in Section 7.4 code;
:384-dimensional embeddings\\nEncode each chunk;
:PostgreSQL + pgvector\\nStore chunks, vectors and source metadata;
stop
''',
'6.1': '''top to bottom direction
package "Presentation tier" {
 component "Next.js client\\nChat | symptom input | risk display | citations" as Client
}
package "Application orchestration tier" {
 component "FastAPI gateway\\nAuthentication and validation" as API
 component "Deterministic safety gate" as Gate
 component "RAG orchestration\\nQuery embedding | retrieval\\nEvidence gate | prompt assembly" as Rag
 API --> Gate
 Gate --> Rag : Non-emergency
}
package "Persistence tier" {
 database "PostgreSQL + pgvector\\nRelational records\\nClinical chunks and embeddings" as DB
}
package "Local inference tier" {
 component "Ollama runtime\\nLlama 3.2:3B" as Model
}
Client --> API : REST / JSON
Gate --> Client : Emergency override
Rag --> DB : SQL + vector search
DB --> Rag : Retrieved evidence
Rag --> Model : Grounded prompt
Model --> Rag : Generated response
''',
'6.2': '''hide footbox
skinparam sequenceMessageAlign center
skinparam maxMessageSize 170
autonumber "[00]"
participant "Next.js\\nclient" as Client
participant "FastAPI\\ngateway" as API
participant "Safety\\ngate" as Gate
database "PostgreSQL\\n+ pgvector" as DB
participant "Local Ollama\\nLlama 3.2:3B" as LLM
Client -> API : POST symptom input
API -> Gate : Evaluate raw input
alt Case A: Emergency override
 Gate --> API : Red flags matched
 API --> Client : Tier 1 emergency response\\nBypass retrieval and inference
else Case B: Non-emergency RAG
 Gate --> API : No red flags
 API -> API : Compute query embedding
 API -> DB : Vector similarity search
 DB --> API : Passages + source metadata
 API -> API : Check evidence sufficiency
 note right of API
 Insufficient evidence:
 return safe fallback;
 skip model generation.
 end note
 group Sufficient evidence
 API -> API : Assemble constrained prompt
 API -> LLM : Prompt + retrieved context
 LLM --> API : Generated response
 API -> API : Validate and format response
 API -> DB : Persist conversation and response
 API --> Client : Guidance + risk + citations
 end
end
''',
'8.1': '''hide circle
skinparam linetype ortho
top to bottom direction
entity users {
 * user_id : SERIAL <<PK>>
 --
 email : VARCHAR(255) <<UQ>>
 hashed_password : VARCHAR(255)
 full_name : VARCHAR(120)
 is_active : BOOLEAN
}
entity patient_profiles {
 * profile_id : SERIAL <<PK>>
 --
 * user_id : INT <<FK, UQ>>
 age : INT
 biological_sex : VARCHAR(20)
 known_allergies : TEXT
 chronic_conditions : TEXT
}
entity symptom_records {
 * record_id : SERIAL <<PK>>
 --
 * user_id : INT <<FK>>
 raw_input_text : TEXT
 extracted_symptoms : JSONB
 duration_descriptor : VARCHAR(50)
 perceived_severity : VARCHAR(20)
 is_emergency_flagged : BOOLEAN
}
entity conversations {
 * conversation_id : SERIAL <<PK>>
 --
 * user_id : INT <<FK>>
 title : VARCHAR(200)
 started_at : TIMESTAMPTZ
 ended_at : TIMESTAMPTZ
}
entity messages {
 * message_id : SERIAL <<PK>>
 --
 * conversation_id : INT <<FK>>
 sender_type : VARCHAR(10)
 content : TEXT
 assigned_risk_tier : VARCHAR(50)
 bypassed_ai : BOOLEAN
 retrieval_latency_ms : INT
}
entity medical_documents {
 * document_id : SERIAL <<PK>>
 --
 title : VARCHAR(255)
 author_publisher : VARCHAR(255)
 publication_year : INT
 file_path : VARCHAR(512)
}
entity medical_knowledge_chunks {
 * chunk_id : SERIAL <<PK>>
 --
 * document_id : INT <<FK>>
 chapter : VARCHAR(150)
 chunk_index : INT
 chunk_text : TEXT
 token_count : INT
 embedding : vector(384)
}
users ||-right-o| patient_profiles
users ||-down-o{ conversations
users ||-down-o{ symptom_records
conversations ||-down-o{ messages
medical_documents ||-right-o{ medical_knowledge_chunks
conversations -[hidden]right-> symptom_records
messages -[hidden]down-> medical_documents
'''
}
def render(item):
    num,body=item
    src=STYLE+body+'\n@enduml\n'
    (ROOT/f'figure-{num}.puml').write_text(src,encoding='utf-8')
    java=next((ROOT/'tools').glob('**/bin/java.exe'))
    result=subprocess.run([str(java),'-Djava.awt.headless=true','-jar',str(ROOT/'tools/plantuml.jar'),'-tpng',str(ROOT/f'figure-{num}.puml')],capture_output=True,text=True)
    if result.returncode:raise RuntimeError(result.stderr)
    return num,(ROOT/f'figure-{num}.png').stat().st_size
if __name__=='__main__':
    with ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(render,DIAGRAMS.items()):print(result)
