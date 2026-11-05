"""Add hashed access-token revocation; no changes to existing account rows."""
from alembic import op
import sqlalchemy as sa

revision = 'e05e1105sessions'
down_revision = 'd05e1105otp'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('revoked_access_tokens',
        sa.Column('token_hash', sa.String(64), primary_key=True),
        sa.Column('user_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False))
    op.create_index('ix_revoked_access_tokens_user_id', 'revoked_access_tokens', ['user_id'])
    op.create_index('ix_revoked_access_tokens_expires_at', 'revoked_access_tokens', ['expires_at'])


def downgrade():
    raise RuntimeError('Removing revocations could reactivate credentials; use a reviewed forward migration')
