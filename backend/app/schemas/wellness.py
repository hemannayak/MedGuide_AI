from datetime import date, datetime, timezone, timedelta
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

class WellnessUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    gender: str | None = Field(None, max_length=80)
    emergency_contact: str | None = Field(None, max_length=255)
    conditions: str | None = Field(None, max_length=2000)
    past_illnesses: str | None = Field(None, max_length=2000)
    surgeries: str | None = Field(None, max_length=2000)
    allergies: str | None = Field(None, max_length=2000)
    accessibility_needs: str | None = Field(None, max_length=2000)
    family_history: str | None = Field(None, max_length=2000)
    treatment_history: str | None = Field(None, max_length=2000)
    sleep_notes: str | None = Field(None, max_length=2000)
    activity_notes: str | None = Field(None, max_length=2000)
    dietary_preferences: str | None = Field(None, max_length=2000)
    healthcare_provider: str | None = Field(None, max_length=255)
    vaccination_notes: str | None = Field(None, max_length=2000)
    lab_report_notes: str | None = Field(None, max_length=2000)
    health_goals: str | None = Field(None, max_length=2000)
    water_goal_ml: int | None = Field(None, ge=1, le=20000)
    step_goal: int | None = Field(None, ge=1, le=200000)
    large_controls: bool | None = None
    onboarding_step: int | None = Field(None, ge=0, le=3)
    onboarding_complete: bool | None = None
    health_notice_version: Literal['1.0'] | None = None
    @model_validator(mode='after')
    def required_non_null(self):
        for key in ('large_controls', 'onboarding_step', 'onboarding_complete'):
            if key in self.model_fields_set and getattr(self, key) is None:
                raise ValueError(f'{key} cannot be null')
        return self

class EntryRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    operation_id: UUID
    day: date
    kind: Literal['water', 'steps']
    amount: int = Field(ge=0, le=200000, strict=True)
    source: Literal['manual', 'foreground_sensor'] = 'manual'
    health_notice_version: Literal['1.0']
    @model_validator(mode='after')
    def valid_entry(self):
        if self.day > date.today() + timedelta(days=1): raise ValueError('Cannot log a future day')
        if self.kind == 'water' and (self.source != 'manual' or not 1 <= self.amount <= 5000):
            raise ValueError('Water entries must be manual and between 1 and 5000 ml')
        return self

UNITS = {'height': 'cm', 'weight': 'kg', 'blood_pressure': 'mmHg', 'blood_glucose': 'mg/dL', 'heart_rate': 'bpm'}
class MeasurementRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    operation_id: UUID
    kind: Literal['height', 'weight', 'blood_pressure', 'blood_glucose', 'heart_rate']
    value: float = Field(gt=0, le=10000, allow_inf_nan=False)
    secondary_value: float | None = Field(None, gt=0, le=10000, allow_inf_nan=False)
    measured_at: datetime
    health_notice_version: Literal['1.0']
    @field_validator('measured_at')
    @classmethod
    def aware_time(cls, value):
        if value.tzinfo is None or value > datetime.now(timezone.utc) + timedelta(minutes=5): raise ValueError('Use a valid timestamp with timezone, not in the future')
        return value
    @model_validator(mode='after')
    def pressure_pair(self):
        if (self.kind == 'blood_pressure') != (self.secondary_value is not None): raise ValueError('Blood pressure needs both readings; other measurements need one')
        return self
