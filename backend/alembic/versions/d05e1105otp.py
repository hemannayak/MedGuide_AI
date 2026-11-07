"""Version OTP storage, adopting equivalent existing tables without data loss."""
from alembic import op
import sqlalchemy as sa

revision = 'd05e1105otp'
down_revision = 'c62e1021wellness'
branch_labels = None
depends_on = None


def upgrade():
    inspector = sa.inspect(op.get_bind())
    columns = [
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('phone_number', sa.String(32), nullable=False),
        sa.Column('otp_hash', sa.String(255), nullable=False),
        sa.Column('purpose', sa.String(32), nullable=False),
        sa.Column('attempts', sa.Integer(), nullable=False),
        sa.Column('max_attempts', sa.Integer(), nullable=False),
        sa.Column('resend_after', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('consumed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    ]
    if not inspector.has_table('otp_records'):
        op.create_table('otp_records', *columns)
        op.create_index('ix_otp_records_phone_number', 'otp_records', ['phone_number'])
        return
    existing = {column['name']: column for column in inspector.get_columns('otp_records')}
    dialect = op.get_bind().dialect
    for column in columns:
        actual = existing.get(column.name)
        if actual is None or actual['nullable'] != column.nullable or str(actual['type'].compile(dialect=dialect)) != str(column.type.compile(dialect=dialect)):
            raise RuntimeError('Existing OTP schema differs; inspect and migrate explicitly')
    if inspector.get_pk_constraint('otp_records')['constrained_columns'] != ['id']:
        raise RuntimeError('Existing OTP primary key differs')
    if not any(index['column_names'] == ['phone_number'] for index in inspector.get_indexes('otp_records')):
        op.create_index('ix_otp_records_phone_number', 'otp_records', ['phone_number'])


def downgrade():
    raise RuntimeError('OTP downgrade would remove authentication records; use a reviewed forward migration')
