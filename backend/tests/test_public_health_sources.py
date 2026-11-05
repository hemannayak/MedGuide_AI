from datetime import date
import pytest
from app.services.public_health_sources import authoritative_url, validate_public_health_source


def source():
    return dict(title="Synthetic validation fixture", publisher="NCDC", source_url="https://ncdc.mohfw.gov.in/report.pdf",
                geography="India", population="Reporting facilities", reporting_start="2024-01-01",
                reporting_end="2024-12-31", retrieved_at="2026-11-03", sha256="a" * 64,
                license="Attribution required", license_url="https://ncdc.mohfw.gov.in/policy",
                reviewed_by="TEST ONLY", limitations="Not population prevalence", scope="population_surveillance",
                extraction_review="APPROVED", reuse_review="APPROVED")


def test_valid_record():
    validate_public_health_source(source(), today=date(2026, 11, 3))


def test_care_access_has_review_date_not_observation_period():
    row = source() | {"scope": "service_navigation", "reviewed_on": "2026-11-03",
                      "publication_date_status": "Undated source"}
    with pytest.raises(ValueError, match="observation period"):
        validate_public_health_source(row)
    del row["reporting_start"], row["reporting_end"]
    validate_public_health_source(row, today=date(2026, 11, 3))
    with pytest.raises(ValueError, match="review date"):
        validate_public_health_source(row | {"reviewed_on": ""})
    with pytest.raises(ValueError, match="future"):
        validate_public_health_source(row | {"reviewed_on": "2035-01-01"})


def test_rural_classification_requires_explicit_evidence():
    with pytest.raises(ValueError, match="classification requires"):
        validate_public_health_source(source() | {"population_setting":"rural"})


@pytest.mark.parametrize("url", ["http://who.int/a", "https://who.int.evil.test/a", "https://evilwho.int/a", "https://user:password@who.int/a", "https://127.0.0.1/a"])
def test_reject_untrusted_urls(url):
    assert not authoritative_url(url)


@pytest.mark.parametrize("change", [dict(reporting_end="2030-01-01"), dict(reporting_start="2025-01-01"),
    dict(sha256="fake"), dict(scope="clinical_guidance"), dict(extraction_review="PENDING"),
    dict(reuse_review="PENDING"), dict(commercial_use=True, noncommercial_only=True),
    dict(contains_tables=True), dict(population="")])
def test_publication_gate(change):
    row = source() | change
    with pytest.raises(ValueError):
        validate_public_health_source(row, today=date(2026, 11, 3))
