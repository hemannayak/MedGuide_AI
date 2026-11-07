# Deployment and recovery guide — development checkpoint

1. Preserve .local-backups/latest.txt and the referenced private directory outside Git. Do not upload it publicly.
2. working-tree.zip was CRC/hash verified; history.bundle was verified with git bundle verify. Restore into a NEW directory, never over the active workspace blindly. files.json records hashes and git-status.txt identifies the baseline dirty tree.
3. database-*.dump is a pg_dump custom archive. Restore only to a NEW database with pg_restore --exit-on-error --no-owner --no-privileges. Never use --clean against the working database.
4. scripts/verify_database_backup.py reproduces the dump/isolated-restore/count check using backend-only connection settings. It never drops databases and preserves failures for investigation.
5. database-verification.json contains private recovery details. This validation compares table row counts; it does not certify roles/ACLs, byte-for-byte content, external storage or transaction recovery under concurrent writes.
6. Source DB remains at c62e1021wellness. Tested recovery/evaluation DBs use d05e1105otp. Source upgrade remains pending. No source downgrade/drop was performed.
7. The evaluation DB is separate and was initially empty; test fixtures are synthetic. Do not point evaluator services at medguide_ai_dev or the recovery copy.
8. Environment secrets, dependencies, model runtime weights and generated builds need separately reproducible configuration. Production/evaluation HTTPS, signing and monitoring are not yet ready.
