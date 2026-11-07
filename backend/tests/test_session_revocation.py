import uuid
from app.core.security import create_access_token
from app.models.users import User
from app.models.sessions import RevokedAccessToken
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.services.session_service import token_digest


def test_logout_revokes_only_presented_credential(client, db_session):
    user = register_patient_user(db_session, UserRegisterRequest(
        login_identifier=f'SYN-session-{uuid.uuid4().hex}@example.invalid', password='SyntheticOnly123!',
        display_name='SYN Session', preferred_language='en'))
    try:
        tokens = [create_access_token(user.id, user.role.name) for _ in range(2)]
        assert tokens[0] != tokens[1]
        headers = [{'Authorization': f'Bearer {token}'} for token in tokens]
        assert client.get('/api/v1/auth/me', headers=headers[0]).status_code == 200
        assert client.post('/api/v1/auth/logout', headers=headers[0]).status_code == 200
        assert client.get('/api/v1/auth/me', headers=headers[0]).status_code == 401
        assert client.get('/api/v1/ai/conversations', headers=headers[0]).status_code == 401
        assert client.get('/api/v1/auth/me', headers=headers[1]).status_code == 200
        row = db_session.get(RevokedAccessToken, token_digest(tokens[0]))
        assert row.user_id == user.id
        assert len(row.token_hash) == 64 and row.token_hash != tokens[0]
    finally:
        db_session.rollback()
        db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()
