"""Conversation topic resolution and conservative multilingual output policy.

These are application safety constraints, not clinical triage rules.
"""
import re


def explanation_topic_chunks(chunks: list[dict], query: str) -> list[dict]:
    """Prefer explicit query-word coverage for English explanation requests.

    Lexical reranking guard, not medical entity extraction. With no covering
    candidate, preserve semantic retrieval rather than fabricate evidence.
    """
    if not wants_explanation(query):
        return chunks
    ignored = set('explain what is are does do mean means meaning me to the a an of in simple simply words language please tell about'.split())
    tokens = {word for word in re.findall(r'\b[a-z]+\b', query.lower()) if word not in ignored}
    if len(tokens) < 2:
        return chunks
    aligned = [chunk for chunk in chunks if tokens <= set(re.findall(r'\b[a-z]+\b', chunk['content'].lower()))]
    return aligned or chunks


def is_explanation_followup(text: str) -> bool:
    text = text.lower().strip()
    markers = (
        "did not understand", "didn't understand", "more simply", "explain again",
        "explain that", "simpler", "समझ नहीं", "और आसान", "అర్థం కాలేదు", "ఇంకా సులభంగా",
    )
    return len(text) <= 240 and any(marker in text for marker in markers)


def retrieval_question(question: str, history: list[dict[str, str]]) -> str:
    """Use the last patient topic; never retrieve from assistant-generated facts."""
    if not is_explanation_followup(question):
        return question
    for turn in reversed(history):
        if turn["role"] == "user" and not is_explanation_followup(turn["content"]):
            return turn["content"]
    return question


def unsafe_medication_advice(text: str) -> bool:
    medicine = r"(?:medicine|medication|tablet|dose|paracetamol|ibuprofen|aspirin|दवा|गोली|पैरासिटामोल|పారాసిటమాల్|మందు|మాత్ర)"
    instruction = r"(?:\btake\b|\bincrease\b|\bdouble\b|ले सकते|ले लें|लेना चाहिए|खाएं|తీసుకోవచ్చు|తీసుకోండి|వేసుకోండి|వేసుకోవచ్చు)"
    negation = r"(?:\bdo not\b|\bdon't\b|\bnever\b|\bcannot\b|\bcan't\b|नहीं|मत |వద్దు|కూడదు)"
    for sentence in re.split(r"[.!?।\n]", text):
        if re.search(medicine, sentence, re.I) and re.search(instruction, sentence, re.I):
            if not re.search(negation, sentence, re.I):
                return True
    return False


def wants_explanation(query: str) -> bool:
    return any(term in query.lower() for term in (
        'explain', 'meaning', 'what does', 'what is', 'मतलब', 'समझा', 'అంటే', 'చెప్ప',
    ))


def evidence_rank(chunk: dict, explanation: bool) -> float:
    """Prefer definitional passages for explanations; retain semantic evidence gate."""
    content = chunk['content'].lower()
    definition = any(term in content for term in (' is the ', ' is defined ', ' means ', ' refers to '))
    return chunk['similarity'] + (0.15 if explanation and definition else 0)


def missed_dose_boundary(question: str, language: str) -> str | None:
    """A product limitation, not a medicine-specific missed-dose instruction."""
    lowered = question.lower()
    missed = any(term in lowered for term in ('forgot', 'missed', 'भूल', 'మర్చిపోయ'))
    medicine = any(term in lowered for term in ('tablet', 'medicine', 'medication', 'dose', 'दवा', 'गोली', 'మందు', 'మాత్ర'))
    if not (missed and medicine):
        return None
    return {
        'en': "I cannot decide whether you should take an extra tablet or change your prescription. Please tell your doctor or pharmacist the medicine name and when you last took it, and ask them what to do about the missed dose.",
        'hi': "मैं यह तय नहीं कर सकता कि आपको अतिरिक्त गोली लेनी चाहिए या दवा की मात्रा बदलनी चाहिए। डॉक्टर या फार्मासिस्ट को दवा का नाम और आखिरी बार कब ली थी बताएं। छूटी हुई दवा के बारे में उनसे निर्देश लें।",
        'te': "అదనపు మాత్ర తీసుకోవాలా లేదా మీ మందు మోతాదు మార్చాలా అని నేను నిర్ణయించలేను. మందు పేరు, చివరిసారి ఎప్పుడు తీసుకున్నారో మీ వైద్యుడు లేదా ఫార్మసిస్ట్‌కు చెప్పండి. మర్చిపోయిన మందు గురించి వారిని అడగండి.",
    }.get(language)
