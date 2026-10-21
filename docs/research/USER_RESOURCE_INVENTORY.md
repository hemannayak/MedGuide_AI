# Supplied research inventory — 11 October 2026

This records the user's additional material without converting unverified claims
into project results. No supplied resource here establishes disease prediction
labels or diagnostic accuracy. The runtime is not automatically replaced.

## Sources inspected this session

- SAHA: https://aclanthology.org/2025.nlpai4health-main.8/
  Abstract confirms medical QA and dialogue summarization, small mT5 and dense
  intfloat/e5-large RAG in a narrow cancer/cystic-fibrosis shared-task setting.
  Treat as a methods reference. Its task scores are not MedGuide measurements.
  Full methods, training data access and reproducibility remain to inspect.
- IndicMedDialog: https://aclanthology.org/2026.bionlp-1.84/
  Landing page accessible. Inspect full PDF, artifact links, licensing and
  synthetic/translated-data limitations before acquisition or training.
- IHQID candidate repository: https://github.com/indichealth/indic-health-demo
  Repository accessible, contrary to uncertainty in the supplied review.
  Public access does not settle dataset reuse rights or suitability.

## Remaining supplied sources to verify

| Resource | Supplied location | Intended disposition |
|---|---|---|
| NLP4Health-2025 shared task | https://aclanthology.org/2025.nlpai4health-main.5/ | QA/summarization comparison; access unresolved |
| IHQID paper | https://aclanthology.org/2023.findings-eacl.140/ | Intent/entities; already shortlisted |
| IndicRAGSuite | https://huggingface.co/collections/ai4bharat/indicragsuite-683e7273cb2337208c8c0fcb | General retrieval evaluation |
| IndicTrans2 | https://github.com/AI4Bharat/IndicTrans2 | Translation comparison; gated checkpoint tracked separately |
| IndicSQuAD | https://github.com/l3cube-pune/indic-nlp | QA benchmark; inspect exact dataset and rights |
| COMI-LINGUA | https://huggingface.co/datasets/LingoIITGN/COMI-LINGUA | Hindi/English code-mixing evaluation |
| IndicParam / IndicMMLU-Pro | https://huggingface.co/datasets/bharatgenai/IndicParam | General evaluation, not medical evidence |
| IndicQuest | https://github.com/l3cube-pune/indic-nlp | General QA evaluation |
| IndicDialogue | https://data.mendeley.com/datasets/wcb4bxbyxx/2 | General dialogue comparison |
| PubMedQA | https://pubmedqa.github.io | Biomedical QA evaluation; applicability differs from patient triage |
| Med-HALT | https://medhalt.github.io | Hallucination evaluation |
| Airavata | https://doi.org/10.48550/arxiv.2401.15006 | Hindi generation candidate; verify model card |
| Nanda | https://doi.org/10.48550/arxiv.2504.06011 | Hindi generation candidate; verify model card |
| PARAM-1 | https://doi.org/10.48550/arxiv.2507.13390 | Generation candidate; verify model card |
| Mantra-14B | https://doi.org/10.48550/arxiv.2504.09753 | Generation candidate; verify model card and hardware |
| Samvaadhana | Exact paper identifier not supplied | Telugu dialogue methods; identity/access unresolved |

MuRIL, IndicSBERT, multilingual E5-small and MedQuAD remain in the existing
research_resources.json manifest. SAHA's e5-large is a different checkpoint from
the multilingual E5-small shortlist; do not claim identical replication.

Every candidate needs identity, rights, pinned revision, provenance, intended
task, held-out evaluation and measured resource use. Benchmark datasets must not
be silently ingested into the verified medical corpus. Not every research model
should be simultaneously deployed: compare candidates and choose per task.
