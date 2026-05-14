from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import database, models, schemas
from dependencies import get_current_user, RoleChecker
from routers import audit

router = APIRouter(
    prefix="/procurement",
    tags=["procurement"],
)

# Role definitions
allow_admin = RoleChecker(["Admin"])
allow_staff = RoleChecker(["Admin", "Librarian"])

@router.post("/orders")
def create_stock_order(order: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == order['supplier_id']).first()
    if not supplier or supplier.status == "Suspended":
        raise HTTPException(status_code=400, detail="Supplier is not active or suspended")

    new_order = models.StockOrder(
        book_id=order['book_id'],
        book_name=order['book_name'],
        supplier_id=order['supplier_id'],
        quantity=order['quantity'],
        order_date=datetime.now().strftime("%Y-%m-%d"),
        status="Ordered"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    audit.log_event(db, current_user.role, current_user.username, "PROCUREMENT_ORDER", f"order:{new_order.id} ({new_order.book_name})", "success")
    return {"status": "success", "order_id": new_order.id}

@router.get("/orders")
def get_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    return db.query(models.StockOrder).all()

@router.put("/orders/{order_id}/receive")
def receive_stock_order(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    order = db.query(models.StockOrder).filter(models.StockOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "Ordered":
        raise HTTPException(status_code=400, detail=f"Cannot receive order with status {order.status}")

    # 1. Update Inventory
    # Try to find book by ID first
    book = db.query(models.Book).filter(models.Book.id == order.book_id).first()
    
    if not book:
        # Fallback: Try to find by name if ID didn't match (prevents duplicates if ID was entered differently)
        book = db.query(models.Book).filter(models.Book.name == order.book_name).first()
    
    if book:
        # Update existing book copy counts
        book.total_copies += order.quantity
        book.available_copies += order.quantity
    else:
        # This shouldn't happen if order was placed via dropdown, but good to handle
        raise HTTPException(status_code=400, detail="Book not found in inventory. Please add the book to the catalog before receiving stock.")
    
    # 2. Update Order
    order.status = "Received"
    order.received_date = datetime.now().strftime("%Y-%m-%d")
    
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "PROCUREMENT_RECEIVE", f"order:{order_id} ({order.book_name})", "success")
    return {"status": "success", "message": "Stock added to inventory"}

@router.delete("/orders/{order_id}/cancel")
def cancel_stock_order(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    order = db.query(models.StockOrder).filter(models.StockOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status != "Ordered":
        raise HTTPException(status_code=400, detail="Only 'Ordered' requests can be cancelled")
        
    order.status = "Cancelled"
    db.commit()
    
    audit.log_event(db, current_user.role, current_user.username, "PROCUREMENT_CANCEL", f"order:{order_id} ({order.book_name})", "success")
    return {"status": "success", "message": "Order cancelled"}
