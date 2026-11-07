# Master checklist for 14 report figures

All filenames follow the latest execution prompt. Status describes actual verification, not the guide’s hoped-for output. See README.md before inserting captions.

| Figure | Report section | Evidence | Status | File |
|---|---|---|---|---|
| 1.1 | 1.4 | Generated diagram | Verified implementation diagram; guide differs | Architecture_and_Database_Diagrams\Figure_1_1_System_Architecture.png |
| 4.1 | 4.3.2 | Generated diagram | Verified current code; guide differs | Architecture_and_Database_Diagrams\Figure_4_1_Ingestion_Vectorization_Pipeline.png |
| 4.2 | 4.5.1 | Illustrative proposed diagram | Proposed only; Docker implementation pending | Architecture_and_Database_Diagrams\Figure_4_2_Docker_Deployment_Architecture.png |
| 5.1 | 5.3.2 | Genuine application screenshot | Captured and verified | Backend_Screenshots\Figure_5_1_FastAPI_Swagger_Docs.png |
| 5.2 | 5.3.4 | Genuine browser screenshot of real CLI transcript | Execution verified; native terminal recapture pending | Backend_Screenshots\Figure_5_2_Ollama_Model_Execution.png |
| 6.1 | 6.1.1 | Generated diagram | Verified implementation diagram | Architecture_and_Database_Diagrams\Figure_6_1_Component_Architecture.png |
| 6.2 | 6.4 | Generated diagram | Verified implementation diagram | Architecture_and_Database_Diagrams\Figure_6_2_UML_Sequence_Diagram.png |
| 7.1 | 7.8 | Genuine application screenshot | Captured; guide-specific controls absent | Frontend_Screenshots\Figure_7_1_Default_Chat_Interface.png |
| 7.2 | 7.8, 7.9 | Genuine application screenshot | Captured and emergency bypass verified | Frontend_Screenshots\Figure_7_2_Tier_1_Emergency.png |
| 7.3 | 7.8, 7.9 | Genuine application screenshot | Captured actual output; requested tier presentation unmet | Frontend_Screenshots\Figure_7_3_Tier_2_Moderate_Risk.png |
| 7.4 | 7.8, 7.9 | Genuine application screenshot | Captured actual output; requested home-care result unmet | Frontend_Screenshots\Figure_7_4_Tier_3_Home_Care.png |
| 7.5 | 7.10 | Genuine application screenshot | Captured actual inline inspector; modal absent | Frontend_Screenshots\Figure_7_5_Verified_Medical_Sources.png |
| 8.1 | 8.1, 8.2 | Generated diagram from live schema | Verified live schema subset | Architecture_and_Database_Diagrams\Figure_8_1_Database_ER_Diagram.png |
| 8.2 | 8.5.1 | Genuine browser screenshot of real psql transcript | Query and scores verified; native terminal recapture pending | Backend_Screenshots\Figure_8_2_Pgvector_Query_Output.png |

## Figure 1.1 System architecture

- Required content: Next.js, FastAPI, safety gate, vector database, configured gateway and optional Ollama
- Verification and remaining steps: Current provider is Groq; local Ollama is shown as an alternative, not the active app path.
- Requested caption: Figure 1.1: System Architecture of the Medical Triage & Clinical RAG Assistant.
- Recommended accurate caption: Figure 1.1: Implemented MedGuide AI architecture with deterministic emergency routing and a configurable inference gateway.

## Figure 4.1 Ingestion and vectorization

- Required content: PDF extraction, page metadata, chunking, 384-d embeddings, pgvector
- Verification and remaining steps: Actual 500-character / 50-character windows and multilingual MiniLM-L12; not 600/100 tokens or L6.
- Requested caption: Figure 4.1: Medical Document Ingestion, Semantic Chunking, and Vectorization Pipeline.
- Recommended accurate caption: Figure 4.1: Implemented PDF text extraction, character-window chunking and multilingual MiniLM-L12 vectorization.

## Figure 4.2 Docker deployment architecture

- Required content: Four guide services, browser access and conceptual bridge connections
- Verification and remaining steps: No Compose file or Dockerfiles found. Diagram is explicitly not evidence of a running deployment.
- Requested caption: Figure 4.2: Local Multi-Container Deployment Architecture using Docker Compose.
- Recommended accurate caption: Figure 4.2: Proposed Docker service mapping; current verified execution uses host processes.

## Figure 5.1 FastAPI Swagger documentation

- Required content: Actual Swagger UI, authentication, symptoms/analyze and ai/chat routes
- Verification and remaining steps: No /api/v1/triage or /api/v1/ingest. Specific auth routes exist.
- Requested caption: Figure 5.1: FastAPI OpenAPI/Swagger Interactive Backend Documentation and Endpoints.
- Recommended accurate caption: Figure 5.1: FastAPI Swagger documentation showing the implemented authentication, symptom-triage and AI chat APIs.

## Figure 5.2 Ollama model execution

- Required content: Requested Llama 3.2:3B CLI command and actual response
- Verification and remaining steps: Model installed and CLI exit 0. This image is labelled a transcript view, not a native terminal screenshot. Follow README native recapture steps.
- Requested caption: Figure 5.2: Local Execution and Prompt Verification of Quantized Llama 3.2:3B via Ollama CLI.
- Recommended accurate caption: Figure 5.2: Actual Llama 3.2:3B CLI execution transcript displayed in a browser proof view.

## Figure 6.1 Software component architecture

- Required content: UI, ApiClient, auth_service, safety/RAG functions, gateway and database
- Verification and remaining steps: Uses real module/function names; guide service class names are conceptual.
- Requested caption: Figure 6.1: High-Level Software Component and Service Orchestration Architecture.
- Recommended accurate caption: Figure 6.1: Implemented frontend components and FastAPI service orchestration.

## Figure 6.2 UML sequence diagram

- Required content: Auth/consent, conversation persistence, emergency bypass, retrieval/evidence/generation
- Verification and remaining steps: No unsupported latency claim. Current generation provider is Groq, optional Ollama is documented.
- Requested caption: Figure 6.2: UML Sequence Diagram of Deterministic Emergency Interception and Grounded RAG Flow.
- Recommended accurate caption: Figure 6.2: Sequence of deterministic emergency interception and evidence-gated chat generation.

## Figure 7.1 Default frontend chat

- Required content: Actual authenticated chat header, natural-language input, example prompts and voice control
- Verification and remaining steps: No 100% local claim or duration/severity chips in chat; those form controls belong to /app/symptoms.
- Requested caption: Figure 7.1: Next.js Chat Interface Featuring Natural Language Symptom Intake and Contextual Chips.
- Recommended accurate caption: Figure 7.1: Actual Next.js health companion with multilingual example prompts and natural-language input.

## Figure 7.2 Emergency scenario

- Required content: Severe crushing chest pain radiating to the left arm and jaw.
- Verification and remaining steps: Actual heading differs; red escalation badge and 108/112 shown. Separate guard test proves zero retrieval calls, not sub-15ms latency.
- Requested caption: Figure 7.2: Frontend Output for Tier 1 Emergency Interception Bypassing AI Generation.
- Recommended accurate caption: Figure 7.2: Actual emergency escalation output for the specified synthetic chest-pain input.

## Figure 7.3 Moderate-risk requested scenario

- Required content: High fever of 102°F for 3 days with persistent painful cough.
- Verification and remaining steps: Cautious consultation advice and citations returned; no amber tier badge, explicit timeframe or dedicated warning-sign list. Do not claim those are implemented.
- Requested caption: Figure 7.3: Frontend Output for Tier 2 Moderate Acuity Guidance.
- Recommended accurate caption: Figure 7.3: Actual cautious consultation response to the synthetic fever and cough scenario; no moderate-tier classification is displayed.

## Figure 7.4 Low-risk requested scenario

- Required content: Mild runny nose and sneezing since yesterday, no fever.
- Verification and remaining steps: Response explains evidence gap and recommends professional advice; no green badge or rest/hydration home-care advice was produced.
- Requested caption: Figure 7.4: Frontend Output for Tier 3 Low-Acuity Supportive Home Care Guidance.
- Recommended accurate caption: Figure 7.4: Actual evidence-limited response to the synthetic runny-nose scenario; supportive home care was not generated.

## Figure 7.5 Medical sources inspector

- Required content: Actual retrieved WHO titles, publisher, inferred sections and page metadata
- Verification and remaining steps: Existing control expands inline, not as a modal. Screenshot shows visible source cards; no titles or chapter metadata were invented.
- Requested caption: Figure 7.5: Frontend Evidence Inspector Modal Displaying Grounded Clinical Source Citations.
- Recommended accurate caption: Figure 7.5: Expanded inline evidence inspector showing the response’s actual retrieved WHO source metadata.

## Figure 8.1 Database ER diagram

- Required content: Actual UUID PKs, FKs, columns and vector(384), with document/chunk relationship
- Verification and remaining steps: Guide messages/medical_knowledge_chunks mapped to real conversation_messages/knowledge_chunks; live database contains 27 tables.
- Requested caption: Figure 8.1: Entity-Relationship (ER) Schema of the Unified Relational and Vector Database.
- Recommended accurate caption: Figure 8.1: Relevant subset of the live relational and pgvector schema with actual table names and keys.

## Figure 8.2 pgvector similarity query

- Required content: Real compatible query vector, prepared SQL, nearest three rows and cosine scores
- Verification and remaining steps: Actual scores 0.8668233, 0.8650898, 0.8644827; target >0.65 achieved for this query. Image is explicitly a browser transcript view. Historical model metadata missing; three sampled re-encodings agree with current encoder.
- Requested caption: Figure 8.2: PostgreSQL psql Console Output Demonstrating Cosine Similarity Vector Retrieval via pgvector.
- Recommended accurate caption: Figure 8.2: Actual prepared psql cosine-retrieval output displayed in a browser transcript view.
