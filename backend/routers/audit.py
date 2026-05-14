from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import database, models
from dependencies import get_current_user, RoleChecker
from datetime import datetime
import csv
import io

router = APIRouter(
    prefix="/audit",
    tags=["audit"],
)

allow_admin = RoleChecker(["Admin"])

@router.get("/export")
def export_audit_logs(db: Session = Depends(database.get_db), current_user = Depends(allow_admin)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["ID", "Timestamp", "Role", "Username", "Action", "Target", "Status"])
    
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
    for log in logs:
        writer.writerow([log.id, log.timestamp, log.role, log.username, log.action, log.target, log.status])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"}
    )

@router.get("/")
def get_audit_logs(db: Session = Depends(database.get_db), current_user = Depends(allow_admin)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(100).all()
    return logs

@router.get("/staff")
def get_staff_audit_logs(db: Session = Depends(database.get_db), current_user = Depends(RoleChecker(["Admin", "Librarian"]))):
    """
    Retrieves audit logs relevant to Librarians (Book, Loan, and Procurement actions).
    Excludes sensitive/system noise like logins and user management.
    """
    actions = ["BOOK_CREATE", "BOOK_UPDATE", "BOOK_DELETE", "PROCUREMENT_ORDER", "PROCUREMENT_RECEIVE", "PROCUREMENT_CANCEL", "LOAN_APPROVE", "LOAN_DENY", "BOOK_RESERVE", "BOOK_RETURN"]
    logs = db.query(models.AuditLog)\
             .filter(models.AuditLog.action.in_(actions))\
             .order_by(models.AuditLog.id.desc())\
             .limit(100)\
             .all()
    return logs

def log_event(db: Session, role: str, username: str, action: str, target: str, status: str):
    log_entry = models.AuditLog(
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        role=role,
        username=username,
        action=action,
        target=target,
        status=status
    )
    db.add(log_entry)
    db.commit()
