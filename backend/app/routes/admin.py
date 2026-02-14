from fastapi import APIRouter, HTTPException
import asyncpg
from app.core.security import verify_password, create_access_token
from app.core.database import DATABASE_URL  

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/")
async def admin_root():
    return {"message": "Admin area"}
