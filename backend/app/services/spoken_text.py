"""Presentation-only formatting for speech; never rewrite medical meaning."""
import re


def prepare_spoken_text(text: str) -> str:
    # Strip paired visual emphasis, not multiplication/units or medical numbers.
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    lines = []
    for line in text.splitlines():
        line = re.sub(r"^\s*#{1,6}\s+", "", line).strip()
        if not line:
            continue
        # Paragraph boundaries become pauses, without changing sentence order.
        if lines and lines[-1][-1] not in '.!?।:;':
            lines[-1] += '.'
        lines.append(line)
    return ' '.join(lines)
