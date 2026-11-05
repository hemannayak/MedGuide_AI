from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.endpoints import public_health
from app.api.deps import get_current_user, get_db
from app.services.knowledge_service import EmbeddingUnavailableError


def client(auth=True):
    app=FastAPI();app.include_router(public_health.router)
    if auth:app.dependency_overrides[get_current_user]=lambda:object()
    app.dependency_overrides[get_db]=lambda:object()
    return TestClient(app)


REQUEST=dict(query="Dengue reports",geography="India",period_start="2024-01-01",period_end="2024-12-31")


def test_requires_authentication():
    assert client(False).post('/search',json=REQUEST).status_code==401


def test_missing_period_rejected():
    assert client().post('/search',json={'query':'dengue','geography':'India'}).status_code==422


def test_empty_results_are_honest(monkeypatch):
    monkeypatch.setattr(public_health,'search_public_health',lambda db,req:[])
    response=client().post('/search',json=REQUEST)
    assert response.status_code==200
    assert response.json()['data']['matches']==[]


def test_unavailable_encoder_is_503(monkeypatch):
    def unavailable(db,req):raise EmbeddingUnavailableError('internal detail')
    monkeypatch.setattr(public_health,'search_public_health',unavailable)
    response=client().post('/search',json=REQUEST)
    assert response.status_code==503
    assert 'internal detail' not in response.text


def test_care_access_contract(monkeypatch):
    body = dict(query="Village care services", geography="India", population_setting="rural")
    assert client(False).post('/care-access/search', json=body).status_code == 401
    monkeypatch.setattr(public_health, 'search_care_access', lambda db, req: [])
    response = client().post('/care-access/search', json=body)
    assert response.status_code == 200
    assert response.json()['data']['scope'] == 'service_navigation'
    assert response.json()['data']['matches'] == []
    assert client().post('/care-access/search', json=body | {'query': '   '}).status_code == 422
    assert client().post('/care-access/search', json=body | {'period_start': '2024-01-01'}).status_code == 422
    def unavailable(db, req):
        raise EmbeddingUnavailableError('private diagnostic')
    monkeypatch.setattr(public_health, 'search_care_access', unavailable)
    response = client().post('/care-access/search', json=body)
    assert response.status_code == 503
    assert 'private diagnostic' not in response.text
