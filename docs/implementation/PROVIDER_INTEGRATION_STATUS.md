# Provider integration status

AI and speech: existing adapters preserved. Prior real English voice pipeline and synthesized en/hi/te provider probes succeeded; current live quota/availability not retested.
SMS: no real dispatcher configured in implementation; production OTP explicitly unavailable. Authorized test number alone is not provider access or delivery evidence.
Email: SMTP adapter exists; actual delivery and recovery workflow remain unverified. Never place SMTP_PASSWORD in frontend or reports.
Push: local Expo reminders are not remote push delivery. Device token lifecycle, provider submission/receipt processing and physical-device tests remain pending.
No paid service was purchased or made mandatory. Credentials, provider access, messaging templates/authorization and test recipients must be verified before delivery tests.
