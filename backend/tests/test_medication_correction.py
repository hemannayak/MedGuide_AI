import uuid
from app.core.security import create_access_token
from app.models.users import User
from app.models.medications import Medication
from app.models.prescriptions import Prescription
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.services.patient_service import get_patient_profile_by_user


def test_correction_is_owned_pending_and_separate_from_verification(client, db_session):
    users=[]
    try:
        for _ in range(2):
            users.append(register_patient_user(db_session,UserRegisterRequest(login_identifier=f'SYN-correction-{uuid.uuid4().hex}@example.invalid',password='SyntheticOnly123!',display_name='SYN Correction',preferred_language='en')))
        profile=get_patient_profile_by_user(db_session,users[0])
        prescription=Prescription(patient_id=profile.id,source='SYNTHETIC_TEST')
        db_session.add(prescription);db_session.flush()
        med=Medication(patient_id=profile.id,prescription_id=prescription.id,medicine_name='SYN OCR candidate',dosage='SYN dosage',verification_status='PENDING')
        db_session.add(med);db_session.commit()
        headers=[{'Authorization':f'Bearer {create_access_token(u.id,u.role.name)}'} for u in users]
        url=f'/api/v1/medications/{med.id}/ocr-correction'
        body={'medicine_name':'SYN corrected text','dosage':'SYN original dosage','instructions':'SYN copied instruction','checked_original':True}
        assert client.patch(url,json=body).status_code==401
        assert client.patch(url,json=body,headers=headers[1]).status_code==404
        assert client.patch(url,json={**body,'checked_original':False},headers=headers[0]).status_code==422
        assert client.patch(url,json={**body,'dosage':' '},headers=headers[0]).status_code==422
        result=client.patch(url,json=body,headers=headers[0]);assert result.status_code==200,result.text
        assert result.json()['data']['verification_status']=='PENDING'
        assert result.json()['data']['schedules']==[]
        verify_url=f'/api/v1/medications/{med.id}/verify'
        assert client.post(verify_url,headers=headers[0]).status_code==409
        assert client.post(verify_url,headers=headers[0],json={'expected_updated_at':'2000-01-01T00:00:00Z'}).status_code==409
        verified=client.post(verify_url,headers=headers[0],json={'expected_updated_at':result.json()['data']['updated_at']})
        assert verified.status_code==200,verified.text
        assert verified.json()['data']['verification_status']=='VERIFIED'
        assert client.patch(url,json=body,headers=headers[0]).status_code==409
    finally:
        db_session.rollback()
        for user in users:db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()
