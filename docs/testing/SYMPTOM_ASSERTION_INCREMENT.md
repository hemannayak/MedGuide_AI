# Symptom assertion safety increment — 15 October 2026

Previously both safety paths matched denied symptom phrases. Added a shared,
conservative lexical helper for adjacent explicit denial in English, Hindi,
Telugu and transliteration. Each match is considered independently; uncertainty
is retained, independently selected structured symptoms are not negated by
narrative text, and negative wording inside an existing danger phrase is retained.

This is language-processing logic, not a new medical rule, diagnosis model or
clinically validated negation parser. Complex scope, historical reports,
questions and unrecognized language remain limitations; the existing escalation
vocabulary still needs precise clinical source review.

Removed unsourced 24-hour wording and generic hydration/rest advice from the
structured triage fallback. A no-match response now explicitly says it does not
establish safety or cause. Retained the existing ROUTINE enum for API compatibility.

Validation: 87 focused tests passed across assertion, existing multilingual triage
and chat-policy suites. These are synthetic cases, not sensitivity/specificity or
real-patient evaluation. Two initially failing fixtures were corrected: one
mixed-script typo and one phrase absent from the existing detection vocabulary.
That absent Telugu phrase remains a coverage gap requiring reviewed expansion.
