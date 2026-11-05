"""
MedGuide AI — Translation Gateway & Service (M4.3 Multilingual RAG Bridge)
==========================================================================
Provider-agnostic translation gateway for non-emergency Indic query bridging.
Implements the TranslationGateway abstract interface with concrete providers:
  - MockTranslationGateway      : Deterministic test fixture & evaluation fixture.
  - SarvamTranslationGateway    : Hosted Indic translation via Sarvam AI API (online only).
  - DisabledTranslationGateway  : Explicit offline / disabled gateway (fails closed safely).

Architecture & Safety Rules:
1. Translation is STRICTLY a non-emergency retrieval bridge to index English medical corpus.
2. Translation is NEVER used for:
   - Emergency / Red-flag classification (handled deterministically pre-retrieval)
   - Replacing original user query in conversation history
   - Safety guardrails or medication safety checks
3. Sarvam is an ONLINE-ONLY provider. The system must NEVER claim Sarvam is available offline.
4. If translation is unavailable (offline, network failure, timeout), the system must
   fail gracefully back to direct local retrieval (Mode A) without crashing.
"""

import logging
import os
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract Interface
# ---------------------------------------------------------------------------
class TranslationGateway(ABC):
    """Provider-agnostic translation interface for MedGuide AI."""

    @abstractmethod
    def translate(
        self,
        text: str,
        source_language: str,
        target_language: str = "en",
    ) -> str:
        """
        Translate input text from source_language to target_language.

        Args:
            text: Input text string in source language.
            source_language: ISO language code (e.g. 'te', 'hi').
            target_language: Target ISO language code (default 'en').

        Returns:
            Translated text string.

        Raises:
            TranslationError: If translation fails or is unavailable.
        """
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name for logging and auditing."""
        ...

    @property
    @abstractmethod
    def is_online(self) -> bool:
        """True if provider requires network connectivity."""
        ...


class TranslationError(Exception):
    """Raised when translation fails or provider is unavailable."""
    pass


# ---------------------------------------------------------------------------
# MockTranslationGateway — Deterministic fixture for testing and offline eval
# ---------------------------------------------------------------------------
class MockTranslationGateway(TranslationGateway):
    """
    Deterministic mock translation gateway.
    Uses an internal lookup dictionary for evaluation and test queries,
    with a fallback placeholder mapping.
    """

    # Empirical dictionary from the verified 21-query benchmark
    KNOWN_TRANSLATIONS: Dict[str, str] = {
        # 1. Disease Information
        "ఫాల్సిపారమ్ మలేరియా ఎలా వ్యాపిస్తుంది మరియు దాని తీవ్రత ఏమిటి?":
            "How is falciparum malaria transmitted and what is its severity?",
        "చిన్నపిల్లలలో ప్రాథమిక పల్మనరీ క్షయవ్యాధి ఎలా నిర్ధారిస్తారు?":
            "How is primary pulmonary tuberculosis diagnosed in young children?",
        # 2. Symptoms
        "తీవ్రమైన మలేరియా జ్వరంలో కనిపించే ముఖ్య లక్షణాలు ఏమిటి?":
            "What are the main symptoms seen in severe malaria fever?",
        "ఆస్తమా అటాక్ వచ్చినప్పుడు రోగిలో ఎలాంటి శ్వాస ఇబ్బందులు ఉంటాయి?":
            "What breathing difficulties does a patient experience during an asthma attack?",
        # 3. Treatment / General Management
        "పెద్దవారిలో హైపర్ టెన్షన్ చికిత్సకు మొదట ఇచ్చే మొదటి శ్రేణి మందులు ఏవి?":
            "What are the first-line medications given initially for the treatment of hypertension in adults?",
        "గర్భిణీ స్త్రీలలో మొదటి త్రైమాసికంలో మలేరియా చికిత్సకు ఏ మందులు ఇవ్వకూడదు?":
            "Which medicines should not be given for malaria treatment in the first trimester of pregnant women?",
        "టీబీ మెనింజైటిస్ సోకిన పిల్లలకు కార్టికోస్టెరాయిడ్స్ ఎన్ని వారాలు ఇవ్వాలి?":
            "For how many weeks should corticosteroids be given to children infected with TB meningitis?",
        # 4. Duration
        "పిల్లలలో పల్మనరీ టీబీ చికిత్స ఎన్ని నెలలు కొనసాగించాలి?":
            "How many months should pulmonary TB treatment be continued in children?",
        "సాధారణ మలేరియాకు ఆర్టెమిసినిన్ కాంబినేషన్ థెరపీ ఎన్ని రోజులు వాడాలి?":
            "For how many days should Artemisinin combination therapy be used for uncomplicated malaria?",
        # 5. Risk Factors
        "ప్రాథమిక ఆరోగ్య కేంద్రంలో గుండె జబ్బుల ముప్పు అంచనాకు ఏ రిస్క్ చార్టులు వాడతారు?":
            "Which risk charts are used at a primary health center to assess cardiovascular disease risk?",
        "రక్తపోటు పెరగడానికి దారితీసే జీవనశైలి మరియు ఆహారపు అలవాట్లు ఏవి?":
            "What lifestyle and dietary habits lead to an increase in blood pressure?",
        # 6. Prevention
        "మలేరియా నివారణకు దోమతెరలు మరియు కీటకనాశని స్ప్రేల పాత్ర ఏమిటి?":
            "What is the role of mosquito nets and insecticide sprays in the prevention of malaria?",
        "టైప్ 2 డయాబెటిస్ రాకుండా ప్రాథమిక స్థాయిలో ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?":
            "What precautions should be taken at the primary level to prevent the onset of type 2 diabetes?",
        # 7. Emergency-Related Wording
        "తీవ్రమైన మలేరియా వల్ల రోగి అపస్మారక స్థితికి వెళ్తే ప్రాథమికంగా ఏ ఇంజెక్షన్ ఇవ్వాలి?":
            "If a patient becomes unconscious due to severe malaria, which primary injection should be given?",
        "తీవ్రమైన ఆస్తమా ఎటాక్ వచ్చినప్పుడు నెబ్యులైజేషన్ లేదా సాల్బుటమాల్ ఎలా ఇవ్వాలి?":
            "When a severe asthma attack occurs, how should nebulization or salbutamol be administered?",
        # 8. Colloquial / Rural Phrasing
        "నాకు బీపీ బాగా పెరిగింది, తల తిరుగుతోంది, డాక్టర్ దగ్గరికి వెళ్లేలోపు ఏం చేయాలి?":
            "My blood pressure is very high and I feel dizzy, what should I do before going to the doctor?",
        "చలిజ్వరం వణికిస్తోంది, కీళ్ల నొప్పులు ఉన్నాయి, ఇది మలేరియా కావచ్చా?":
            "I have shivering chills and fever with joint pain, could this be malaria?",
        "పిల్లాడికి నెల రోజులుగా దగ్గు తగ్గట్లేదు, బరువు తగ్గిపోతున్నాడు, టీబీ పరీక్ష చేయించాలా?":
            "Child has persistent cough for over a month and is losing weight, should a TB test be done?",
        # 9. Telugu-English Mixed
        "Adults లో high blood pressure ని initiate చేయడానికి threshold level ఎంత?":
            "What is the threshold level to initiate treatment for high blood pressure in adults?",
        "Primary health center లో severe asthma attack కి salbutamol inhaler dose ఎంత?":
            "What is the salbutamol inhaler dosage for severe asthma attack in a primary health center?",
        "Paediatric TB లో diagnosis కోసం gastric aspirate sample ఎలా collect చేస్తారు?":
            "How is gastric aspirate sample collected for diagnosis in paediatric TB?",
        # General test phrases
        "మలేరియా అంటే ఏమిటి?":
            "What is malaria?",
    }

    def __init__(self, custom_translations: Optional[Dict[str, str]] = None):
        self._custom = custom_translations or {}

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def is_online(self) -> bool:
        return False

    def translate(
        self,
        text: str,
        source_language: str,
        target_language: str = "en",
    ) -> str:
        clean_text = text.strip()
        if not clean_text:
            return ""

        # Same language passthrough
        if source_language.lower() == target_language.lower():
            return clean_text

        # Check custom or known translations
        if clean_text in self._custom:
            return self._custom[clean_text]
        if clean_text in self.KNOWN_TRANSLATIONS:
            return self.KNOWN_TRANSLATIONS[clean_text]

        # Deterministic fallback for test queries
        logger.debug(f"[MockTranslationGateway] Unknown query '{clean_text[:40]}...', returning mock bridge.")
        return f"{clean_text} (translated to {target_language})"


# ---------------------------------------------------------------------------
# SarvamTranslationGateway — Hosted Indic translation via Sarvam AI API (Online)
# ---------------------------------------------------------------------------
SARVAM_TRANSLATE_URL = os.getenv("SARVAM_TRANSLATE_URL", "https://api.sarvam.ai/translate")
SARVAM_TIMEOUT_SECONDS = float(os.getenv("SARVAM_TIMEOUT_SECONDS", "10.0"))

LANGUAGE_CODE_MAP: Dict[str, str] = {
    "te": "te-IN",
    "hi": "hi-IN",
    "en": "en-IN",
}


class SarvamTranslationGateway(TranslationGateway):
    """
    Online translation gateway via Sarvam AI REST API.
    Used strictly as an online bridge for non-emergency RAG queries.
    Never used for emergency triage or offline operations.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = SARVAM_TRANSLATE_URL,
        timeout_seconds: float = SARVAM_TIMEOUT_SECONDS,
    ):
        self.api_key = os.getenv("SARVAM_API_KEY", "") if api_key is None else api_key
        self.base_url = base_url
        self.timeout_seconds = timeout_seconds

        if not self.api_key:
            logger.warning("[SarvamTranslationGateway] Initialized without SARVAM_API_KEY. Calls will fail closed.")

    @property
    def provider_name(self) -> str:
        return "sarvam"

    @property
    def is_online(self) -> bool:
        return True

    def translate(
        self,
        text: str,
        source_language: str,
        target_language: str = "en",
    ) -> str:
        clean_text = text.strip()
        if not clean_text:
            return ""

        if source_language.lower() == target_language.lower():
            return clean_text

        if not self.api_key:
            raise TranslationError(
                "SARVAM_API_KEY is not configured. Online translation unavailable."
            )

        try:
            import httpx
        except ImportError:
            raise TranslationError(
                "httpx is required for SarvamTranslationGateway. Install with: pip install httpx"
            )

        src_code = LANGUAGE_CODE_MAP.get(source_language.lower(), source_language)
        tgt_code = LANGUAGE_CODE_MAP.get(target_language.lower(), target_language)

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "input": clean_text,
            "source_language_code": src_code,
            "target_language_code": tgt_code,
            "mode": "formal",
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                translated = data.get("translated_text")
                if not translated:
                    raise TranslationError("Sarvam returned empty translated_text")
                return translated.strip()
        except httpx.TimeoutException as e:
            logger.error(f"[SarvamTranslationGateway] Translation timed out after {self.timeout_seconds}s")
            raise TranslationError(f"Sarvam translation timed out: {e}") from e
        except httpx.HTTPError as e:
            logger.error(f"[SarvamTranslationGateway] HTTP error: {e}")
            raise TranslationError(f"Sarvam translation HTTP error: {e}") from e
        except Exception as e:
            logger.error(f"[SarvamTranslationGateway] Translation failed: {e}")
            raise TranslationError(f"Sarvam translation failed: {e}") from e


# ---------------------------------------------------------------------------
# DisabledTranslationGateway — Offline / Translation-Disabled Fallback
# ---------------------------------------------------------------------------
class DisabledTranslationGateway(TranslationGateway):
    """
    Explicit gateway representing an offline or disabled translation state.
    Always raises TranslationError to force callers to gracefully fallback to direct retrieval.
    """

    @property
    def provider_name(self) -> str:
        return "disabled"

    @property
    def is_online(self) -> bool:
        return False

    def translate(
        self,
        text: str,
        source_language: str,
        target_language: str = "en",
    ) -> str:
        raise TranslationError("Translation gateway is disabled or in offline mode.")


# ---------------------------------------------------------------------------
# Factory — create translation gateway from configuration
# ---------------------------------------------------------------------------
def create_translation_gateway(
    provider: Optional[str] = None,
    api_key: Optional[str] = None,
) -> TranslationGateway:
    """
    Create the appropriate TranslationGateway based on configuration.

    Configuration:
        TRANSLATION_PROVIDER: sarvam | mock | disabled (default: mock if SARVAM_API_KEY unset, else sarvam)
        SARVAM_API_KEY: required for online Sarvam translation
    """
    env_provider = os.getenv("TRANSLATION_PROVIDER")
    if provider is None:
        if env_provider:
            provider = env_provider.lower().strip()
        elif os.getenv("SARVAM_API_KEY"):
            provider = "sarvam"
        else:
            provider = "disabled"

    provider = provider.lower().strip()

    if provider == "mock":
        if settings.APP_ENV != "test":
            return DisabledTranslationGateway()
        return MockTranslationGateway()
    elif provider == "sarvam":
        return SarvamTranslationGateway(api_key=api_key)
    elif provider in {"disabled", "none", "offline"}:
        return DisabledTranslationGateway()
    else:
        logger.warning(f"[TranslationGateway] Unknown provider '{provider}', falling back to disabled.")
        return DisabledTranslationGateway()
