"""Conservative lexical denial handling, not a clinical assessment model."""
import re


def explicitly_denied(text: str, start: int, end: int) -> bool:
    """Suppress only adjacent, unambiguous denial; retain unknown assertion scope.

    Negative words inside the matched symptom (e.g. 'cannot breathe') are never
    interpreted as denial. Each occurrence is considered separately.
    """
    before = text[max(0, start - 60):start].lower()
    after = text[end:end + 24].lower()
    # Do not suppress uncertain or historical reports on these lexical cues.
    if re.search(r"\b(?:unsure|uncertain|maybe|previously|earlier|yesterday)\b", before):
        return False
    return bool(
        re.search(r"(?:\bno\s+|\b(?:do not|don't|does not|doesn't) have\s+|\bdenies\s+)$", before)
        or re.match(r"\s+(?:नहीं है|नहीं हैं|nahi hai|లేదు|ledu)(?=$|[\s,.!?।])", after)
    )
