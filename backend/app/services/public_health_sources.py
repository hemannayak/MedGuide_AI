"""Publication gates for population-level evidence, not clinical risk rules."""
from datetime import date
from urllib.parse import urlsplit

AUTHORITIES = {"icmr.gov.in", "who.int", "mohfw.gov.in", "ncdc.mohfw.gov.in",
               "idsp.mohfw.gov.in", "iipsindia.ac.in", "nhm.gov.in", "nfhsiips.in"}


def authoritative_url(value: str) -> bool:
    parsed = urlsplit(value)
    host = (parsed.hostname or "").lower()
    return (parsed.scheme == "https" and not parsed.username and not parsed.password
            and parsed.port in (None, 443)
            and any(host == domain or host.endswith("." + domain) for domain in AUTHORITIES))


def validate_public_health_source(source: dict, *, today: date | None = None) -> None:
    """Fail closed before indexing; review flags must come from recorded review.

    Retrieval timestamps do not substitute for the period of observation.
    Noncommercial material cannot silently enter a commercial deployment.
    """
    today = today or date.today()
    required = ("title", "publisher", "source_url", "geography", "population",
                "retrieved_at", "sha256",
                "license", "license_url", "reviewed_by", "limitations")
    if any(not source.get(field) for field in required):
        raise ValueError("Incomplete public-health provenance")
    if not authoritative_url(source["source_url"]):
        raise ValueError("Source must use an approved publisher HTTPS URL")
    digest = source["sha256"]
    if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
        raise ValueError("Invalid source digest")
    scope = source.get("scope")
    if scope == "population_surveillance":
        if not source.get("reporting_start") or not source.get("reporting_end"):
            raise ValueError("Observation period required")
        start, end = date.fromisoformat(source["reporting_start"]), date.fromisoformat(source["reporting_end"])
        if start > end or end > today:
            raise ValueError("Invalid observation period")
    elif scope == "service_navigation":
        if source.get("reporting_start") or source.get("reporting_end"):
            raise ValueError("Service guidance must not imply an observation period")
        if not source.get("reviewed_on") or not source.get("publication_date_status"):
            raise ValueError("Service guidance requires review date and publication date status")
        if date.fromisoformat(source["reviewed_on"]) > today:
            raise ValueError("Review date cannot be in the future")
    else:
        raise ValueError("Unsupported evidence scope")
    setting = source.get("population_setting", "unspecified")
    if setting not in {"rural", "urban", "mixed", "unspecified"}:
        raise ValueError("Invalid population setting")
    if setting in {"rural", "urban"} and not source.get("population_setting_evidence"):
        raise ValueError("Rural or urban classification requires source evidence")
    if source.get("extraction_review") != "APPROVED" or source.get("reuse_review") != "APPROVED":
        raise ValueError("Extraction and reuse review are required")
    if source.get("commercial_use") and source.get("noncommercial_only"):
        raise ValueError("Noncommercial source is incompatible with this deployment")
    if source.get("contains_tables") and not source.get("table_reviewed"):
        raise ValueError("Table extraction must be reviewed before publication")
