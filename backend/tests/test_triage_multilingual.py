"""
MedGuide AI — Multilingual Triage & Safety Gate Unit Tests
==========================================================
Tests deterministic symptom triage and red-flag detection across:
- English
- Hindi (Devanagari script)
- Telugu (Telugu script)
- Hinglish (Romanized Hindi)
- Romanized Telugu
- Code-mixed clinical expressions

Ensures 0 false negatives on predefined emergency indicators (Safety Invariant).
"""

import pytest
from app.core.triage import evaluate_symptom_triage
from app.services.ai_service import detect_red_flags


# ---------------------------------------------------------------------------
# Test Suite 1: evaluate_symptom_triage (Core Deterministic Engine)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "query,expected_level",
    [
        # English Emergency
        ("I have severe crushing chest pain radiating to my left arm", "EMERGENCY"),
        ("The patient is unconscious and not responding", "EMERGENCY"),
        ("Sudden weakness on one side and slurred speech", "EMERGENCY"),
        ("Difficulty breathing and coughing blood", "EMERGENCY"),
        ("Suspected snake bite on the leg", "EMERGENCY"),
        
        # Hindi (Devanagari) Emergency
        ("मरीज के सीने में दर्द हो रहा है और घबराहट है", "EMERGENCY"),
        ("अचानक सांस लेने में तकलीफ हो रही है", "EMERGENCY"),
        ("मरीज बेहोश हो गया है", "EMERGENCY"),
        ("खून की उल्टी हुई है", "EMERGENCY"),

        # Telugu (Telugu script) Emergency
        ("రోగికి ఛాతీ నొప్పి చాలా ఎక్కువగా ఉంది", "EMERGENCY"),
        ("శ్వాస తీసుకోవడం కష్టం గా ఉంది", "EMERGENCY"),
        ("స్పృహ కోల్పోవడం జరిగింది", "EMERGENCY"),
        ("రక్తం దగ్గు వస్తోంది", "EMERGENCY"),

        # Hinglish (Romanized Hindi) Emergency
        ("Mujhe seene me dard ho raha hai bahut tez", "EMERGENCY"),
        ("Patient ko saans lene me takleef ho rahi hai", "EMERGENCY"),
        ("Bhaiya achanak behosh ho gaya", "EMERGENCY"),
        ("Khoon ki ulti ho rahi hai subah se", "EMERGENCY"),
        ("Lagta hai dil ka daura pada hai", "EMERGENCY"),
        ("Saanp ne kaat liya hai jungle me", "EMERGENCY"),

        # Romanized Telugu Emergency
        ("Naaku chathi noppi chala ekkuva ga undi", "EMERGENCY"),
        ("Thathayya ki gunde noppi sudden ga vachindi", "EMERGENCY"),
        ("Oopiri andatam ledu chala ibbandi", "EMERGENCY"),
        ("Patient ki spruha ledu em cheyali", "EMERGENCY"),
        ("Raktam kakkadam jarigindi", "EMERGENCY"),
        ("Polam lo pamu katu vesindi", "EMERGENCY"),

        # English Urgent
        ("My child has persistent high fever and severe abdominal pain", "URGENT"),
        ("Inability to keep fluids down and severe dehydration", "URGENT"),

        # Hindi (Devanagari) Urgent
        ("बच्चे को तेज बुखार है और लगातार उल्टी हो रही है", "URGENT"),
        ("पेट में तेज दर्द है", "URGENT"),

        # Telugu (Telugu script) Urgent
        ("పిల్లవాడికి అధిక జ్వరం మరియు నిరంతర వాంతులు", "URGENT"),
        ("కడుపు నొప్పి తీవ్రంగా ఉంది", "URGENT"),

        # Hinglish (Romanized Hindi) Urgent
        ("Bachhe ko tez bukhar hai 102 degree", "URGENT"),
        ("Subah se lagatar ulti ho rahi hai ruk nahi rahi", "URGENT"),
        ("Pet me tez dard ho raha hai", "URGENT"),

        # Romanized Telugu Urgent
        ("Pilladiki pedda jwaram undi", "URGENT"),
        ("Aagakunda vanthulu avuthunnayi", "URGENT"),
        ("Kadupu noppi ga undi thaggadam ledu", "URGENT"),

        # Routine Cases (Ensuring No False Escalations)
        ("I have mild runny nose and sneezing since yesterday", "ROUTINE"),
        ("A slight headache after working on computer", "ROUTINE"),
        ("Halka bukhar lag raha hai thakan hai", "ROUTINE"),
        ("Koncham thala noppi ga undi", "ROUTINE"),
    ],
)
def test_evaluate_symptom_triage_multilingual(query: str, expected_level: str):
    risk_level, red_flags, guidance, escalation_required = evaluate_symptom_triage(query)
    assert risk_level == expected_level, f"Failed for query '{query}': got {risk_level}, expected {expected_level}"
    if expected_level in ("EMERGENCY", "URGENT"):
        assert escalation_required is True
        assert len(red_flags) > 0
    else:
        assert escalation_required is False


# ---------------------------------------------------------------------------
# Test Suite 2: detect_red_flags (Chat AI Service Safety Gate)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "message,should_trigger",
    [
        # English
        ("I have sudden chest pain and sweating", True),
        ("Patient had a seizure", True),
        ("Is paracetamol safe for mild fever?", False),

        # Hinglish
        ("Mummy ko seene me dard hai", True),
        ("Saans lene me dikkat aa rahi hai", True),
        ("Woh achanak behosh ho gaya", True),
        ("Mujhe thoda sar dard hai", False),

        # Romanized Telugu
        ("Naaku sudden ga chathi noppi vachindi", True),
        ("Athadiki gunde noppi undi", True),
        ("Oopiri aadatledu em cheyali", True),
        ("Ninna nundi koncham jalubu ga undi", False),
    ],
)
def test_detect_red_flags_safety_gate(message: str, should_trigger: bool):
    flags = detect_red_flags(message)
    if should_trigger:
        assert len(flags) > 0, f"Expected red flag for: '{message}', but got none"
    else:
        assert len(flags) == 0, f"Unexpected red flag triggered for routine: '{message}', got {flags}"
