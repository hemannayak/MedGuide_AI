from pathlib import Path
import sys,os,subprocess,json
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'backend'))
from app.core.config import settings
OUT=Path(__file__).parent
r=json.loads((OUT/'vector_retrieval_results.json').read_text())
env=os.environ.copy();env['PGPASSWORD']=settings.POSTGRES_PASSWORD
cmd=[r'C:\Program Files\PostgreSQL\18\bin\psql.exe','-X','-h',settings.POSTGRES_SERVER,'-p',str(settings.POSTGRES_PORT),'-U',settings.POSTGRES_USER,'-d',settings.POSTGRES_DB,'-v','ON_ERROR_STOP=1','-P','pager=off','-f',str(OUT/'vector_query.sql')]
result=subprocess.run(cmd,env=env,capture_output=True,text=True,encoding='utf-8')
transcript='MedGuide AI | Actual read-only psql execution | 23 October 2026\n'
transcript+='Command: psql -X -d '+settings.POSTGRES_DB+' -v ON_ERROR_STOP=1 -f vector_query.sql\n'
transcript+='Credentials supplied privately through environment; never printed.\n'
transcript+='Query text: '+r['query']+'\nEncoder: '+r['model']+' (384 dimensions)\n'
transcript+='Prepared query (real embedding bound in vector_query.sql):\n'+r['sql'].replace('CAST(:embedding AS vector)','$1')+';\n\n'
transcript+=result.stdout+'\n'+result.stderr+'\nExit status: '+str(result.returncode)+'\n'
(OUT/'psql_execution.txt').write_text(transcript,encoding='utf-8')
print(transcript)
raise SystemExit(result.returncode)
