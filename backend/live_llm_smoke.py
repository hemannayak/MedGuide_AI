"""Opt-in synthetic Ollama/Sarvam inference checks, not clinical evaluation."""
import argparse
import json
import time
from pathlib import Path

from app.core.config import settings  # Load local environment without printing secrets.
from app.services.ai_gateway import AIGatewayError, create_ai_gateway


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="store_true")
    parser.add_argument("--ollama-model", default="qwen3:4b")
    args = parser.parse_args()
    if not args.run:
        parser.error("Pass --run to make local and external synthetic inference requests")
    results = []
    for provider, model in [("ollama", args.ollama_model), ("sarvam", "sarvam-105b-conversations")]:
        for language in ("English", "Hindi", "Telugu"):
            started = time.monotonic()
            row = {"provider": provider, "model": model, "language": language}
            try:
                answer = create_ai_gateway(provider, model).generate(
                    'Return JSON only with an "answer" string. No medical advice.',
                    f"Say hello in {language}. This is a synthetic connection test.",
                    max_tokens=160, format="json",
                )
                parsed = json.loads(answer)
                row["passed"] = isinstance(parsed.get("answer"), str) and bool(parsed["answer"].strip())
            except (AIGatewayError, ValueError, AttributeError) as error:
                row["passed"] = False
                row["error_type"] = type(error).__name__
                # Gateway errors are sanitized; never store raw provider bodies.
            row["seconds"] = round(time.monotonic() - started, 2)
            results.append(row)
            print(json.dumps(row), flush=True)
    target = Path(__file__).resolve().parent.parent / "evaluation" / "llm_connection_results.json"
    target.write_text(json.dumps({"synthetic": True, "clinical_accuracy_evaluated": False,
                                  "results": results}, indent=2), encoding="utf-8")
    return 0 if all(row["passed"] for row in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
