# Care API contracts

All paths are relative to /api/v1 and require a signed bearer token. StandardResponse contains success, data and optional message. The running /docs and /openapi.json describe complete request/response schemas.

| Method / endpoint | Authorization | Request | Success |
| --- | --- | --- | --- |
| POST /prescriptions/upload | Own patient profile | multipart file, optional prescribed_date | 201, upload + pending candidates |
| GET /prescriptions, /prescriptions/{id} | Own patient profile | IDs scoped to owner | 200, summaries/detail |
| POST /medications/{id}/verify | Own patient profile | Explicit confirmation | 200, medication |
| POST /medications/{id}/schedules | Own verified medication | frequency, schedule_data.times, dates, IANA timezone | 201, schedule |
| GET /medications/{id}/schedules | Own medication | None | 200, schedules |
| POST /medications/schedules/{id}/adherence | Own schedule | aware scheduled_at, TAKEN/MISSED/SKIPPED | 201, intake |
| GET /medications/schedules/{id}/adherence | Own schedule | None | 200, intake records |
| GET /timeline | Own patient profile | page, page_size | 200, timeline events |
| PATCH /patients/me | Own patient profile | optional bounded display_name, supported preferred_language, existing demographic fields | 200, profile |
| GET /healthcare-workers/patients | Active worker profile and assignments | None | 200, assigned patients |
| GET /healthcare-workers/patients/{id}/records | Active assignment | None | 200, profile/summary/symptoms/medications/prescriptions/alerts |
| POST /healthcare-workers/patients/{id}/medications/{medication_id}/verify | Active assignment and matching medication owner | Explicit confirmation | 200, medication |
| POST /healthcare-workers/patients/{id}/access | ADMIN only | required worker_user_id query | 201, assignment |
| DELETE /healthcare-workers/patients/{id}/access | ADMIN targeting worker; worker own assignment only | worker_user_id required for ADMIN | 200, revoked |
| GET /follow-ups | Patient own or worker assigned patients | optional patient_id query | 200, scoped follow-ups |
| POST /follow-ups | Worker with active assignment | patient_id, reason, future aware scheduled_at, optional notes | 201, follow-up |
| PATCH /follow-ups/{id} | Worker with active assignment | optional PENDING/COMPLETED/CANCELLED status, notes | 200, follow-up |
| PATCH /alerts/{id} | Own patient profile | ACKNOWLEDGED/RESOLVED status | 200, alert |

Errors: 401 missing/invalid token; 403 role/assignment denied; 404 unavailable or non-owned record; 422 schema/state validation; upload additionally 400 empty, 413 oversized, 415 unsupported real file format, 503 OCR unavailable. Schedule times must be non-empty unique HH:MM strings; end_date cannot precede start_date. These are application validation rules, not clinical recommendations.

Security impact: grant is now administrator-only, follow-up data is scoped, and development authentication bypass is removed. No database migration or framework replacement was needed.
