"""Patient-owned optional wellness fields and dated tracking, additive only."""
from alembic import op
import sqlalchemy as sa
revision = 'c62e1021wellness'
down_revision = '25cb6f5a0d28'
branch_labels = None
depends_on = None

def stamps():
    return [sa.Column('created_at', sa.DateTime(timezone=True), nullable=False), sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)]

def upgrade():
    text_fields = ['conditions','past_illnesses','surgeries','allergies','accessibility_needs','family_history','treatment_history','sleep_notes','activity_notes','dietary_preferences','vaccination_notes','lab_report_notes','health_goals']
    op.create_table('patient_wellness',
        sa.Column('patient_id', sa.UUID(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('gender', sa.String(80)), sa.Column('emergency_contact', sa.String(255)), sa.Column('healthcare_provider', sa.String(255)),
        *[sa.Column(f, sa.Text()) for f in text_fields],
        sa.Column('water_goal_ml', sa.Integer()), sa.Column('step_goal', sa.Integer()),
        sa.Column('large_controls', sa.Boolean(), nullable=False), sa.Column('onboarding_step', sa.Integer(), nullable=False),
        sa.Column('onboarding_complete', sa.Boolean(), nullable=False), sa.Column('health_notice_version', sa.String(10)), *stamps(),
        sa.CheckConstraint('water_goal_ml IS NULL OR water_goal_ml BETWEEN 1 AND 20000'), sa.CheckConstraint('step_goal IS NULL OR step_goal BETWEEN 1 AND 200000'), sa.CheckConstraint('onboarding_step BETWEEN 0 AND 3'))
    op.create_table('wellness_entries', sa.Column('id',sa.UUID(),primary_key=True),
        sa.Column('patient_id',sa.UUID(),sa.ForeignKey('patient_profiles.id',ondelete='CASCADE'),nullable=False),
        sa.Column('operation_id',sa.UUID(),nullable=False), sa.Column('day',sa.Date(),nullable=False),
        sa.Column('kind',sa.String(20),nullable=False),sa.Column('amount',sa.Integer(),nullable=False),sa.Column('source',sa.String(30),nullable=False),*stamps(),
        sa.UniqueConstraint('patient_id','operation_id',name='uq_wellness_operation'),sa.CheckConstraint("kind IN ('water', 'steps')"),sa.CheckConstraint('amount BETWEEN 0 AND 200000'),sa.CheckConstraint("source IN ('manual', 'foreground_sensor')"))
    op.create_index('ix_wellness_entries_patient_id','wellness_entries',['patient_id'])
    op.create_index('ix_wellness_entries_day','wellness_entries',['day'])
    op.create_table('patient_measurements',sa.Column('id',sa.UUID(),primary_key=True),
        sa.Column('patient_id',sa.UUID(),sa.ForeignKey('patient_profiles.id',ondelete='CASCADE'),nullable=False),sa.Column('operation_id',sa.UUID(),nullable=False),
        sa.Column('kind',sa.String(30),nullable=False),sa.Column('value',sa.Float(),nullable=False),sa.Column('secondary_value',sa.Float()),
        sa.Column('unit',sa.String(20),nullable=False),sa.Column('measured_at',sa.DateTime(timezone=True),nullable=False),sa.Column('source',sa.String(20),nullable=False),*stamps(),
        sa.UniqueConstraint('patient_id','operation_id',name='uq_measurement_operation'),sa.CheckConstraint('value > 0'),sa.CheckConstraint("source = 'manual'"))
    op.create_index('ix_patient_measurements_patient_id','patient_measurements',['patient_id'])

def downgrade():
    op.drop_table('patient_measurements'); op.drop_table('wellness_entries'); op.drop_table('patient_wellness')
