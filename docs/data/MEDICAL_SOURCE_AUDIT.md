# Medical source audit

Audit date: 2026-10-03 (India). Scope: four local PDF artifacts, opening/copyright
pages, existing source register, and selected official publication pages. This
is an identity/currency/rights audit, not complete medical-content review or
clinical validation. No application database or medical rules were changed.

## Local artifacts

All four local byte counts and SHA-256 hashes match the existing register.
Matching an internal register establishes local integrity, not independent
identity against a freshly downloaded publisher artifact.

| Local filename | PDF pages | Observed identity and applicability | Audit disposition |
| --- | --- | --- | --- |
| ICMR_STW_Paediatric_EPTB_2022.pdf | 32 | Special Edition on Paediatric and Extrapulmonary Tuberculosis, 2022; opening pages state all rights reserved and prior permission for reproduction/transmission | RIGHTS_REVIEW_REQUIRED. Official origin does not establish permission for ingestion or redistribution. No permission assumed. |
| WHO_Guidelines_for_Malaria_2025.pdf | 478 | WHO guidelines for malaria, 13 August 2025; CC BY-NC-SA 3.0 IGO in the local PDF | SUPERSEDED_VERSION. WHO's current page identifies a 10 September 2026 edition that replaces this version. Preserve the old version for historical experiment reproducibility; review/acquire the current edition before using it as current guidance. |
| WHO_Hypertension_Guidelines_2021.pdf | 61 | Guideline for the pharmacological treatment of hypertension in adults; local ISBN 978-92-4-003398-6; CC BY-NC-SA 3.0 IGO | IDENTITY_CORROBORATED_CONTENT_REVIEW_PENDING. The publisher describes adult, non-pregnant, already diagnosed patients. Do not generalize to pregnancy, children, or symptom diagnosis. Local PDF page count differs from publication-page pagination and must be distinguished. |
| WHO_PEN_Guidelines_2020.pdf | 644 | Actually Package of Essential Noncommunicable (PEN) disease and healthy lifestyle interventions: Training modules for primary health care workers, first edition 2018; ISBN 978-92-9022-666-6; CC BY-NC-SA 3.0 IGO | METADATA_CORRECTION_REQUIRED. This is not the 2020 WHO PEN publication. Filename retained to avoid breaking existing references. Review age/applicability before use. |

## Evidence and precise locators

- ICMR local PDF: opening three PDF pages identify edition and permission notice.
  Clinical source review and any required permission remain outstanding.
- WHO PEN local PDF: cover identifies first edition 2018; PDF page 4 gives
  ISBN, copyright year, license and suggested citation.
- WHO hypertension local PDF: PDF page 4 gives ISBN and license. Publisher
  describes the target population:
  https://www.who.int/publications/i/item/9789240033986
- Matching 2018 PEN publisher record (644 pages, matching title/ISBN):
  https://www.who.int/southeastasia/publications/i/item/9789290226666
- Distinct 2020 PEN publication (77 pages, ISBN 978-92-4-000922-6):
  https://www.who.int/publications/i/item/9789240009226
- Current malaria edition, 10 September 2026, reference 10.2471/B09879:
  https://www.who.int/publications/i/item/guidelines-for-malaria

WHO licenses include attribution, noncommercial/share-alike provisions,
translation notices, no implied endorsement and third-party-material checks.
An open download is not blanket permission for every use or every embedded item.

## Existing source register limitations

`medical_guidelines/SOURCE_METADATA_REGISTER.md` currently labels portal entries
and local files as VERIFIED_OFFICIAL_DOCUMENT. That combines distinct questions:
publisher identity, artifact presence, exact publication identity, currency,
rights, and medical review. Treat entries outside the four files above as
candidate references until exact artifacts have been checked.

The register's WHO PEN filename/year/title/ISBN combination is inconsistent with
the local document. The legacy registry is preserved; this audit documents the
correction needed in future ingestion metadata and any existing indexed copies.

WHO-04 in the register points to a publication about type 2 diabetes, asthma and
COPD in low-resource primary care, not general coverage of every symptom:
https://www.who.int/publications/i/item/9789241548397

The dengue candidate should be reviewed against the official 2023 edition,
rather than assuming the register's 2021 link is current:
https://ncvbdc.mohfw.gov.in/index1.php?font=Normal&lang=1&level=1&lid=3686&sublinkid=5899&theme=Cream

## Triage provenance audit

`backend/app/core/triage.py` names broad guideline families but does not attach
document/version/page and applicability to each keyword rule. The visible
implementation uses substring matching. Therefore code presence is not evidence
that individual rules are clinically validated.

Items requiring source review include the unitless phrase 'fever over 102',
language variants that may differ in specificity, and handling of negation,
historical reports and third-person symptoms. This audit neither approves those
rules nor supplies replacement clinical thresholds.

## Required follow-through in the main development task

1. Correct source identities and preserve historical version references.
2. Resolve rights before new ingestion or redistribution.
3. Check the current malaria edition and whether its changes affect supported
   passages; do not overwrite historical experiments without versioning.
4. Map each intended response and safety rule to reviewed source sections.
5. Inspect indexed metadata for mismatches; any database correction needs its
   own concrete migration/update plan and regression checks.
6. Keep artifact, rights, currency, clinical review and runtime-index states
   separately recorded. No source is marked runtime-ready by this audit.
