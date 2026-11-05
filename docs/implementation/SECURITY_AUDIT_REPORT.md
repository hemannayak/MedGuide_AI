# Security audit — preliminary findings

| Finding | Severity | Status |
|---|---|---|
| Logout does not invalidate bearer token | High | Open; do not approve evaluator release until session semantics are implemented/tested |
| Partial account persistence if profile save fails | High | Fixed with one transaction; injected-failure test added |
| Suspended account can receive a new login token | Medium | Fixed at login; API already rejects inactive accounts |
| OTP table absent from fresh migrations | High reliability | Migration added and tested on restored/fresh databases |
| Unnecessary login identifiers in audit metadata | Medium privacy | Removed for new authentication events; existing audit rows preserved |
| All-endpoint ownership / token lifecycle audit incomplete | High release gate | Pending |

No compliance certification, penetration-test completion or absence-of-vulnerabilities claim. Recovery archives contain sensitive data and must remain local, access-controlled and excluded from Git. Environment credentials are not in the archive; preserve them through a separate secret-management process.
