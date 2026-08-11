"""
MedGuide AI — AI Gateway (M4.3)
=================================
Provider-agnostic LLM gateway. Implements the AIGateway abstract interface
with three concrete providers:
  - MockGateway      : Deterministic test fixture. No external dependencies.
  - OllamaGateway    : Local inference via Ollama. Primary development provider.
  - GroqGateway      : Hosted inference via Groq API. Optional accelerator.

Configuration (via environment variables):
  AI_PROVIDER=ollama          # ollama | groq | mock
  AI_MODEL=llama3.2:3b        # provider-specific model identifier
  GROQ_API_KEY=               # required only when AI_PROVIDER=groq
  OLLAMA_BASE_URL=http://localhost:11434

No provider-specific behavior bleeds into application logic.
All providers implement the identical generate() interface.
"""

import logging
import os
from abc import ABC, abstractmethod
from typing import Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract Interface
# ---------------------------------------------------------------------------
class AIGateway(ABC):
    """Provider-agnostic LLM interface for MedGuide AI."""

    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
    ) -> str:
        """
        Generate a text response given system and user prompts.

        Args:
            system_prompt: Instruction context (safety rules, grounding constraints)
            user_prompt: User message with injected RAG context
            max_tokens: Maximum response token length
            temperature: Generation temperature (low for medical = more deterministic)

        Returns:
            Generated text string.

        Raises:
            AIGatewayError: On provider failure.
        """
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name for logging."""
        ...


class AIGatewayError(Exception):
    """Raised when AIGateway fails to generate a response."""
    pass


# ---------------------------------------------------------------------------
# MockGateway — Deterministic test fixture
# ---------------------------------------------------------------------------
class MockGateway(AIGateway):
    """
    Deterministic mock gateway for unit and integration tests.
    Returns a templated grounded response without any external calls.
    """

    @property
    def provider_name(self) -> str:
        return "mock"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
    ) -> str:
        logger.debug("[MockGateway] Generating deterministic response")
        # Extract first source tag from prompt for realistic citation
        import re
        match = re.search(r"\[1\] Document: (.+?) \|", user_prompt)
        doc_name = match.group(1) if match else "official medical guidelines"
        return (
            f"Based on the verified medical guidelines [1], the recommended approach "
            f"involves following the clinical protocols described in the {doc_name}. "
            f"Please consult a qualified healthcare professional for personalized advice. [1]"
        )


# ---------------------------------------------------------------------------
# OllamaGateway — Local inference (primary development provider)
# ---------------------------------------------------------------------------
class OllamaGateway(AIGateway):
    """
    Local LLM inference via Ollama.
    Enables offline-capable inference — important for rural health center context.
    Requires Ollama installed and running: https://ollama.com
    """

    def __init__(self, model: str, base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url.rstrip("/")

    @property
    def provider_name(self) -> str:
        return f"ollama/{self.model}"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
    ) -> str:
        try:
            import httpx
        except ImportError:
            raise AIGatewayError(
                "httpx is required for OllamaGateway. Install with: pip install httpx"
            )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
            },
        }

        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]
        except Exception as e:
            logger.error(f"[OllamaGateway] Generation failed: {e}")
            raise AIGatewayError(f"Ollama inference failed: {e}") from e


# ---------------------------------------------------------------------------
# GroqGateway — Hosted inference (optional accelerator)
# ---------------------------------------------------------------------------
class GroqGateway(AIGateway):
    """
    Hosted LLM inference via Groq API.
    Optional secondary provider for faster benchmarking and demonstrations.
    Requires GROQ_API_KEY environment variable.
    """

    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key

    @property
    def provider_name(self) -> str:
        return f"groq/{self.model}"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
    ) -> str:
        try:
            import httpx
        except ImportError:
            raise AIGatewayError(
                "httpx is required for GroqGateway. Install with: pip install httpx"
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"[GroqGateway] Generation failed: {e}")
            raise AIGatewayError(f"Groq inference failed: {e}") from e


# ---------------------------------------------------------------------------
# Factory — create gateway from environment configuration
# ---------------------------------------------------------------------------
def create_ai_gateway(
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> AIGateway:
    """
    Create the appropriate AIGateway based on environment configuration.

    Configuration:
        AI_PROVIDER: ollama | groq | mock  (default: mock)
        AI_MODEL: provider-specific model identifier
        GROQ_API_KEY: required when AI_PROVIDER=groq
        OLLAMA_BASE_URL: Ollama server URL (default: http://localhost:11434)

    Returns:
        AIGateway: Configured gateway instance.
    """
    provider = (provider or os.getenv("AI_PROVIDER", "mock")).lower().strip()
    model = model or os.getenv("AI_MODEL", "")

    if provider == "mock":
        logger.info("[AIGateway] Using MockGateway (deterministic test mode)")
        return MockGateway()

    elif provider == "ollama":
        ollama_model = model or "llama3.2:3b"
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        logger.info(f"[AIGateway] Using OllamaGateway: {ollama_model} @ {ollama_url}")
        return OllamaGateway(model=ollama_model, base_url=ollama_url)

    elif provider == "groq":
        groq_model = model or "llama-3.1-8b-instant"
        groq_key = os.getenv("GROQ_API_KEY", "")
        if not groq_key:
            raise AIGatewayError(
                "GROQ_API_KEY environment variable is required when AI_PROVIDER=groq"
            )
        logger.info(f"[AIGateway] Using GroqGateway: {groq_model}")
        return GroqGateway(model=groq_model, api_key=groq_key)

    else:
        raise AIGatewayError(
            f"Unknown AI_PROVIDER: '{provider}'. Supported: ollama | groq | mock"
        )
