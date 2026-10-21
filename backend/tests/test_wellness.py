"""Synthetic patient-only integration checks for optional wellness workflows."""
import uuid
from datetime import date, datetime, timezone, timedelta
import pytest
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.core.security import create_access_token
@pytest.fixture
def wellness_users(db_session):
    def make():
        u=register_patient_user(db_session,UserRegisterRequest(login_identifier=f'SYN-wellness-{uuid.uuid4().hex}@example.invalid',password='SyntheticOnly123!',display_name='SYN Wellness',preferred_language='en'))
        return {'Authorization':f'Bearer {create_access_token(u.id,u.role.name)}'}
    return make(),make()
def test_auth_optional_consent_and_ownership(client,wellness_users):
    a,b=wellness_users
    assert client.get('/api/v1/wellness/settings').status_code==401
    assert client.patch('/api/v1/wellness/settings',headers=a,json={'allergies':'SYN test'}).status_code==403
    r=client.patch('/api/v1/wellness/settings',headers=a,json={'allergies':'SYN test','health_notice_version':'1.0','onboarding_step':2})
    assert r.status_code==200,r.text
    assert client.get('/api/v1/wellness/settings',headers=b).json()['data']['allergies'] is None
    assert client.get('/api/v1/wellness/settings',headers=a).json()['data']['onboarding_step']==2
    assert client.patch('/api/v1/wellness/settings',headers=a,json={'allergies':None,'health_notice_version':'1.0'}).status_code==200
    assert client.get('/api/v1/wellness/settings',headers=a).json()['data']['allergies'] is None

def test_water_retry_deduplicates_and_conflicts(client,wellness_users):
    a,b=wellness_users;p={'operation_id':str(uuid.uuid4()),'day':str(date.today()),'kind':'water','amount':250,'source':'manual','health_notice_version':'1.0'}
    for _ in range(2):assert client.post('/api/v1/wellness/entries',headers=a,json=p).status_code==200
    assert client.post('/api/v1/wellness/entries',headers=a,json={**p,'amount':500}).status_code==409
    assert client.get(f'/api/v1/wellness/daily?day={date.today()}',headers=a).json()['data']['water_ml']==250
    assert client.get(f'/api/v1/wellness/daily?day={date.today()}',headers=b).json()['data']['water_ml']==0

def test_sensor_snapshots_are_monotonic_not_repeated_deltas(client,wellness_users):
    a,_=wellness_users;p={'operation_id':str(uuid.uuid4()),'day':str(date.today()),'kind':'steps','amount':40,'source':'foreground_sensor','health_notice_version':'1.0'}
    for amount in [40,60,20,60]:assert client.post('/api/v1/wellness/entries',headers=a,json={**p,'amount':amount}).status_code==200
    assert client.get(f'/api/v1/wellness/daily?day={date.today()}',headers=a).json()['data']['foreground_steps']==60

def test_validation(client,wellness_users):
    a,_=wellness_users
    for body in [{'patient_id':str(uuid.uuid4())},{'onboarding_step':8},{'large_controls':None}]:assert client.patch('/api/v1/wellness/settings',headers=a,json=body).status_code==422
    p={'operation_id':str(uuid.uuid4()),'day':str(date.today()),'kind':'water','amount':-1,'source':'manual','health_notice_version':'1.0'}
    assert client.post('/api/v1/wellness/entries',headers=a,json=p).status_code==422
    assert client.post('/api/v1/wellness/entries',headers=a,json={**p,'amount':250,'source':'foreground_sensor'}).status_code==422
    assert client.patch('/api/v1/patients/me',headers=a,json={'date_of_birth':str(date.today()+timedelta(days=1))}).status_code==422

def test_measurements_owned_manual_retry_safe(client,wellness_users):
    a,b=wellness_users;p={'operation_id':str(uuid.uuid4()),'kind':'weight','value':61,'measured_at':datetime.now(timezone.utc).isoformat(),'health_notice_version':'1.0'}
    for _ in range(2):
        r=client.post('/api/v1/wellness/measurements',headers=a,json=p);assert r.status_code==200,r.text
    rows=client.get('/api/v1/wellness/measurements',headers=a).json()['data'];assert len(rows)==1 and rows[0]['source']=='manual' and rows[0]['unit']=='kg'
    assert client.get('/api/v1/wellness/measurements',headers=b).json()['data']==[]
    assert client.post('/api/v1/wellness/measurements',headers=a,json={**p,'value':62}).status_code==409
    assert client.post('/api/v1/wellness/measurements',headers=a,json={**p,'kind':'blood_pressure'}).status_code==422

def test_optional_profile_fields_clear(client,wellness_users):
    a,_=wellness_users
    assert client.patch('/api/v1/patients/me',headers=a,json={'date_of_birth':'2000-01-01','contact_reference':'SYN contact'}).status_code==200
    r=client.patch('/api/v1/patients/me',headers=a,json={'date_of_birth':None,'contact_reference':None})
    assert r.status_code==200 and r.json()['data']['date_of_birth'] is None and r.json()['data']['contact_reference'] is None

def test_daily_rollover_keeps_previous_day_history(client,wellness_users):
    a,_=wellness_users
    yesterday=date.today()-timedelta(days=1)
    payload={'operation_id':str(uuid.uuid4()),'day':str(yesterday),'kind':'water','amount':300,'source':'manual','health_notice_version':'1.0'}
    assert client.post('/api/v1/wellness/entries',headers=a,json=payload).status_code==200
    assert client.get(f'/api/v1/wellness/daily?day={date.today()}',headers=a).json()['data']['water_ml']==0
    assert client.get(f'/api/v1/wellness/daily?day={yesterday}',headers=a).json()['data']['water_ml']==300
