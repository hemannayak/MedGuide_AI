from typing import Any, Dict, List, Optional, Tuple
import re
from app.core.symptom_assertion import explicitly_denied

# Predefined red-flag clinical rules based on documented primary care guidelines
# (WHO PEN, MoHFW STGs, ICMR STWs, and Indian rural multilingual NLP evidence)
RED_FLAG_KEYWORDS: Dict[str, List[str]] = {
    "EMERGENCY": [
        # English
        "chest pain",
        "crushing pain",
        "severe difficulty breathing",
        "shortness of breath",
        "stiff neck with fever",
        "loss of consciousness",
        "unconscious",
        "sudden weakness",
        "slurred speech",
        "coughing blood",
        "severe allergic reaction",
        "anaphylaxis",
        "heart attack",
        "seizure",
        "stroke",
        "snake bite",
        "poisoning",
        # Hindi (Devanagari)
        "सीने में दर्द",
        "छाती में दर्द",
        "सांस लेने में तकलीफ",
        "सांस नहीं आ रही",
        "बेहोश",
        "बेहोशी",
        "खून की उल्टी",
        "गंभीर एलर्जी",
        "अचानक कमजोरी",
        "दिल का दौरा",
        "सांप ने काटा",
        "दौरा पड़ना",
        # Telugu (Telugu script)
        "ఛాతి నొప్పి",
        "ఛాతీ నొప్పి",
        "తీవ్రమైన నొప్పి",
        "శ్వాస తీసుకోవడం కష్టం",
        "ఊపిరి ఆడట్లేదు",
        "ఊపిరి అందడం లేదు",
        "స్పృహ కోల్పోవడం",
        "రక్తం దగ్గు",
        "తీవ్రమైన అలెర్జీ",
        "అకస్మాత్తుగా బలహీనత",
        "గుండెపోటు",
        "పాము కాటు",
        "మూర్ఛ",
        # Hindi (Romanized / Hinglish)
        "seene me dard",
        "seene mein dard",
        "chaati me dard",
        "chhati mein dard",
        "saans lene me dikkat",
        "saans lene me takleef",
        "saans nahi aa rahi",
        "saans ruk rahi",
        "behosh ho gaya",
        "behosh ho gayi",
        "behosh",
        "khoon ki ulti",
        "khoon nikal raha",
        "dil ka daura",
        "saanp ne kaat liya",
        "daura pad raha",
        # Telugu (Romanized)
        "chathi noppi",
        "chati noppi",
        "gunde noppi",
        "gunde manta",
        "swasa theesukovadam kashtam",
        "swasa theesukolekapothunna",
        "oopiri andatam ledu",
        "oopiri aadatledu",
        "spruha ledu",
        "spruha thappindi",
        "raktam kakkadam",
        "raktam vasthondi",
        "murcha poyadu",
        "pamu katu",
    ],
    "URGENT": [
        # English
        "high fever",
        "fever over 102",
        "persistent vomiting",
        "blood in stool",
        "severe abdominal pain",
        "inability to keep fluids down",
        "confusion",
        "dehydration",
        # Hindi (Devanagari)
        "तेज बुखार",
        "लगातार उल्टी",
        "पेट में तेज दर्द",
        "भ्रम",
        "उल्टी रुक नहीं रही",
        # Telugu (Telugu script)
        "అధిక జ్వరం",
        "నిరంతర వాంతులు",
        "పొట్ట నొప్పి",
        "కడుపు నొప్పి",
        "గందరగోళం",
        "వాంతులు ఆగట్లేదు",
        # Hindi (Romanized / Hinglish)
        "tez bukhar",
        "tez bukhaar",
        "bahut tez bukhar",
        "lagatar ulti",
        "ulti ruk nahi rahi",
        "pet me tez dard",
        "pet mein tez dard",
        "pet me bohot dard",
        "pani nahi pee pa raha",
        # Telugu (Romanized)
        "pedda jwaram",
        "theevramaina jwaram",
        "chali jwaram",
        "aagakunda vanthulu",
        "vanthulu aagatledu",
        "kadupu noppi",
        "kadupulo theevramaina noppi",
        "neellu tagalekapotunna",
    ],
}


def evaluate_symptom_triage(
    text_input: str,
    structured_symptoms: Optional[List[str]] = None,
) -> Tuple[str, List[str], str, bool]:
    """
    Evaluates reported symptoms deterministically against red-flag clinical rules.

    Returns:
        Tuple of (risk_level, identified_red_flags, guidance_summary, escalation_required)
    """
    text_lower = text_input.lower()
    combined_symptoms = [s.lower() for s in (structured_symptoms or [])]
    # Keep independently reported fields separate so denial in the narrative
    # cannot negate a positively selected structured symptom.
    inputs = [text_lower] + combined_symptoms

    def reported(keyword: str) -> bool:
        pattern = re.compile(r"(?<!\w)" + re.escape(keyword) + r"(?!\w)")
        return any(not explicitly_denied(text, match.start(), match.end())
                   for text in inputs for match in pattern.finditer(text))

    red_flags: List[str] = []
    risk_level = "ROUTINE"
    escalation_required = False

    # Check emergency indicators
    for kw in RED_FLAG_KEYWORDS["EMERGENCY"]:
        if reported(kw):
            red_flags.append(f"Emergency indicator: '{kw}' detected")
            risk_level = "EMERGENCY"
            escalation_required = True

    # Check urgent indicators if not emergency
    if risk_level != "EMERGENCY":
        for kw in RED_FLAG_KEYWORDS["URGENT"]:
            if reported(kw):
                red_flags.append(f"Urgent indicator: '{kw}' detected")
                risk_level = "URGENT"
                escalation_required = True

    if risk_level == "EMERGENCY":
        guidance = (
            "CRITICAL: Immediate medical emergency evaluation required. "
            "Please seek immediate emergency medical care or call local emergency services."
        )
    elif risk_level == "URGENT":
        guidance = (
            "URGENT: Your symptoms require prompt evaluation by a qualified healthcare professional. "
            "Please contact a qualified healthcare professional promptly for assessment."
        )
    else:
        guidance = (
            "No configured red-flag rule matched the information provided. "
            "This does not establish that your symptoms are safe or identify their cause. "
            "Contact a qualified healthcare professional for assessment; seek immediate help if you believe this is an emergency."
        )

    return risk_level, red_flags, guidance, escalation_required
