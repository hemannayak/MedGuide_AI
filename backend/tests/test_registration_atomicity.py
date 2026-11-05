import uuid
import pytest
from sqlalchemy import event
from fastapi import HTTPException
from app.models.profiles import PatientProfile
from app.models.users import User
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user, authenticate_user


def request():
    return UserRegisterRequest(login_identifier=f'SYN-atomic-{uuid.uuid4().hex}@example.invalid',
        password='SyntheticOnly123!', display_name='SYN Atomic', preferred_language='en')


def test_profile_failure_rolls_back_entire_account(db_session):
    req = request()
    def fail(*args):
        raise RuntimeError('Synthetic profile write failure')
    event.listen(PatientProfile, 'before_insert', fail)
    try:
        with pytest.raises(RuntimeError, match='profile write failure'):
            register_patient_user(db_session, req)
    finally:
        event.remove(PatientProfile, 'before_insert', fail)
    assert db_session.query(User).filter_by(login_identifier=req.login_identifier).first() is None


def test_suspended_account_cannot_receive_new_token(db_session):
    req = request(); user = register_patient_user(db_session, req)
    try:
        user.status = 'SUSPENDED'; db_session.commit()
        with pytest.raises(HTTPException) as error:
            authenticate_user(db_session, req.login_identifier, req.password)
        assert error.value.status_code == 403
    finally:
        db_session.rollback()
        db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()
