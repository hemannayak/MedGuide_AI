# Frontend navigation and service inventory

Decision: reuse the older map as an information-architecture reference, then reconcile every public destination with the current repository. Preserve the existing Next.js architecture and backend boundary.

The shared public header uses grouped Products, Developers, Resources, and Company menus. Its destinations and the five footer groups share one navigation catalogue to prevent drift. Protected patient destinations retain their existing guards. No public links lead directly to API endpoints or to the admin activity monitor.

Technology’s expandable service map documents the 10 modules registered by backend/app/api/v1/router.py: auth, patients, symptoms, ai, medications, timeline, alerts, consent, healthcare-workers, and follow-ups. It does not assert deployment, live connectivity, clinical validity, or API behavior beyond the reviewed contracts. Speech and prescription routers are absent from that central registration. No backend code is changed.

Healthcare-worker lists, summaries, consent-bound access and follow-ups are approved project responsibilities. The current frontend has no worker portal; Product explains the approach at #healthcare-workers. The existing prescription route reports its availability rather than claiming successful OCR.

Rejected historical claims: guaranteed absence of hallucinations, a verified 6,760-chunk corpus, ABDM compliance, automatic ASHA dispatch, SMS triggers and a committed Sarvam/Groq/Qwen production configuration. These need implementation and evidence before publication.

Validation: production build and TypeScript passed; all 43 frontend tests passed, including route/fragment coverage and router-prefix reconciliation. Browser checks confirmed desktop dropdown expansion, mobile Products expansion, visible login, Escape focus restoration, and no horizontal overflow at a 358px CSS viewport. The expandable service table was inspected with all ten rows visible in its accessible structure.
