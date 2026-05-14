from sqlalchemy import Column, String, Integer, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)  
    role = Column(String)
    is_locked = Column(Boolean, default=False)
    
    # Profile fields
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, default="Streeling University Campus")
    organization = Column(String, default="Streeling University")
    avatar_path = Column(String, nullable=True)

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    author = Column(String)
    status = Column(String, default="Available")
    category = Column(String)
    releaseDate = Column(String)
    description = Column(String, nullable=True)
    total_copies = Column(Integer, default=3)
    available_copies = Column(Integer, default=3)

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    username = Column(String)
    book_id = Column(String)
    book_name = Column(String)
    status = Column(String, default="Pending") # Pending, Active, Returned, Denied
    borrow_date = Column(String)
    due_date = Column(String)
    denial_reason = Column(String, nullable=True)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    contact = Column(String)
    phone = Column(String)
    status = Column(String)
    risk = Column(String)

class StockOrder(Base):
    __tablename__ = "stock_orders"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(String)
    book_name = Column(String)
    supplier_id = Column(String)
    quantity = Column(Integer)
    status = Column(String, default="Ordered") # Ordered, Received, Cancelled
    order_date = Column(String)
    received_date = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    role = Column(String)
    username = Column(String)
    action = Column(String)
    target = Column(String)
    status = Column(String)
