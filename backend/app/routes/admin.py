# app/routes/admin.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncpg
from app.core.security import verify_password, create_access_token
from app.core.database import DATABASE_URL  

router = APIRouter(prefix="/admin", tags=["Admin"])

class LoginRequest(BaseModel):
    username: str
    password: str

async def get_db_connection():
    try:
        return await asyncpg.connect(DATABASE_URL)
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

async def get_admin_by_username(username: str):
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            "SELECT id, username, password FROM rms.admins WHERE username = $1 AND is_active = true", 
            username
        )
        return dict(row) if row else None
    except Exception as e:
        print(f"Query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    finally:
        await conn.close()

@router.post("/login")
async def admin_login(credentials: LoginRequest):
    try:
        admin = await get_admin_by_username(credentials.username)
        
        if not admin or not verify_password(credentials.password, admin['password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token({"sub": credentials.username, "role": "admin"})
        return {
            "message": "Login successful", 
            "token": token, 
            "username": credentials.username
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")