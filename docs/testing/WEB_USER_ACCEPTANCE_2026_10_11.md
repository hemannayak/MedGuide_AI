# Browser patient-flow check — 11 October 2026

Manual browser automation against the real web frontend at 127.0.0.1:3000 and
the running backend. A synthetic patient fixture was created through the normal
registration API, then signed in through the browser. Registration UI itself
was not tested. No real patient information was used. Synthetic account,
conversation, upload and timeline records remain in the development database.

## Observed working

- Landing page and login opened; synthetic credentials signed in to dashboard.
- Prescription listing and medication listing showed genuine empty states for
  the new account. Profile fetched its synthetic name and stored language.
- AI request without consent returned a visible consent-required error.
- Consent page initially showed both choices not allowed; separate grants
  changed each to Allowed.
- English, Hindi and Telugu blood-pressure explanation requests returned answers
  in the requested language, with source drawers. This is not a medical-quality
  assessment or evidence that every claim is supported.
- Read Aloud progressed from Generating Voice to Stop Speaking; Stop returned
  it to Read Aloud. Audible clarity/pronunciation were not evaluated.
- Synthetic chest-pain/breathing-difficulty question produced emergency
  escalation, Telugu instruction text and 108/112 links. No emergency call was
  placed. This single case does not evaluate triage sensitivity/specificity.
- Synthetic prescription PNG uploaded successfully. Tesseract result showed
  COMPLETED, and extracted candidates remained PENDING. Original OCR text was
  available through the review disclosure.
- Attempting to confirm an incomplete candidate returned the backend's
  professional-review-required error; it remained PENDING.
- Upload event appeared in the health timeline. Follow-ups showed an empty
  state for this patient.
- Sign-out cleared access; visiting protected chat redirected to login.

## Issues to resolve before expanding features

1. **OCR false candidates:** fixture contains one medicine line, but four
   candidates were created. The synthetic heading, patient identifier and
   explanatory sentence became medication names. Conservative candidate
   filtering/extraction needs review; never silently invent corrections.
2. **Citation relevance/duplication:** English hypertension answer's source
   drawer included a WHO malaria reference and repeated a hypertension source.
   Inspect retrieved chunks and actual claim support before choosing a fix.
   The English answer lacked visible inline citation markers in this case.
3. **Misleading error presentation:** missing-consent error renders as an
   assistant message with Read Aloud and a Grounded in verified healthcare
   guidance label. Service/consent errors must be distinct from medical answers.
4. **Emergency internals exposed:** red-flag list displays regex strings such
   as `\bchest\s+pain\b` rather than readable symptom descriptions.
5. **Incomplete-record affordance:** web review allows checking an incomplete
   record and enabling its confirmation button; backend safely rejects it.
   Mirror the backend completeness gate in the UI and keep review messaging.
6. **Language UX:** selecting Telugu changes response language, but most
   workspace labels and the disclaimer remain English. Workspace selection
   also differed from the stored profile preference (English). Clarify intended
   preference persistence rather than treating UI translation as complete.

## Not evaluated in this pass

Actual microphone recording/STT, noisy/accents/elderly speech, audio quality,
handwritten or real prescriptions, clinical accuracy, medication schedule and
adherence mutation, populated worker/follow-up workflows, offline behavior,
cross-account cache isolation, password recovery and deployment reliability.

## Evidence

- `evaluation/SYN-browser-prescription.png`: generated synthetic OCR fixture,
  explicitly labelled not for treatment; not a real prescription.
- `evaluation/web-prescription-review.png`: browser capture of pending
  candidates and incomplete-record verification rejection.

Frontend started on loopback and left running; browser left at signed-out login.
This pass changed no application implementation.
