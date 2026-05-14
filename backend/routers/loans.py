from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import models, schemas, database, auth_utils
from dependencies import get_current_user, RoleChecker
from routers import audit

router = APIRouter(
    prefix="/loans",
    tags=["loans"],
)

allow_staff = RoleChecker(["Admin", "Librarian"])

@router.post("/reserve", response_model=schemas.Loan)
def reserve_book(loan_data: schemas.LoanCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    existing_loan = db.query(models.Loan).filter(
        models.Loan.user_id == current_user.id,
        models.Loan.book_id == loan_data.book_id,
        models.Loan.status.in_(["Pending", "Active"])
    ).first()
    
    if existing_loan:
        raise HTTPException(status_code=400, detail="You already have an active/pending reservation for this book.")

    book = db.query(models.Book).filter(models.Book.id == loan_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available for reservation")

    new_loan = models.Loan(
        user_id=current_user.id,
        username=current_user.username,
        book_id=loan_data.book_id,
        book_name=loan_data.book_name,
        status="Pending",
        borrow_date=datetime.now().strftime("%Y-%m-%d")
    )
    book.available_copies -= 1
    
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    audit.log_event(db, current_user.role, current_user.username, "BOOK_RESERVE", f"book:{loan_data.book_id}", "success")
    return new_loan

@router.get("/pending", response_model=List[schemas.Loan])
def get_pending_loans(db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    return db.query(models.Loan).filter(models.Loan.status == "Pending").all()

@router.get("/me", response_model=List[schemas.Loan])
def get_my_loans(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Loan).filter(models.Loan.user_id == current_user.id).all()

@router.put("/{loan_id}/approve")
def approve_loan(loan_id: int, loan_update: schemas.LoanUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    loan.status = "Active"
    loan.due_date = loan_update.due_date
    
    book = db.query(models.Book).filter(models.Book.id == loan.book_id).first()
    if book and book.available_copies == 0:
        book.status = "Checked Out"

    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "LOAN_APPROVE", f"loan:{loan_id} ({loan.book_name})", "success")
    return {"status": "success", "message": "Loan approved"}

@router.put("/{loan_id}/deny")
def deny_loan(loan_id: int, loan_update: schemas.LoanUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    book = db.query(models.Book).filter(models.Book.id == loan.book_id).first()
    if book:
        book.available_copies += 1
        book.status = "Available"

    loan.status = "Denied"
    loan.denial_reason = loan_update.denial_reason
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "LOAN_DENY", f"loan:{loan_id} ({loan.book_name})", "success")
    return {"status": "success", "message": "Loan denied"}

@router.put("/{loan_id}/return")
def return_book(loan_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan.status != "Active":
         raise HTTPException(status_code=400, detail="Loan is not active")

    book = db.query(models.Book).filter(models.Book.id == loan.book_id).first()
    loan.status = "Returned"
    book.available_copies += 1
    book.status = "Available"
    
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "BOOK_RETURN", f"book:{loan.book_id}", "success")
    return {"status": "success", "message": "Book returned"}

@router.get("/user/{user_id}", response_model=List[schemas.Loan])
def get_user_loans(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    return db.query(models.Loan).filter(models.Loan.user_id == user_id).all()

@router.put("/{loan_id}/renew")
def renew_loan(loan_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan.status != "Active":
        raise HTTPException(status_code=400, detail="Only active loans can be renewed")

    # Extend by 14 days from current due date or today if missing
    try:
        base_date = datetime.strptime(loan.due_date, "%Y-%m-%d") if loan.due_date else datetime.now()
        new_due = base_date + timedelta(days=14)
    except:
        new_due = datetime.now() + timedelta(days=14)

    loan.due_date = new_due.strftime("%Y-%m-%d")
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "LOAN_RENEW", f"loan:{loan_id} ({loan.book_name})", "success")
    return {"status": "success", "new_due_date": loan.due_date}

@router.put("/return-by-book/{book_id}")
def return_book_by_id(book_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    """Staff-led return using the Book ID (barcode)."""
    loan = db.query(models.Loan).filter(models.Loan.book_id == book_id, models.Loan.status == "Active").first()
    if not loan:
        raise HTTPException(status_code=404, detail="No active loan found for this Book ID")
    
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    loan.status = "Returned"
    if book:
        book.available_copies += 1
        book.status = "Available"
    
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "BOOK_RETURN", f"book:{book_id} (via staff)", "success")
    return {"status": "success", "message": "Book returned successfully"}
