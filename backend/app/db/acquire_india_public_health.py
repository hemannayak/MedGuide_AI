"""Stage publisher PDFs for review; never automatically approve or index them."""
import hashlib
import argparse
import json
import os
import tempfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
import httpx
from pypdf import PdfReader
from app.services.public_health_sources import authoritative_url

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs/data/india_public_health"
MAX_BYTES = 50 * 1024 * 1024


def checkpoint(path, sources, previous, completed):
    """Preserve unvisited records and replace the manifest atomically.

    The append-only history records attempts; this snapshot records the latest
    attempt for each selected source, including sources not yet visited.
    """
    current = {row["id"]: row for row in completed}
    rows = []
    for source in sources:
        prior = previous.get(source["id"])
        if source["id"] in current:
            rows.append(current[source["id"]])
        elif prior and prior.get("source_url") == source["source_url"]:
            rows.append(prior)
        else:
            rows.append(dict(source, status="NOT_ATTEMPTED", indexed=False))
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                         suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            json.dump(rows, stream, indent=2, ensure_ascii=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def download(client, url):
    for _ in range(5):
        if not authoritative_url(url):
            raise ValueError("Unapproved source or redirect")
        with client.stream("GET", url) as response:
            if response.is_redirect:
                url = str(response.url.join(response.headers["location"]))
                continue
            response.raise_for_status()
            content = bytearray()
            for block in response.iter_bytes():
                content.extend(block)
                if len(content) > MAX_BYTES:
                    raise ValueError("Source exceeds acquisition limit")
            if not content.startswith(b"%PDF-"):
                raise ValueError("Publisher did not return a PDF")
            return bytes(content), str(response.url)
    raise ValueError("Too many redirects")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--retry-failed", action="store_true", help="Reuse successful, hash-verified local snapshots")
    parser.add_argument("--collection", type=Path, default=OUT,
                        help="Directory containing selection.json; keeps review collections separate")
    args = parser.parse_args()
    output = args.collection.resolve()
    sources = json.loads((output / "selection.json").read_text(encoding="utf-8"))
    if len({row["id"] for row in sources}) != len(sources):
        raise ValueError("Duplicate source IDs in selection")
    previous_path = output / "acquisition.json"
    previous = {row["id"]: row for row in json.loads(previous_path.read_text(encoding="utf-8"))} if previous_path.exists() else {}
    cache = ROOT / "backend/.model-cache/public-health-sources"
    cache.mkdir(parents=True, exist_ok=True)
    results = []
    with httpx.Client(timeout=60, follow_redirects=False) as client:
        for row in sources:
            prior = previous.get(row["id"], {})
            if args.retry_failed and prior.get("status") == "ACQUIRED_NOT_APPROVED" and prior.get("source_url") == row["source_url"]:
                saved = ROOT / prior["local_pdf"]
                if saved.exists() and hashlib.sha256(saved.read_bytes()).hexdigest() == prior["sha256"]:
                    results.append(prior)
                    continue
            result = dict(row, indexed=False, review_status="PENDING",
                          retrieved_at=datetime.now(timezone.utc).isoformat())
            try:
                data, resolved = download(client, row["source_url"])
                digest = hashlib.sha256(data).hexdigest()
                path = cache / f"{digest}.pdf"
                if not path.exists():
                    path.write_bytes(data)
                reader = PdfReader(BytesIO(data))
                pages = []
                for i, page in enumerate(reader.pages):
                    try:
                        extracted = page.extract_text(extraction_mode="layout") or ""
                        method = "pypdf-layout"
                    except (KeyError, ValueError):
                        extracted = page.extract_text() or ""
                        method = "pypdf-plain-fallback-review-required"
                    pages.append({"page": i + 1, "text": extracted, "extractor": method})
                # Text extraction is a review artifact, not an approved knowledge chunk.
                (cache / f"{digest}.json").write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
                result.update(status="ACQUIRED_NOT_APPROVED", sha256=digest, resolved_url=resolved,
                              bytes=len(data), pages=len(pages),
                              nonempty_pages=sum(bool(p["text"].strip()) for p in pages),
                              local_pdf=str(path.relative_to(ROOT)),
                              extraction_review="PENDING", reuse_review="PENDING")
            except Exception as exc:
                result.update(status="FAILED", error_type=type(exc).__name__)
                if isinstance(exc, httpx.HTTPStatusError):
                    result["http_status"] = exc.response.status_code
            results.append(result)
            with (output / "acquisition_history.jsonl").open("a", encoding="utf-8") as history:
                history.write(json.dumps(result) + "\n")
            checkpoint(previous_path, sources, previous, results)
            print(row["id"], result["status"], flush=True)
    checkpoint(previous_path, sources, previous, results)


if __name__ == "__main__":
    main()
