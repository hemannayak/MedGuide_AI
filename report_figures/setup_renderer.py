from pathlib import Path
import urllib.request,json,hashlib,zipfile
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).parent/'tools'
ROOT.mkdir(exist_ok=True)
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'MedGuide-report-tooling'}),timeout=120) as r:return r.read()
def java():
    metadata=json.loads(get('https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jre&os=windows&vendor=eclipse'))
    package=metadata[0]['binary']['package']
    data=get(package['link'])
    assert hashlib.sha256(data).hexdigest()==package['checksum']
    archive=ROOT/'temurin-jre.zip';archive.write_bytes(data)
    with zipfile.ZipFile(archive) as z:z.extractall(ROOT)
    print('Downloaded and checksum-verified portable Temurin JRE')
def plantuml():
    data=get('https://github.com/plantuml/plantuml/releases/download/v1.2026.8/plantuml-1.2026.8.jar')
    (ROOT/'plantuml.jar').write_bytes(data)
    with zipfile.ZipFile(ROOT/'plantuml.jar') as z:assert 'META-INF/MANIFEST.MF' in z.namelist()
    print('Downloaded PlantUML from official release')
with ThreadPoolExecutor(max_workers=2) as pool:
    for result in pool.map(lambda f:f(),[java,plantuml]):pass
