from pathlib import Path
import sys,json,html
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from sqlalchemy import text
from app.db.session import engine
out=Path(__file__).parent/'storage-capture';out.mkdir(exist_ok=True)
q1="""SELECT current_database() AS database,
       current_setting('server_version') AS postgres_version,
       extversion AS pgvector_version
FROM pg_extension WHERE extname = 'vector';"""
q2="""SELECT u.login_identifier AS synthetic_account, u.status,
       COUNT(DISTINCT c.id) AS conversations,
       COUNT(m.id) AS stored_messages
FROM users u
JOIN patient_profiles p ON p.user_id = u.id
LEFT JOIN conversations c ON c.patient_id = p.id
LEFT JOIN conversation_messages m ON m.conversation_id = c.id
WHERE u.login_identifier = 'SYN-report-20261014@example.invalid'
GROUP BY u.login_identifier, u.status;"""
q3="""SELECT m.sender_type, LEFT(m.content, 110) AS stored_input
FROM conversation_messages m
JOIN conversations c ON c.id = m.conversation_id
JOIN patient_profiles p ON p.id = c.patient_id
JOIN users u ON u.id = p.user_id
WHERE u.login_identifier = 'SYN-report-20261014@example.invalid'
  AND lower(m.sender_type) = 'user'
ORDER BY m.created_at DESC LIMIT 2;"""
data=[]
with engine.connect() as c:
 c.execute(text('SET TRANSACTION READ ONLY'))
 for q in [q1,q2,q3]:
  r=c.execute(text(q));data.append({'query':q,'columns':list(r.keys()),'rows':[list(row) for row in r.fetchall()]})
assert data[1]['rows'] and data[1]['rows'][0][-1]>0
(out/'query-results.json').write_text(json.dumps(data,indent=2,default=str))
def table(item):
 return '<table><thead><tr>'+''.join('<th>'+html.escape(x)+'</th>' for x in item['columns'])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in row)+'</tr>' for row in item['rows'])+'</tbody></table>'
sections=''.join('<section><h2>'+title+'</h2><pre>'+html.escape(item['query'])+'</pre>'+table(item)+'</section>' for title,item in zip(['1. PostgreSQL and vector extension','2. Persisted synthetic conversation records','3. Stored synthetic input samples'],data))
page='''<!doctype html><html><meta charset="utf-8"><title>PostgreSQL Storage Verification</title><style>
*{box-sizing:border-box}body{margin:0;padding:22px;font:14px Arial;color:#203047;background:#eef2f5}main{max-width:1100px;margin:auto;background:white;padding:26px;border:1px solid #cad4df;border-radius:8px}h1{font-size:25px;margin:0 0 8px}p{line-height:1.5}h2{font-size:17px;margin:22px 0 10px}pre{font:12px/1.5 Consolas,monospace;background:#122237;color:#e5eef8;padding:16px;border-radius:5px;white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:13px}td,th{padding:10px;text-align:left;border:1px solid #cfdae3;overflow-wrap:anywhere}th{background:#eaf0f6}.label{color:#0c6d53;font-weight:bold}footer{font-size:12px;margin-top:22px;color:#566579}</style><main><h1>PostgreSQL — Storage Verification</h1><p class="label">Read-only queries · Actual local database results · Synthetic demonstration only</p>'''+sections+'''<footer>Query results rendered for the project report. This is a read-only verification view, not pgAdmin. No passwords, tokens, or real patient records are displayed.</footer></main></html>'''
(out/'index.html').write_text(page,encoding='utf-8')
print('Read-only PostgreSQL verification captured; result rows:',[len(x['rows']) for x in data])
