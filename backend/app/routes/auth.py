from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, Token
from app.core.security import create_access_token, verify_password
from app.core.database import DATABASE_URL
import asyncpg

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    conn = await get_db_connection()
    try:
        # 1. Check Admin Table
        admin = await conn.fetchrow(
            "SELECT id, username, password FROM rms.admins WHERE username = $1 AND is_active = true",
            login_data.email
        )
        
        if admin:
            if verify_password(login_data.password, admin['password']):
                access_token = create_access_token(
                    data={"sub": admin['username'], "role": "admin", "id": admin['id']}
                )
                return {
                    "access_token": access_token, 
                    "token_type": "bearer", 
                    "role": "admin",
                    "username": admin['username']
                }
        
        # 2. Check Users Table (Teacher/Student)
        user = await conn.fetchrow(
            """
            SELECT u.id, u.email, u.password, u.full_name, r.name as role_name
            FROM rms.users u
            JOIN rms.roles r ON u.role_id = r.id
            WHERE u.email = $1 AND u.is_active = true
            """,
            login_data.email
        )

        if user:
            if verify_password(login_data.password, user['password']):
                # Determine role string based on role_name
                # Assuming roles table has 'name' as 'teacher', 'student' etc.
                # Adjust map based on actual DB values if known, safe default is lowercase
                role = user['role_name'] 
                
                access_token = create_access_token(
                    data={"sub": user['email'], "role": role, "id": user['id']}
                )
                return {
                    "access_token": access_token, 
                    "token_type": "bearer", 
                    "role": role,
                    "username": user['full_name']
                }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    finally:
        await conn.close()

from app.core.security import get_current_user
from typing import Annotated

@router.get("/me")
async def get_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return current_user
