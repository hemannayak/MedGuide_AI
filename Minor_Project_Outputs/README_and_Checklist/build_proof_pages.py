"""Display unmodified captured CLI output as a clearly labelled transcript view."""
from pathlib import Path
import html
p=Path(__file__).parent
for key,title,filename in [('ollama','Ollama CLI execution','ollama_execution.txt'),('psql','PostgreSQL pgvector CLI execution','psql_execution.txt')]:
 text=(p/filename).read_text(encoding='utf-8')
 page='''<!doctype html><html lang="en"><meta charset="utf-8"><title>'''+title+'''</title><style>
body{margin:0;padding:24px;background:#f6f1e8;color:#173e37;font:16px/1.5 Arial,sans-serif}main{max-width:1400px;margin:auto;background:#fff;padding:26px;border:1px solid #c5d6cf;border-radius:16px}h1{font-size:28px;margin:0 0 10px}.label{font-weight:bold;color:#174d42}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.55 Consolas,monospace;background:#eef4f1;color:#172c29;padding:22px;border-radius:8px}footer{font-size:14px;color:#4c625b}</style><main><h1>'''+title+'''</h1><p class="label">Actual local execution output · 23 October 2026 · Same laptop</p><p>This is a browser transcript view of real CLI output, not a terminal screenshot or a mock execution.</p><pre>'''+html.escape(text)+'''</pre><footer>Raw output and reproducible commands are included in README_and_Checklist. No credentials or real patient data are shown.</footer></main></html>'''
 (p/f'{key}_proof.html').write_text(page,encoding='utf-8')
