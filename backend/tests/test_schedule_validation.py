from datetime import date
import pytest
from pydantic import ValidationError
from app.schemas.medication import MedicationScheduleCreateRequest, MedicationAdherenceRecordRequest


@pytest.mark.parametrize("data", [
    {"schedule_data": {"times": []}}, {"schedule_data": {"times": ["25:00"]}},
    {"schedule_data": {"times": ["08:00", "08:00"]}}, {"timezone": "invalid-zone"},
    {"end_date": date(2026, 1, 1)}, {"frequency": " "},
])
def test_invalid_schedule_is_rejected(data):
    values = dict(frequency="SYN prescribed label", schedule_data={"times": ["08:00"]}, start_date=date(2026, 2, 1), timezone="UTC")
    values.update(data)
    with pytest.raises(ValidationError): MedicationScheduleCreateRequest(**values)


def test_intake_requires_supported_status_and_timezone():
    with pytest.raises(ValidationError): MedicationAdherenceRecordRequest(scheduled_at="2026-01-01T08:00:00", status="TAKEN")
    with pytest.raises(ValidationError): MedicationAdherenceRecordRequest(scheduled_at="2026-01-01T08:00:00Z", status="UNKNOWN")
