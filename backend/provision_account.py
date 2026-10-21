"""Provision staff accounts locally; public registration always remains patient-only."""
import argparse
import getpass
from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.roles import Role
from app.models.users import User
from app.models.profiles import HealthcareWorkerProfile
from app.services.audit_service import log_audit_event


def main():
    parser = argparse.ArgumentParser(description="Provision an administrator or healthcare-worker account")
    parser.add_argument("role", choices=["ADMIN", "HEALTHCARE_WORKER"])
    parser.add_argument("identifier")
    parser.add_argument("--name", help="Required for healthcare workers")
    parser.add_argument("--worker-type", default="HEALTHCARE_WORKER")
    args = parser.parse_args()
    if args.role == "HEALTHCARE_WORKER" and not args.name:
        parser.error("--name is required for a healthcare worker")
    password = getpass.getpass("New account password (not echoed): ")
    if len(password) < 12 or len(password.encode("utf-8")) > 72:
        parser.error("Use at least 12 characters and at most 72 UTF-8 bytes")
    if password != getpass.getpass("Confirm password: "):
        parser.error("Passwords do not match")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.login_identifier == args.identifier)):
            parser.error("This account already exists; no changes were made")
        role = db.scalar(select(Role).where(Role.name == args.role))
        if role is None:
            role = Role(name=args.role); db.add(role); db.flush()
        user = User(role_id=role.id, login_identifier=args.identifier, password_hash=hash_password(password), status="ACTIVE")
        db.add(user); db.flush()
        if args.role == "HEALTHCARE_WORKER":
            db.add(HealthcareWorkerProfile(user_id=user.id, name=args.name, worker_type=args.worker_type))
        log_audit_event(db, action="STAFF_ACCOUNT_PROVISIONED", resource_type="USER", resource_id=user.id, metadata={"role": args.role, "method": "local_operator"})
        db.commit()
        print("Account provisioned. User ID:", user.id)


if __name__ == "__main__":
    main()
