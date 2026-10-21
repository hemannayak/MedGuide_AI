# Symptom checker coverage map

Date: 2026-10-03. Status: planning map; no clinical rules approved here.
Related audit: [Medical source audit](MEDICAL_SOURCE_AUDIT.md).

## Purpose and boundary

Map the symptom groups already implied by the existing checker to evidence,
extraction fields and evaluation needs. This does not establish disease
prediction, diagnosis or complete support for all patient populations. English,
Hindi and Telugu are required; evaluate scripts, transliteration and code-mixing.

Population eligibility must be specified for each pathway. Age, pregnancy and
other clinically relevant context cannot be inferred. Ask only relevant
clarifying questions. Missing context must not silently become a low-risk label.

## Coverage backlog

| ID | Area already present/implied in checker | Local evidence position | Next evidence task | Priority |
| --- | --- | --- | --- | --- |
| SC-01 | Breathing symptoms and chest discomfort | PEN training modules may provide relevant sections; no reviewed rule mapping | Exact respiratory/cardiovascular sections and emergency referral criteria, with population applicability | P0 |
| SC-02 | Consciousness change, sudden weakness, speech change, seizures | No dedicated reviewed source mapping | Source and review acute assessment/referral sections; distinguish reported terms from diagnosis | P0 |
| SC-03 | Allergy/anaphylaxis-related descriptions | No dedicated reviewed source mapping | Find authoritative assessment/referral sections and reviewed language equivalents | P0 |
| SC-04 | Bleeding, including reported blood in vomit, cough or stool | No dedicated reviewed source mapping | Resolve exact symptom, context and source-backed escalation conditions | P0 |
| SC-05 | Snakebite or poisoning reports | No dedicated local publication identified | Review NCDC snakebite clinical guideline and suitable official poisoning guidance; policy action plans alone are insufficient | P0 |
| SC-06 | Fever-related descriptions | Malaria source present but superseded; no generic fever coverage established | Current malaria plus Indian fever/dengue guidance; avoid equating fever with a specific disease | P0 |
| SC-07 | Abdominal symptoms, vomiting and fluid-intake difficulties | No dedicated reviewed source mapping | Official gastrointestinal/dehydration sections with population-specific applicability | P0 |
| SC-08 | Persistent cough / TB-related information | Pediatric/EPTB material exists with unresolved rights; adult pulmonary coverage not established | Eligible current NTEP/ICMR information and precise referral sections | P1 |
| SC-09 | Existing hypertension / diabetes information | Adult hypertension guideline and 2018 PEN training modules present | Reviewed patient-information passages; preserve diagnosed/adult/non-pregnant restrictions where applicable | P1 |
| SC-10 | Symptoms reported for children or during pregnancy | Pediatric TB material does not establish broad pediatric coverage; no pregnancy-specific mapping | Dedicated evidence/labels before claiming a supported pediatric or pregnancy pathway | P0 applicability boundary |

P0 means source/engineering review priority, not a clinical urgency assignment.
No area is declared complete based on the existence of a broad guideline.

## Candidate official discovery sources

These are discovery/publication references, not ingested or approved rules:

- MoHFW standard treatment guideline portal:
  https://clinicalestablishments.mohfw.gov.in/en/standard-treatment-guidelines
- ICMR STW portal (individual titles/editions/rights need verification):
  https://www.icmr.gov.in/standard-treatment-workflows-stws
- NCVBDC guideline listing (includes National Guidelines for Clinical Management
  of Dengue Fever 2023):
  https://ncvbdc.mohfw.gov.in/index1.php?font=Normal&lang=1&level=1&lid=3686&sublinkid=5899&theme=Cream
- NCDC Centre for One Health listing (includes snakebite clinical STG):
  https://ncdc.mohfw.gov.in/includes/About/CentresAndDivision/COH.php
- WHO/ICRC Basic Emergency Care, clinician-training source requiring careful
  adaptation to patient-facing escalation:
  https://pmnch.who.int/resources/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured

## Extraction specification to evaluate

For relevant pathways, consider reported symptom text, onset/duration, severity
description, associated symptoms, negation, current versus historical status,
subject of the report, and population context. Preserve the patient's wording.
Mark fields unknown when absent; do not invent values or clinical severity.
Numeric values require units and context before rule matching.

IHQID can support healthcare intents and disease/drug/treatment entities, but
does not establish labels for all of these symptom fields. A dedicated,
documented annotation protocol and eligible examples are still required.

## Rule register fields

Each rule must record:

rule_id, coverage_id, source_id, artifact_hash, publication_version,
pdf_page, printed_page_or_section, source_excerpt, applicable_population,
required_context, conditions, exclusions, escalation_action, clinical_review,
language_variant_review, test_case_ids, runtime_approval_status.

Source excerpts must be accurate and within applicable reuse conditions.
Keep clinical conditions separate from lexical variants and project routing.
No rule rows are populated until their medical evidence has been reviewed.

## Evaluation and acceptance evidence

For each supported pathway, require reviewed evidence, permitted source use,
explicit applicability, extraction/clarification cases, and documented expected
escalation labels. Evaluate direct/indirect descriptions, negation, historical
and third-person reports, numbers without units, code-mixing, and dependency
failures. Group translations/paraphrases in the same evaluation split.

Measure extraction errors, missed red flags, false alarms, end-to-end escalation,
evidence support, citation correctness and latency by language. Report actual
counts and uncertainty. Do not assign arbitrary medical performance thresholds
or claim clinical validation.

## Next work package

Audit exact emergency/respiratory source sections and the current malaria
edition first. Resolve ICMR permission and PEN metadata before promoting those
artifacts. Prepare source-linked annotations and held-out relevance labels, then
evaluate the approved retrieval and extraction candidates. Implementation stays
in the main development task; this planning work changes no runtime behaviour.
