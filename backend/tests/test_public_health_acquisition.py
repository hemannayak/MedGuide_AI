import httpx
import pytest
import json
import sys
from app.db import acquire_india_public_health as acquisition
from app.db.acquire_india_public_health import download


def test_pdf_download_preserves_bytes():
    payload = b"%PDF-1.7 synthetic fixture"
    with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200,content=payload))) as client:
        data, url = download(client,"https://www.icmr.gov.in/report.pdf")
    assert data == payload
    assert url == "https://www.icmr.gov.in/report.pdf"


def test_redirect_to_untrusted_host_is_rejected_before_second_request():
    calls=[]
    def handler(request):
        calls.append(request)
        return httpx.Response(302, headers={"location":"http://127.0.0.1/private"})
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(ValueError):
            download(client,"https://www.icmr.gov.in/report.pdf")
    assert len(calls)==1


def test_html_error_page_is_not_treated_as_document():
    with httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,content=b'<html>blocked</html>'))) as client:
        with pytest.raises(ValueError):
            download(client,"https://www.icmr.gov.in/report.pdf")


def test_separate_collection_does_not_overwrite_default(tmp_path, monkeypatch):
    default=tmp_path/'default';default.mkdir()
    original='[{"id":"preserve-existing-review"}]'
    (default/'acquisition.json').write_text(original)
    rural=tmp_path/'rural';rural.mkdir()
    (rural/'selection.json').write_text('[]')
    monkeypatch.setattr(acquisition,'ROOT',tmp_path)
    monkeypatch.setattr(acquisition,'OUT',default)
    monkeypatch.setattr(sys,'argv',['acquire','--collection',str(rural)])
    acquisition.main()
    assert json.loads((rural/'acquisition.json').read_text())==[]
    assert (default/'acquisition.json').read_text()==original


def test_checkpoint_preserves_unvisited_records(tmp_path):
    path = tmp_path / 'acquisition.json'
    sources = [dict(id='a', source_url='https://who.int/a.pdf'),
               dict(id='b', source_url='https://who.int/b.pdf')]
    prior = sources[1] | dict(status='ACQUIRED_NOT_APPROVED', sha256='previous')
    acquisition.checkpoint(path, sources, {'b': prior}, [sources[0] | dict(status='FAILED')])
    assert json.loads(path.read_text()) == [sources[0] | dict(status='FAILED'), prior]


def test_changed_url_does_not_reuse_previous_acquisition(tmp_path):
    path = tmp_path / 'acquisition.json'
    source = dict(id='a', source_url='https://who.int/new.pdf')
    acquisition.checkpoint(path, [source], {'a': source | dict(source_url='https://who.int/old.pdf', status='ACQUIRED_NOT_APPROVED')}, [])
    assert json.loads(path.read_text())[0]['status'] == 'NOT_ATTEMPTED'


def test_failed_replace_preserves_original_manifest(tmp_path, monkeypatch):
    path = tmp_path / 'acquisition.json'
    path.write_text('[]')
    def fail(*args):
        raise OSError('synthetic disk failure')
    monkeypatch.setattr(acquisition.os, 'replace', fail)
    with pytest.raises(OSError):
        acquisition.checkpoint(path, [], {}, [])
    assert path.read_text() == '[]'
    assert list(tmp_path.glob('*.tmp')) == []
