from pydantic import BaseModel, ConfigDict, Field, field_validator, AwareDatetime


class MedicationVerificationRevision(BaseModel):
    model_config = ConfigDict(extra='forbid')
    expected_updated_at: AwareDatetime


class MedicationCorrection(BaseModel):
    """Patient transcription of the original prescription, never a new prescription."""
    model_config = ConfigDict(extra='forbid')
    medicine_name: str = Field(min_length=1, max_length=255)
    dosage: str = Field(min_length=1, max_length=100)
    instructions: str | None = Field(default=None, max_length=2000)
    checked_original: bool

    @field_validator('medicine_name', 'dosage')
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError('Copy the value from the original prescription.')
        return value.strip()
