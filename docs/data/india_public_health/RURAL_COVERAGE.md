# Rural India evidence priorities

The existing CDC education corpus does not establish rural Indian prevalence. State-level disease-burden profiles include mixed populations and must not be tagged rural merely because their state contains villages.

## Verified official discovery sources

| Source | Intended use | Review required |
| --- | --- | --- |
| [NFHS releases, IIPS](https://www.nfhsiips.in/nfhsuser/release-details.php) | Identify latest rural/urban-disaggregated survey publications, maternal/child health, nutrition, anaemia and household indicators | Verify document edition, rural column, denominator, age/sex and survey dates; discovery page is not itself a statistical dataset |
| [Health Dynamics of India 2022–23 release, Government of India](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2053070&lang=2&reg=48) | Rural primary-care infrastructure and staffing; formerly Rural Health Statistics | Obtain the actual report; distinguish facilities, sanctioned positions, vacancies and population coverage; not a live facility directory |
| [About ASHA, NHM](https://www.nhm.gov.in/aboutnrhm/index1.php?lang=1&level=1&lid=226&sublinkid=150) | Explain access to village-level services and links to public facilities | Verify current programme text/reuse; do not promise a particular local service is available |
| [Village Health Sanitation and Nutrition Committee, NHM](https://nhm.gov.in/publications/index1.php?lang=1&level=1&lid=225&sublinkid=149) | Community health planning, nutrition and local support | Programme information, not prevalence evidence or treatment advice |
| [ASHA induction module, NHM](https://www.nhm.gov.in/images/pdf/communitisation/asha/ASHA_Induction_Module_English.pdf) | Primary-care navigation and community-worker roles | Historical training material; verify currency and exclude unsupported prescribing instructions |

Sources were discovered on official sites. Two ASHA module passages are now approved/indexed in the separate service-navigation scope; the other rural sources remain pending. No prevalence figures have been copied from search snippets. The collection should replace redundant historic/AMR material with reviewed rural survey, maternal/child health, nutrition, communicable-disease and access evidence. Do not force all service-navigation documents into the population-surveillance scope.

## Implemented population safeguard

`POST /api/v1/public-health/search` now accepts `population_setting: "rural" | "urban" | "all"` (default `all` preserves existing clients). A rural-only request retrieves only explicitly rural-tagged passages; mixed or missing population metadata is excluded. No silent national/state fallback occurs. Publication validation requires source evidence when assigning rural/urban tags. Responses echo the filter.

Real PostgreSQL tests verified that unclassified evidence is excluded from a rural query and explicitly tagged evidence is included. Affected API, metadata and database checks: **21 passed**. This validates filtering, not the availability of a completed rural corpus. The existing historical national source remains unclassified and cannot satisfy rural-only requests.

## Next publication requirements

Record rural/urban setting at the same granularity as each passage, population denominator, geography, survey/report period, source page/table, limitations and reuse terms. Preserve suppressed estimates and missing values; never turn them into zero. Keep hospital sentinel surveillance separate from household prevalence. Compare seasonal data only within compatible definitions/reporting systems. Review service-navigation material in a dedicated scope before connecting it to patient guidance.
