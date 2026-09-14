"""Temporary controlled Qwen3:4B thinking latency comparison — not production code."""
import json
import time
import urllib.request

BASE = "http://localhost:11434"
MODEL = "qwen3:4b"
PROMPT = (
    "Based on verified medical guidelines, briefly explain first-line treatment "
    "for uncomplicated malaria in adults. Answer in 2-3 sentences."
)
SYSTEM = "You are MedGuide AI. Provide safe preliminary health information only."


def run_chat(think: bool | None, label: str) -> dict:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": PROMPT},
        ],
        "stream": False,
        "options": {"num_predict": 200, "temperature": 0.2},
    }
    if think is not None:
        payload["think"] = think

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    start = time.perf_counter()
    with urllib.request.urlopen(req, timeout=300) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    elapsed = time.perf_counter() - start

    msg = body.get("message", {})
    content = msg.get("content") or ""
    thinking = msg.get("thinking") or ""
    return {
        "label": label,
        "think_param": think,
        "latency_s": round(elapsed, 2),
        "content_len": len(content),
        "thinking_len": len(thinking),
        "has_redacted_thinking_in_content": "" in content.lower(),
        "content_preview": content[:300],
        "thinking_preview": thinking[:200] if thinking else None,
    }


if __name__ == "__main__":
    results = []
    for think, label in [(None, "A_default_no_think_param"), (True, "B_think_true"), (False, "C_think_false")]:
        print(f"Running {label}...")
        try:
            results.append(run_chat(think, label))
        except Exception as e:
            results.append({"label": label, "error": str(e)})
        print(json.dumps(results[-1], indent=2))
    print("\n=== SUMMARY ===")
    print(json.dumps(results, indent=2))
