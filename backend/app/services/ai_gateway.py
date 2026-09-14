"""
MedGuide AI — AI Gateway (M4.3)
=================================
Provider-agnostic LLM gateway. Implements the AIGateway abstract interface
with concrete providers:
  - MockGateway        : Deterministic test fixture. No external dependencies.
  - OllamaGateway      : Local inference via Ollama. Primary development provider.
  - GroqGateway        : Hosted inference via Groq API. Optional accelerator.
  - HuggingFaceGateway : Serverless inference via Hugging Face Router API (OpenAI compatible).

Configuration (via environment variables):
  AI_PROVIDER=ollama | groq | huggingface | mock
  AI_MODEL=llama3.2:3b | Qwen/Qwen2.5-7B-Instruct | Qwen/Qwen3-4B:featherless-ai
  GROQ_API_KEY=               # required when AI_PROVIDER=groq
  HF_TOKEN=                   # required when AI_PROVIDER=huggingface
  OLLAMA_BASE_URL=http://localhost:11434

No provider-specific behavior bleeds into application logic.
All providers implement the identical generate() interface.
"""

import logging
import os
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

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
        format: Optional[str] = None,
    ) -> str:
        """
        Generate a text response given system and user prompts.

        Args:
            system_prompt: Instruction context (safety rules, grounding constraints)
            user_prompt: User message with injected RAG context
            max_tokens: Maximum response token length
            temperature: Generation temperature (low for medical = more deterministic)
            format: Optional format constraint (e.g. 'json')

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
        format: Optional[str] = None,
    ) -> str:
        logger.debug("[MockGateway] Generating deterministic response")
        # Extract first source tag from prompt for realistic citation
        import re
        match = re.search(r"\[1\] Document: (.+?) \|", user_prompt)
        doc_name = match.group(1) if match else "official medical guidelines"
        
        answer = (
            f"Based on the verified medical guidelines [1], the recommended approach "
            f"involves following the clinical protocols described in the {doc_name}. "
            f"Please consult a qualified healthcare professional for personalized advice. [1]"
        )
        
        if format == "json":
            import json
            return json.dumps({
                "response_type": "INFORMATIONAL",
                "language": "en",
                "answer": answer,
                "citation_ids": [1],
                "requires_escalation": False
            })
        return answer


# ---------------------------------------------------------------------------
# OllamaGateway — Local inference (primary development provider)
# ---------------------------------------------------------------------------
# Bounded output budget for preliminary health guidance JSON (answer, citations,
# escalation flag). ai_service passes max_tokens=800 — enough for concise grounded
# responses without reserving hundreds of tokens for internal reasoning.
OLLAMA_DEFAULT_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"))
OLLAMA_DISABLE_THINKING = os.getenv("OLLAMA_DISABLE_THINKING", "true").lower() == "true"


def _ollama_should_disable_thinking(model: str) -> bool:
    """
    Qwen3 reasoning models enable thinking by default, causing high CPU latency.
    Disable via API-level think=false unless explicitly overridden.
    """
    if not OLLAMA_DISABLE_THINKING:
        return False
    model_lower = model.lower()
    return "qwen3" in model_lower


def build_ollama_chat_payload(
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 800,
    temperature: float = 0.2,
    format: Optional[str] = None,
) -> Dict[str, Any]:
    """Build Ollama /api/chat request payload (testable, single source of truth)."""
    payload: Dict[str, Any] = {
        "model": model,
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
    if format:
        payload["format"] = format
    if _ollama_should_disable_thinking(model):
        payload["think"] = False
    return payload


def extract_ollama_message_content(data: Dict[str, Any]) -> str:
    """
    Return user-visible assistant content only.
    Never expose message.thinking to callers.
    """
    message = data.get("message") or {}
    content = message.get("content")
    if content is None:
        return ""
    if not isinstance(content, str):
        return str(content)
    return content.strip()


class OllamaGateway(AIGateway):
    """
    Local LLM inference via Ollama.
    Enables offline-capable inference — important for rural health center context.
    Requires Ollama installed and running: https://ollama.com
    """

    def __init__(
        self,
        model: str,
        base_url: str = "http://localhost:11434",
        timeout_seconds: float = OLLAMA_DEFAULT_TIMEOUT_SECONDS,
    ):
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    @property
    def provider_name(self) -> str:
        return f"ollama/{self.model}"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
        format: Optional[str] = None,
    ) -> str:
        try:
            import httpx
        except ImportError:
            raise AIGatewayError(
                "httpx is required for OllamaGateway. Install with: pip install httpx"
            )

        payload = build_ollama_chat_payload(
            model=self.model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            format=format,
        )

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                content = extract_ollama_message_content(data)

                # Defensive sanitization: remove any <think>...</think> tags if leaked into content
                if "<think>" in content and "</think>" in content:
                    import re
                    content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                elif "<think>" in content:
                    content = content.split("<think>")[0].strip()

                if not content:
                    raise AIGatewayError(
                        "Ollama returned empty assistant content (thinking may have consumed the token budget)"
                    )
                return content


        except AIGatewayError:
            raise
        except httpx.TimeoutException as e:
            logger.error(f"[OllamaGateway] Request timed out after {self.timeout_seconds}s")
            raise AIGatewayError(
                f"Ollama inference timed out after {self.timeout_seconds}s"
            ) from e
        except httpx.HTTPError as e:
            logger.error(f"[OllamaGateway] HTTP error: {e}")
            raise AIGatewayError(f"Ollama inference failed: {e}") from e
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
        format: Optional[str] = None,
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
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        if format == "json":
            payload["response_format"] = {"type": "json_object"}

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
# HuggingFaceGateway — Serverless inference via HF Router API (OpenAI-compatible)
# ---------------------------------------------------------------------------
class HuggingFaceGateway(AIGateway):
    """
    Hosted LLM inference via Hugging Face Router API (OpenAI compatible).
    Enables serverless execution of open models like Qwen/Qwen2.5-7B-Instruct.
    Requires HF_TOKEN or HUGGINGFACE_API_KEY environment variable.
    """

    def __init__(self, model: str, api_key: str, base_url: str = "https://router.huggingface.co/v1"):
        self.model = model
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    @property
    def provider_name(self) -> str:
        return f"huggingface/{self.model}"

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 800,
        temperature: float = 0.2,
        format: Optional[str] = None,
    ) -> str:
        try:
            import httpx
        except ImportError:
            raise AIGatewayError(
                "httpx is required for HuggingFaceGateway. Install with: pip install httpx"
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        if format == "json":
            payload["response_format"] = {"type": "json_object"}

        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"[HuggingFaceGateway] Generation failed: {e}")
            raise AIGatewayError(f"Hugging Face inference failed: {e}") from e


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
        AI_PROVIDER: ollama | groq | huggingface (hf) | mock  (default: mock)
        AI_MODEL: provider-specific model identifier
        GROQ_API_KEY: required when AI_PROVIDER=groq
        HF_TOKEN / HUGGINGFACE_API_KEY: required when AI_PROVIDER=huggingface
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

    elif provider in {"huggingface", "hf"}:
        hf_model = model or "Qwen/Qwen2.5-7B-Instruct"
        hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY", "")
        if not hf_token:
            raise AIGatewayError(
                "HF_TOKEN or HUGGINGFACE_API_KEY environment variable is required when AI_PROVIDER=huggingface"
            )
        hf_url = os.getenv("HF_BASE_URL", "https://router.huggingface.co/v1")
        logger.info(f"[AIGateway] Using HuggingFaceGateway: {hf_model} @ {hf_url}")
        return HuggingFaceGateway(model=hf_model, api_key=hf_token, base_url=hf_url)

    else:
        raise AIGatewayError(
            f"Unknown AI_PROVIDER: '{provider}'. Supported: ollama | groq | huggingface (hf) | mock"
        )
