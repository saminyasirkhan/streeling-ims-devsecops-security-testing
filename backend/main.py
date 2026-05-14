from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os, random
import database, models, auth_utils
from routers import books, users, loans, suppliers, audit, procurement, profile
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from dependencies import limiter

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many login attempts. Please wait 60 seconds before trying again."}
    )

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  
    "http://127.0.0.1:5174",  
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("avatars"):
    os.makedirs("avatars")
app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Content Security Policy
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https://ui-avatars.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    # Permissions Policy
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    return response

REAL_BOOKS = [
    ("Clean Code", "Robert C. Martin", "Computer Science"),
    ("The Pragmatic Programmer", "Andrew Hunt", "Computer Science"),
    ("Introduction to Algorithms", "Thomas H. Cormen", "Computer Science"),
    ("Design Patterns", "Erich Gamma", "Computer Science"),
    ("The C Programming Language", "Brian Kernighan", "Computer Science"),
    ("Refactoring", "Martin Fowler", "Computer Science"),
    ("Head First Design Patterns", "Eric Freeman", "Computer Science"),
    ("Code Complete", "Steve McConnell", "Computer Science"),
    ("The Mythical Man-Month", "Fred Brooks", "Computer Science"),
    ("Structure and Interpretation of Computer Programs", "Harold Abelson", "Computer Science"),
    ("To Kill a Mockingbird", "Harper Lee", "Fiction"),
    ("1984", "George Orwell", "Fiction"),
    ("The Great Gatsby", "F. Scott Fitzgerald", "Fiction"),
    ("Pride and Prejudice", "Jane Austen", "Classic"),
    ("The Catcher in the Rye", "J.D. Salinger", "Fiction"),
    ("The Hobbit", "J.R.R. Tolkien", "Fantasy"),
    ("Fahrenheit 451", "Ray Bradbury", "Fiction"),
    ("Brave New World", "Aldous Huxley", "Fiction"),
    ("The Lord of the Rings", "J.R.R. Tolkien", "Fantasy"),
    ("Jane Eyre", "Charlotte Bronte", "Classic"),
    ("Animal Farm", "George Orwell", "Fiction"),
    ("Gone with the Wind", "Margaret Mitchell", "Historical"),
    ("The Grapes of Wrath", "John Steinbeck", "Historical"),
    ("The Alchemist", "Paulo Coelho", "Philosophy"),
    ("Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "History"),
    ("A Brief History of Time", "Stephen Hawking", "Physics"),
    ("Thinking, Fast and Slow", "Daniel Kahneman", "Psychology"),
    ("Atomic Habits", "James Clear", "Self-Help"),
    ("Educated", "Tara Westover", "Biography"),
    ("Becoming", "Michelle Obama", "Biography"),
    ("Dune", "Frank Herbert", "Sci-Fi"),
    ("Neuromancer", "William Gibson", "Sci-Fi"),
    ("Snow Crash", "Neal Stephenson", "Sci-Fi"),
    ("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "Fantasy"),
    ("The Da Vinci Code", "Dan Brown", "Thriller"),
    ("Angels & Demons", "Dan Brown", "Thriller"),
    ("Digital Fortress", "Dan Brown", "Thriller"),
    ("Steve Jobs", "Walter Isaacson", "Biography"),
    ("Elon Musk", "Walter Isaacson", "Biography"),
    ("Zero to One", "Peter Thiel", "Business"),
    ("The Lean Startup", "Eric Ries", "Business"),
    ("Good to Great", "Jim Collins", "Business"),
    ("Cracking the Coding Interview", "Gayle Laakmann McDowell", "Computer Science"),
    ("Grokking Algorithms", "Aditya Bhargava", "Computer Science"),
    ("Fluent Python", "Luciano Ramalho", "Computer Science"),
    ("Python Crash Course", "Eric Matthes", "Computer Science"),
    ("Automate the Boring Stuff with Python", "Al Sweigart", "Computer Science"),
    ("Deep Learning", "Ian Goodfellow", "Computer Science"),
    ("Artificial Intelligence: A Modern Approach", "Stuart Russell", "Computer Science"),
    ("The Art of Computer Programming", "Donald Knuth", "Computer Science")
]

STATUSES = ["Available", "Checked Out", "Reserved"]
USERS_FILE = "users.txt"

def seed_database(db: Session):
    if db.query(models.User).count() == 0:
        default_users = [
            ("admin@streeling.ac.uk", "admin123", "Admin", "Admin User", None),
            ("librarian1@streeling.ac.uk", "librarian1", "Librarian", "Librarian One", "0300 555 8171"),
            ("librarian2@streeling.ac.uk", "librarian2", "Librarian", "Librarian Two", "0300 555 8171"),
            ("student1@streeling.ac.uk", "student1", "Student", "Student One", None),
            ("student2@streeling.ac.uk", "student2", "Student", "Student Two", None),
            ("student3@streeling.ac.uk", "student3", "Student", "Student Three", None)
        ]
        for username, password, role, full_name, phone in default_users:
            hashed_pwd = auth_utils.get_password_hash(password)
            db.add(models.User(
                username=username, 
                password=hashed_pwd, 
                role=role,
                full_name=full_name,
                phone=phone
            ))
        db.commit()

    if db.query(models.Book).count() == 0:
        for i in range(1, 76):
            book_template = REAL_BOOKS[(i-1) % len(REAL_BOOKS)]
            db_book = models.Book(
                id=f"{i:03d}",
                name=book_template[0],
                author=book_template[1],
                status="Available",
                category=book_template[2],
                releaseDate=f"20{random.randint(10, 24)}",
                total_copies=3,
                available_copies=3
            )
            db.add(db_book)
        db.commit()

    if db.query(models.Supplier).count() == 0:
        default_sups = [
            ("SUP-001", "Pearson Education", "support@pearson.com", "+44 20 7010 2000", "Active", "Low"),
            ("SUP-002", "O'Reilly Media", "orders@oreilly.com", "+1 707 827 7000", "Active", "Low"),
            ("SUP-003", "Wiley", "cs-books@wiley.com", "+44 1243 843291", "Active", "Low"),
            ("SUP-004", "McGraw Hill", "service@mheducation.com", "+1 800 338 3987", "Review", "Medium"),
        ]
        for sid, name, contact, phone, status, risk in default_sups:
            db.add(models.Supplier(id=sid, name=name, contact=contact, phone=phone, status=status, risk=risk))
        db.commit()



@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    seed_database(db)
    db.close()

app.include_router(books.router)
app.include_router(users.router)
app.include_router(loans.router)
app.include_router(suppliers.router)
app.include_router(audit.router)
app.include_router(procurement.router)
app.include_router(profile.router)

app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")

@app.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    from datetime import datetime, timedelta
    
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    
    failed_logins = db.query(models.AuditLog).filter(
        models.AuditLog.action.in_(["LOGIN_FAIL", "LOGIN_ROLE_MISMATCH"]),
        models.AuditLog.timestamp >= yesterday
    ).count()
    
    low_stock = db.query(models.Book).filter(
        models.Book.available_copies <= 1
    ).count()
    
    out_of_stock = db.query(models.Book).filter(
        models.Book.available_copies == 0
    ).count()
    
    total_books = db.query(models.Book).count()
    total_users = db.query(models.User).count()
    locked_accounts = db.query(models.User).filter(
        models.User.is_locked == True
    ).count()
    active_suppliers = db.query(models.Supplier).filter(
        models.Supplier.status == "Active"
    ).count()
    
    return {
        "totalBooks": total_books,
        "lowStock": low_stock,
        "outOfStock": out_of_stock,
        "failedLogins": failed_logins,
        "lockedAccounts": locked_accounts,
        "activeSuppliers": active_suppliers,
        "totalUsers": total_users,
        "pendingApprovals": 0
    }

@app.get("/")
def read_root():
    return {"message": "IMS Backend Service - Modularized"}
