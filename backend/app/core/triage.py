from typing import Any, Dict, List, Tuple

# Predefined red-flag clinical rules based on documented primary care guidelines
RED_FLAG_KEYWORDS: Dict[str, List[str]] = {
    "EMERGENCY": [
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
    ],
    "URGENT": [
        "high fever",
        "fever over 102",
        "persistent vomiting",
        "blood in stool",
        "severe abdominal pain",
        "inability to keep fluids down",
        "confusion",
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
    combined_text = " ".join([text_lower] + combined_symptoms)

    red_flags: List[str] = []
    risk_level = "ROUTINE"
    escalation_required = False

    # Check emergency indicators
    for kw in RED_FLAG_KEYWORDS["EMERGENCY"]:
        if kw in combined_text:
            red_flags.append(f"Emergency indicator: '{kw}' detected")
            risk_level = "EMERGENCY"
            escalation_required = True

    # Check urgent indicators if not emergency
    if risk_level != "EMERGENCY":
        for kw in RED_FLAG_KEYWORDS["URGENT"]:
            if kw in combined_text:
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
            "Please visit a primary healthcare center or doctor within 24 hours."
        )
    else:
        guidance = (
            "ROUTINE: Your reported symptoms do not match emergency red-flag criteria. "
            "Maintain hydration, rest, and monitor your symptoms. Consult a healthcare worker if symptoms persist or worsen."
        )

    return risk_level, red_flags, guidance, escalation_required
