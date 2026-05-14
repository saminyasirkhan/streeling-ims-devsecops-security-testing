from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import database, models, schemas
from dependencies import get_current_user
import os
import shutil
from pathlib import Path

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)

# Create avatars directory if it doesn't exist
AVATAR_DIR = Path("avatars")
AVATAR_DIR.mkdir(exist_ok=True)

@router.get("/me", response_model=schemas.UserProfile)
def get_my_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get current user's profile"""
    return current_user

@router.put("/me")
def update_my_profile(
    profile_data: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update current user's profile"""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.location is not None:
        current_user.location = profile_data.location
    if profile_data.organization is not None:
        current_user.organization = profile_data.organization
    
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "message": "Profile updated successfully"}

@router.post("/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Upload avatar image"""
    
    # Validation removed to allow all users to upload

    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if avatar.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG and PNG images are allowed")
    
    # Validate file size (2MB max)
    contents = await avatar.read()
    if len(contents) > 2 * 1024 * 1024:  # 2MB
        raise HTTPException(status_code=400, detail="File size must be less than 2MB")
    
    # Determine file extension
    ext = avatar.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png"]:
        ext = "jpg"
    
    # Save file
    filename = f"{current_user.id}.{ext}"
    filepath = AVATAR_DIR / filename
    
    # Delete old avatar if exists
    if current_user.avatar_path:
        old_path = Path(current_user.avatar_path)
        if old_path.exists():
            old_path.unlink()
    
    # Write new avatar
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Update database
    current_user.avatar_path = str(filepath)
    db.commit()
    
    return {"status": "success", "message": "Avatar uploaded successfully", "path": str(filepath)}

@router.delete("/avatar")
def delete_avatar(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete avatar image"""
    if not current_user.avatar_path:
        raise HTTPException(status_code=404, detail="No avatar to delete")
    
    # Delete file
    avatar_path = Path(current_user.avatar_path)
    if avatar_path.exists():
        avatar_path.unlink()
    
    # Update database
    current_user.avatar_path = None
    db.commit()
    
    return {"status": "success", "message": "Avatar deleted successfully"}
