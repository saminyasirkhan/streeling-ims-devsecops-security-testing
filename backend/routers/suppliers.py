from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, models
from dependencies import get_current_user, RoleChecker

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
)

# Role definitions
allow_admin = RoleChecker(["Admin"])
allow_staff = RoleChecker(["Admin", "Librarian"])

@router.get("/")
def get_suppliers(db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    return db.query(models.Supplier).all()

@router.post("/")
def add_supplier(supplier: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    db_sup = models.Supplier(**supplier)
    db.add(db_sup)
    db.commit()
    return {"status": "success"}

@router.delete("/{sup_id}")
def delete_supplier(sup_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    db_sup = db.query(models.Supplier).filter(models.Supplier.id == sup_id).first()
    if db_sup:
        db.delete(db_sup)
        db.commit()
    return {"status": "success"}
