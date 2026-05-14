from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth_utils
from dependencies import get_current_user, limiter, RoleChecker
from routers import audit

router = APIRouter(
    prefix="",
    tags=["users"]
)

allow_admin = RoleChecker(["Admin"])
allow_staff = RoleChecker(["Admin", "Librarian"])

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    username_lower = user.username.lower()
    db_user = db.query(models.User).filter(models.User.username == username_lower).first()
    
    if db_user and auth_utils.verify_password(user.password, db_user.password):
        if db_user.is_locked:
            raise HTTPException(status_code=403, detail="Account is locked. Please contact an administrator.")
        
        access_token = auth_utils.create_access_token(
            data={"sub": db_user.username, "role": db_user.role}
        )

        audit.log_event(db, db_user.role, db_user.username, "LOGIN", "auth:-", "success")

        return {
            "status": "success", 
            "access_token": access_token, 
            "token_type": "bearer",
            "role": db_user.role, 
            "username": db_user.username
        }
    
    audit.log_event(db, "Visitor", user.username, "LOGIN_FAIL", "auth:-", "fail")
    raise HTTPException(status_code=401, detail="Invalid credentials")



@router.post("/admin/register")
def admin_register(user: schemas.UserRegister, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    
    if user.role not in ["Librarian", "Student"]:
        raise HTTPException(status_code=400, detail=f"Invalid role: {user.role}. Only Librarian or Student allowed.")
    
    username_lower = user.username.lower()
    db_user = db.query(models.User).filter(models.User.username == username_lower).first()
    if db_user:
         audit.log_event(db, current_user.role, current_user.username, "ADMIN_CREATE_USER_FAIL", f"user:{username_lower}", "fail")
         raise HTTPException(status_code=400, detail=f"A user with the email '{username_lower}' already exists. Every user must have a unique identity.")
    
    hashed_pwd = auth_utils.get_password_hash(user.password)
    new_user = models.User(username=username_lower, password=hashed_pwd, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    audit.log_event(db, current_user.role, current_user.username, "ADMIN_CREATE_USER", f"user:{new_user.id}:{user.role}", "success")
    
    return {"status": "success", "message": f"{user.role} created successfully"}

@router.get("/users")
def get_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    return db.query(models.User).all()

@router.delete("/users/{username}")
def delete_user(username: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    if current_user.username == username:
        raise HTTPException(status_code=400, detail="Administrators cannot remove their own account")
        
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        audit.log_event(db, current_user.role, current_user.username, "USER_DELETE", f"user:{username}", "success")
    return {"status": "success"}

@router.put("/users/{username}")
def update_user(username: str, user_update: schemas.UserUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_admin)):
    if current_user.username == username and user_update.is_locked is not None:
        raise HTTPException(status_code=400, detail="Administrators cannot lock their own account")

    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.password:
        db_user.password = auth_utils.get_password_hash(user_update.password)
    
    if user_update.is_locked is not None:
        db_user.is_locked = user_update.is_locked
        
    db.commit()
    audit.log_event(db, current_user.role, current_user.username, "USER_UPDATE", f"user:{username}", "success")
    return {"status": "success", "message": "User updated"}

@router.get("/id/{user_id}", response_model=schemas.User)
def get_user_by_id(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(allow_staff)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
