from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from dependencies import get_current_user, RoleChecker
from routers import audit

router = APIRouter(
    prefix="/books",
    tags=["books"],
)

allow_management = RoleChecker(["Admin", "Librarian"])

@router.get("/", response_model=List[schemas.Book])
def get_books(db: Session = Depends(database.get_db)):
    return db.query(models.Book).all()

@router.get("/low-stock", response_model=List[schemas.Book])
def get_low_stock_books(db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_management)):
    # Criteria: books with available copies <= 1
    return db.query(models.Book).filter(models.Book.available_copies <= 1).all()

@router.post("/", response_model=schemas.Book)
def add_book(book: schemas.BookCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_management)):
    # Check if book already exists by name and author
    existing_book = db.query(models.Book).filter(
        models.Book.name == book.name,
        models.Book.author == book.author
    ).first()
    
    if existing_book:
        raise HTTPException(
            status_code=400, 
            detail=f"Book '{book.name}' by {book.author} already exists (ID: {existing_book.id}). Please update existing stock instead of adding a new entry."
        )

    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    audit.log_event(db, current_user.role, current_user.username, "BOOK_CREATE", f"book:{db_book.id} ({db_book.name})", "success")
    return db_book

@router.delete("/{book_id}")
def delete_book(book_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_management)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book:
        db.delete(db_book)
        db.commit()
        audit.log_event(db, current_user.role, current_user.username, "BOOK_DELETE", f"book:{book_id} ({db_book.name})", "success")
    return {"status": "success"}

@router.put("/{book_id}")
def update_book(book_id: str, book_update: schemas.BookUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_management)):
    db_book_query = db.query(models.Book).filter(models.Book.id == book_id)
    db_book = db_book_query.first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book_update.dict(exclude_unset=True)
    db_book_query.update(update_data)
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "BOOK_UPDATE", f"book:{book_id} ({db_book.name})", "success")
    return {"status": "success"}
