"""Authenticated self-service wellness API; no clinical interpretation or automatic prescribing."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.models.wellness import PatientWellness, WellnessEntry, PatientMeasurement
from app.schemas.auth import StandardResponse
from app.schemas.wellness import WellnessUpdate, EntryRequest, MeasurementRequest, UNITS
from app.services.patient_service import get_patient_profile_by_user
from app.services.audit_service import log_audit_event

router = APIRouter()
HEALTH_FIELDS = {'gender','emergency_contact','conditions','past_illnesses','surgeries','allergies','accessibility_needs','family_history','treatment_history','sleep_notes','activity_notes','dietary_preferences','healthcare_provider','vaccination_notes','lab_report_notes','health_goals','water_goal_ml','step_goal'}

def own(db, user):
    return get_patient_profile_by_user(db, user)

def settings_row(db, patient):
    db.execute(insert(PatientWellness).values(patient_id=patient.id).on_conflict_do_nothing())
    db.flush()
    return db.query(PatientWellness).filter_by(patient_id=patient.id).with_for_update().one()

def settings_data(row):
    return {name: getattr(row, name) for name in WellnessUpdate.model_fields}

def measurement_data(row):
    return {name: getattr(row, name) for name in ('id','kind','value','secondary_value','unit','measured_at','source')}

@router.get('/settings', response_model=StandardResponse)
def read_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    row = db.query(PatientWellness).filter_by(patient_id=p.id).first()
    return StandardResponse(success=True, data=settings_data(row) if row else {**WellnessUpdate().model_dump(), 'large_controls': False, 'onboarding_step': 0, 'onboarding_complete': False})

@router.patch('/settings', response_model=StandardResponse)
def save_settings(req: WellnessUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    data = req.model_dump(exclude_unset=True)
    if HEALTH_FIELDS.intersection(data) and req.health_notice_version != '1.0':
        raise HTTPException(403, 'Review and accept the optional health-record storage notice before saving.')
    row = settings_row(db, p)
    for key, value in data.items(): setattr(row, key, value)
    log_audit_event(db, action='WELLNESS_SETTINGS_MODIFIED', resource_type='PATIENT', actor_user_id=user.id, resource_id=p.id, metadata={'fields': list(data)})
    db.commit(); db.refresh(row)
    return StandardResponse(success=True, data=settings_data(row))

@router.get('/daily', response_model=StandardResponse)
def daily(day: date = Query(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    rows = db.query(WellnessEntry.kind, WellnessEntry.source, func.sum(WellnessEntry.amount)).filter_by(patient_id=p.id, day=day).group_by(WellnessEntry.kind, WellnessEntry.source).all()
    data = {'day': day, 'water_ml': 0, 'manual_steps': 0, 'foreground_steps': 0}
    for kind, source, amount in rows:
        data['water_ml' if kind == 'water' else 'manual_steps' if source == 'manual' else 'foreground_steps'] += amount
    return StandardResponse(success=True, data=data)

@router.post('/entries', response_model=StandardResponse)
def log_entry(req: EntryRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    values = req.model_dump(exclude={'health_notice_version'}); values['patient_id'] = p.id
    db.execute(insert(WellnessEntry).values(**values).on_conflict_do_nothing(index_elements=['patient_id','operation_id']))
    row = db.query(WellnessEntry).filter_by(patient_id=p.id, operation_id=req.operation_id).with_for_update().one()
    if row.day != req.day or row.kind != req.kind or row.source != req.source:
        raise HTTPException(409, 'Operation reference was already used for a different entry.')
    if row.source == 'foreground_sensor': row.amount = max(row.amount, req.amount)
    elif row.amount != req.amount: raise HTTPException(409, 'Retry must preserve the original entry.')
    log_audit_event(db, action='WELLNESS_ENTRY_SAVED', resource_type='WELLNESS', actor_user_id=user.id, resource_id=row.id, metadata={'kind': row.kind})
    db.commit()
    return StandardResponse(success=True, data={'id': row.id, 'amount': row.amount})

@router.get('/measurements', response_model=StandardResponse)
def measurements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    rows = db.query(PatientMeasurement).filter_by(patient_id=p.id).order_by(PatientMeasurement.measured_at.desc()).limit(100).all()
    return StandardResponse(success=True, data=[measurement_data(r) for r in rows])

@router.post('/measurements', response_model=StandardResponse)
def add_measurement(req: MeasurementRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = own(db, user)
    values = req.model_dump(exclude={'health_notice_version'}); values.update(patient_id=p.id, unit=UNITS[req.kind], source='manual')
    db.execute(insert(PatientMeasurement).values(**values).on_conflict_do_nothing(index_elements=['patient_id','operation_id']))
    row = db.query(PatientMeasurement).filter_by(patient_id=p.id, operation_id=req.operation_id).one()
    if any(getattr(row, k) != v for k,v in values.items() if k != 'patient_id'):
        raise HTTPException(409, 'Retry must preserve the original measurement.')
    log_audit_event(db, action='MEASUREMENT_SAVED', resource_type='MEASUREMENT', actor_user_id=user.id, resource_id=row.id, metadata={'kind': row.kind})
    db.commit()
    return StandardResponse(success=True, data=measurement_data(row))
