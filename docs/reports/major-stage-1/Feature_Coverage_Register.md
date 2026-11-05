# Stage 1 feature coverage register

Baseline: 2b923e6. File presence is implementation evidence only; it does not establish runtime correctness or clinical validation.

## Web pages

- frontend/src/app/(auth)/forgot-password/page.tsx
- frontend/src/app/(auth)/login/page.tsx
- frontend/src/app/(auth)/onboarding/page.tsx
- frontend/src/app/(auth)/register/page.tsx
- frontend/src/app/(auth)/verify-email/page.tsx
- frontend/src/app/about/page.tsx
- frontend/src/app/accessibility/page.tsx
- frontend/src/app/admin/activity/page.tsx
- frontend/src/app/app/chat/page.tsx
- frontend/src/app/app/consent/page.tsx
- frontend/src/app/app/dashboard/page.tsx
- frontend/src/app/app/emergency/page.tsx
- frontend/src/app/app/follow-ups/page.tsx
- frontend/src/app/app/guide/page.tsx
- frontend/src/app/app/information/page.tsx
- frontend/src/app/app/medications/[id]/page.tsx
- frontend/src/app/app/medications/history/page.tsx
- frontend/src/app/app/medications/page.tsx
- frontend/src/app/app/prescriptions/[id]/page.tsx
- frontend/src/app/app/prescriptions/page.tsx
- frontend/src/app/app/prescriptions/upload/page.tsx
- frontend/src/app/app/profile/page.tsx
- frontend/src/app/app/settings/page.tsx
- frontend/src/app/app/symptoms/page.tsx
- frontend/src/app/app/timeline/page.tsx
- frontend/src/app/contact/page.tsx
- frontend/src/app/cookies/page.tsx
- frontend/src/app/faq/page.tsx
- frontend/src/app/hcw/follow-ups/page.tsx
- frontend/src/app/hcw/page.tsx
- frontend/src/app/hcw/patients/[id]/page.tsx
- frontend/src/app/hcw/patients/page.tsx
- frontend/src/app/how-it-works/page.tsx
- frontend/src/app/languages/page.tsx
- frontend/src/app/legal/disclaimer/page.tsx
- frontend/src/app/legal/privacy/page.tsx
- frontend/src/app/legal/terms/page.tsx
- frontend/src/app/page.tsx
- frontend/src/app/privacy/page.tsx
- frontend/src/app/product/page.tsx
- frontend/src/app/refunds/page.tsx
- frontend/src/app/research/page.tsx
- frontend/src/app/safety/page.tsx
- frontend/src/app/start/page.tsx
- frontend/src/app/technology/page.tsx
- frontend/src/app/terms/page.tsx

## Mobile screens

- mobile/src/app/_layout.tsx
- mobile/src/app/ask.tsx
- mobile/src/app/care.tsx
- mobile/src/app/chat.tsx
- mobile/src/app/consent.tsx
- mobile/src/app/design-preview.tsx
- mobile/src/app/home.tsx
- mobile/src/app/index.tsx
- mobile/src/app/information.tsx
- mobile/src/app/login.tsx
- mobile/src/app/permissions.tsx
- mobile/src/app/prescriptions/[id].tsx
- mobile/src/app/prescriptions/upload.tsx
- mobile/src/app/profile.tsx
- mobile/src/app/register.tsx
- mobile/src/app/settings.tsx
- mobile/src/app/setup.tsx
- mobile/src/app/signup.tsx
- mobile/src/app/symptoms.tsx
- mobile/src/app/timeline.tsx
- mobile/src/app/tool.tsx
- mobile/src/app/voice-review.tsx

## Backend endpoint modules

- backend/app/api/v1/endpoints/ai.py
- backend/app/api/v1/endpoints/alerts.py
- backend/app/api/v1/endpoints/auth.py
- backend/app/api/v1/endpoints/consent.py
- backend/app/api/v1/endpoints/follow_ups.py
- backend/app/api/v1/endpoints/healthcare_workers.py
- backend/app/api/v1/endpoints/medications.py
- backend/app/api/v1/endpoints/patients.py
- backend/app/api/v1/endpoints/prescriptions.py
- backend/app/api/v1/endpoints/speech.py
- backend/app/api/v1/endpoints/symptoms.py
- backend/app/api/v1/endpoints/timeline.py
- backend/app/api/v1/endpoints/wellness.py

## Backend services

- backend/app/services/access_service.py
- backend/app/services/ai_gateway.py
- backend/app/services/ai_service.py
- backend/app/services/alert_service.py
- backend/app/services/audit_service.py
- backend/app/services/auth_service.py
- backend/app/services/chat_policy.py
- backend/app/services/consent_service.py
- backend/app/services/corpus_staging.py
- backend/app/services/hcw_service.py
- backend/app/services/knowledge_service.py
- backend/app/services/medication_service.py
- backend/app/services/ocr_service.py
- backend/app/services/onnx_candidate_encoder.py
- backend/app/services/patient_service.py
- backend/app/services/prescription_service.py
- backend/app/services/retrieval_encoder.py
- backend/app/services/speech_service.py
- backend/app/services/spoken_text.py
- backend/app/services/symptom_service.py
- backend/app/services/timeline_service.py
- backend/app/services/translation_service.py

## Database models

- backend/app/models/__init__.py
- backend/app/models/access.py
- backend/app/models/audit.py
- backend/app/models/consent.py
- backend/app/models/conversations.py
- backend/app/models/knowledge.py
- backend/app/models/medications.py
- backend/app/models/prescriptions.py
- backend/app/models/profiles.py
- backend/app/models/roles.py
- backend/app/models/symptoms.py
- backend/app/models/timeline.py
- backend/app/models/users.py
- backend/app/models/wellness.py
