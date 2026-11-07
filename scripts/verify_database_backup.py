"""Create and restore-verify a PostgreSQL backup without modifying the source DB.

Run from backend: python ../scripts/verify_database_backup.py
Requires a working-tree checkpoint at .local-backups/latest.txt.
The restored copy contains the same sensitive data: never use it for demonstrations.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
from app.core.config import settings


def main():
    folder = Path((ROOT / '.local-backups/latest.txt').read_text())
    if not folder.is_relative_to(ROOT / '.local-backups'):
        raise ValueError('Backup must remain in the private recovery directory')
    url = make_url(settings.sqlalchemy_database_url)
    env = os.environ.copy()
    env.update(PGHOST=url.host or 'localhost', PGPORT=str(url.port or 5432),
               PGUSER=url.username or '', PGPASSWORD=url.password or '')
    dump, restore_tool = shutil.which('pg_dump'), shutil.which('pg_restore')
    if not dump or not restore_tool:
        raise RuntimeError('PostgreSQL backup tools are required')
    source = create_engine(url)
    with source.connect() as connection:
        tables = connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).scalars().all()
        counts = {table: connection.execute(text('SELECT count(*) FROM "' + table.replace('"', '""') + '"')).scalar() for table in tables}
        revisions = connection.execute(text('SELECT version_num FROM alembic_version')).scalars().all()
    path = folder / ('database-' + uuid.uuid4().hex[:8] + '.dump')
    def run(command):
        result = subprocess.run(command, env=env, capture_output=True)
        if result.returncode:
            raise RuntimeError('Database backup tool failed; source unchanged. Inspect privately without exposing credentials.')
        return result.stdout
    run([dump, '-Fc', '--no-owner', '--file', str(path), url.database])
    (folder / 'database-toc.txt').write_bytes(run([restore_tool, '--list', str(path)]))
    restore_name = 'medguide_restore_' + uuid.uuid4().hex[:12]
    admin = create_engine(url.set(database='postgres'), isolation_level='AUTOCOMMIT')
    with admin.connect() as connection:
        connection.execute(text('CREATE DATABASE "' + restore_name + '"'))
    run([restore_tool, '--exit-on-error', '--no-owner', '--no-privileges', '--dbname', restore_name, str(path)])
    restored = create_engine(url.set(database=restore_name))
    with restored.connect() as connection:
        restored_counts = {table: connection.execute(text('SELECT count(*) FROM "' + table.replace('"', '""') + '"')).scalar() for table in tables}
    if counts != restored_counts:
        raise RuntimeError('Counts differ, possibly due to concurrent writes. Do not claim verified recovery.')
    report = dict(source_database=url.database, restore_database=restore_name,
                  migration_heads=revisions, table_counts=counts, restore_counts_match=True,
                  dump_file=path.name, dump_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  limitations='Row counts checked, not a full content comparison. Roles/ACLs and external storage need separate recovery.')
    (folder / 'database-verification.json').write_text(json.dumps(report, indent=2))
    print(json.dumps({key: report[key] for key in ['source_database', 'restore_database', 'migration_heads', 'restore_counts_match']}))
    print('Verified tables:', len(tables))


if __name__ == '__main__':
    main()
