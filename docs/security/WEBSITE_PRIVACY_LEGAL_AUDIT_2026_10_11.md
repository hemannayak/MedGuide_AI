# Website privacy, legal and accessibility audit

Date: 2026-10-11. Source/code audit, not legal certification or a guarantee against
claims. Owner confirms this is a student major project; no operator/contact
details are available. Do not invent a company, address, email, grievance officer,
registrations, partnerships, certifications or clinical results.

## Implemented

- `/privacy`, `/terms`, `/cookies`, `/refunds`; legacy legal aliases share current
  policy pages; footer navigation exposes all four.
- Notices describe database/image storage, cloud AI/speech providers, browser
  tokens, separate permission withdrawal and incomplete retention/rights flows.
- Refund policy states no checkout was identified, without invented deadlines.
- Contact preview no longer asks name/email; requires a synthetic-only
  acknowledgement and says no delivery occurs.
- Registration no longer requests an optional phone number; nickname is enough.
  Account-processing checkbox is separate from terms, AI and speech permissions.
  It is a UI gate, not persisted legal consent evidence: see release blockers.
- Keyboard focus outline added globally. Existing native labels, checkboxes,
  select controls, skip links and descriptive action labels retained.
- Homepage diagram no longer invents WHO/ICMR document titles. Chat universal
  evidence claim removed; legacy fake contact delivery promise removed.

## Tracking, embeds and consent decision

Source search found no analytics SDK, tracking pixel, third-party iframe or
application-written cookie. JSON-LD is structured metadata, not analytics.
Local fonts/assets are present. Backend cloud processors still transmit data;
absence of browser trackers is not absence of third-party processing.

Browser inventory: `medguide_token` sessionStorage or optional remembered
localStorage; `medguide_lang` localStorage. Global persistent medical chat was
removed in the previous increment. Sign-out does not revoke server JWTs.

No optional tracking banner added because no optional tracking was found. This
decision requires a production network/hosting audit and jurisdiction review
before release. Do not infer an India-wide exemption or GDPR compliance.
If optional analytics/embeds are introduced, gate loading before applicable
consent and support equally usable rejection/withdrawal. Avoid dark patterns.

## Indian law verification

Primary sources checked:

- DPDP Act 2023: https://www.indiacode.nic.in/bitstream/123456789/22037/1/a2023-22.pdf
- Commencement G.S.R.843(E), 13 November 2025:
  https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- DPDP Rules 2025 G.S.R.846(E):
  https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
- SPDI Rules 2011: https://www.meity.gov.in/writereaddata/files/GSR3_10511%281%29.pdf

Commencement is phased. The notification brings specified institutional
provisions into force on publication, a further group after one year, and core
processing/notice/consent/obligations/rights provisions after eighteen months.
Do not describe all DPDP obligations as already operative on this audit date.
Core readiness work is still necessary; verify applicability, corrigenda and
any subsequent notifications with qualified Indian counsel before launch.
The existing SPDI framework and its applicability to this operator also require
review; medical/health information and passwords receive explicit treatment.

## Release blockers and other risks

1. Publish real operator identity, public contact/grievance details and a working
   request route. Current contact preview is not a grievance mechanism.
2. Persist versioned account-processing consent/notice evidence at the backend;
   checkbox alone is insufficient. Review health-record/prescription collection
   before upload, not merely AI invocation, and worker data-sharing permission.
3. Implement retention, erasure/export, correction, withdrawal consequences,
   backup deletion handling and incident/breach procedures.
4. Verify provider agreements, retention/training use, jurisdictions and cloud
   transfer disclosures. No unverified India-only hosting promise.
5. Decide account age policy and enforce appropriate parental verification or
   restricted adult-only access; no such complete enforcement exists yet.
6. Resolve source currency, ICMR reuse permission and source-specific licenses.
   Public accessibility is not copyright permission.
7. Image/font audit: four local font license files exist; code-native rural SVGs
   have recorded creation provenance. Photographic/background assets and third-
   party logos/reference screenshots need an asset-by-asset permission ledger.
   Do not assert all images are cleared. Legacy logo strips must not be deployed
   as endorsements; remove or replace uncleared assets before release.
8. No genuine testimonial evidence identified. Existing marketing is largely
   illustrative and labelled. Never add fabricated reviews or outcome statistics;
   audit inactive admin/sample components before exposing them publicly.
9. Accessibility is not certified: measure full rendered contrast, screen-reader
   navigation, zoom/reflow, validation errors and complete keyboard flows. Policy
   foreground #073d37 on #fbf8f1 and white should be measured; new focus ring uses
   a light halo for dark surfaces. Decorative artwork intentionally uses empty
   alt/aria-hidden; informative images require meaningful descriptions.
10. Check medical-device/telemedicine applicability before real clinical use,
    consumer advertising/consumer protection, hosting logs/security and foreign
    privacy laws if targeting users outside India. A disclaimer cannot cure an
    unsafe feature or remove statutory rights.

## Acceptance evidence

Automated web tests and TypeScript must pass after changes. Browser policy-route,
heading, link, keyboard and registration-consent checks are recorded separately.
Neither tests nor adding policy text establishes complete legal compliance.

Recorded checks: 74 existing web tests pass, one optional live test skipped;
TypeScript passes. Browser checked all four policy headings and policy links.
Rendered privacy page had zero images missing alt and zero iframes. Registration
had no phone field; both account-processing and terms checkboxes were required
and unchecked. Tab from account consent moved to its Privacy Policy link.
Screenshot: evaluation/web-registration-consent-2026-10-11.png. Contrast measured
for actual policy paragraph foreground/background is stored in
evaluation/policy_contrast_check.json; this limited check is not a whole-site
WCAG conformance audit. No binding terms were accepted and no real account or
patient data submitted during this browser verification.

Rendered homepage additionally had zero images missing alt, zero iframes and
zero absolute-URL external script sources. Three informative images had
descriptive labels. Local image delivery and alt text do not establish copyright
permission; photographs/background images still need provenance review.
Policy screenshot: evaluation/web-privacy-policy-2026-10-11.png.
