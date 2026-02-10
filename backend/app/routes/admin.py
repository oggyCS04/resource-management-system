from fastapi import APIRouter, HTTPException
import asyncpg
from app.core.security import verify_password, create_access_token
from app.core.database import DATABASE_URL  

router = APIRouter()

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

async def get_admin_by_username(username: str):
    conn = await get_db_connection()
    try:
        
        row = await conn.fetchrow(
            "SELECT id, username, password FROM rms.admins WHERE username = $1 AND is_active = true", 
            username
        )
        return dict(row) if row else None
    finally:
        await conn.close()

@router.post("/admin/login")
async def admin_login(username: str, password: str):
    admin = await get_admin_by_username(username)
    
    if not admin or not verify_password(password, admin['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": username, "role": "admin"})
    return {
        "message": "Login successful", 
        "token": token, 
        "username": username
    }
