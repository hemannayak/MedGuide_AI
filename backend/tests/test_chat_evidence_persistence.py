"""Synthetic end-to-end persistence and ownership regression; no live model claims."""
import uuid
import pytest
from app.core.security import create_access_token
from app.models.users import User
from app.models.conversations import Conversation, ConversationMessage
from app.schemas.auth import UserRegisterRequest
from app.schemas.ai import SourceCitation, ResponseType
from app.services.auth_service import register_patient_user
from app.services.patient_service import get_patient_profile_by_user
from app.services.ai_service import _save_ai_message


def test_saved_evidence_survives_history_and_is_private(client, db_session):
    users = []
    try:
        for _ in range(2):
            users.append(register_patient_user(db_session, UserRegisterRequest(
                login_identifier=f'SYN-evidence-{uuid.uuid4().hex}@example.invalid',
                password='SyntheticOnly123!', display_name='SYN Evidence', preferred_language='en')))
        headers = [{'Authorization': f'Bearer {create_access_token(u.id, u.role.name)}'} for u in users]
        profile = get_patient_profile_by_user(db_session, users[0])
        conversation = Conversation(patient_id=profile.id, language='en')
        db_session.add(conversation); db_session.commit()
        cid = str(conversation.id)
        source = SourceCitation(citation_id=1, document_id=uuid.uuid4(), chunk_id=uuid.uuid4(),
                                title='SYN evidence fixture', publisher='SYN', page_number=3,
                                source_url='https://example.invalid/synthetic.pdf')
        for kind in [ResponseType.INFORMATIONAL, ResponseType.REFUSAL]:
            _save_ai_message(db_session, conversation, 'SYN response only', 'en', 1, False,
                             sources=[source], response_type=kind)
        db_session.expire_all()
        response = client.get(f'/api/v1/ai/conversations/{cid}', headers=headers[0])
        assert response.status_code == 200, response.text
        messages = response.json()['data']['messages']
        by_type = {m['metadata']['response_type']: m['metadata'] for m in messages}
        assert by_type['INFORMATIONAL']['sources'] == [source.model_dump(mode='json')]
        assert by_type['INFORMATIONAL']['rag_grounded'] is True
        assert by_type['REFUSAL']['rag_grounded'] is False
        assert by_type['REFUSAL']['refusal_triggered'] is True
        assert client.get(f'/api/v1/ai/conversations/{cid}', headers=headers[1]).status_code == 404
        assert client.get('/api/v1/ai/conversations/not-a-uuid', headers=headers[0]).status_code == 422
        # Emergency path needs no cloud consent, but still enforces conversation ownership.
        before = db_session.query(ConversationMessage).count()
        for invalid in [cid, str(uuid.uuid4())]:
            response = client.post('/api/v1/ai/chat', headers=headers[1],
                json={'message': 'severe chest pain', 'conversation_id': invalid, 'language': 'en'})
            assert response.status_code == 404, response.text
        assert db_session.query(ConversationMessage).count() == before
    finally:
        db_session.rollback()
        for user in users:
            db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()
