import hashlib
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import insert
from app.core.security import decode_access_token
from app.models.sessions import RevokedAccessToken


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def is_token_revoked(db, token: str) -> bool:
    return db.get(RevokedAccessToken, token_digest(token)) is not None


def revoke_access_token(db, user_id, token: str) -> None:
    payload = decode_access_token(token)
    if not payload or not payload.get('exp'):
        raise ValueError('Valid expiring access token required')
    db.execute(insert(RevokedAccessToken).values(
        token_hash=token_digest(token), user_id=user_id,
        expires_at=datetime.fromtimestamp(payload['exp'], tz=timezone.utc),
    ).on_conflict_do_nothing(index_elements=['token_hash']))
    db.commit()
