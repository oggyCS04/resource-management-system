# app/routes/admin.py

from fastapi import APIRouter, HTTPException
from app.core.security import verify_password, create_access_token
from app.core.database import get_db_connection

router = APIRouter(prefix="/admin", tags=["Admin"])


async def get_admin_by_username(username: str):
    conn = await get_db_connection()

    row = await conn.fetchrow(
        "SELECT id, username, password FROM rms.admins WHERE username = $1 AND is_active = true",
        username
    )

    return dict(row) if row else None


@router.post("/login")
async def admin_login(username: str, password: str):
    admin = await get_admin_by_username(username)

    if not admin or not verify_password(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"sub": username, "role": "admin"}
    )

    return {
        "message": "Login successful",
        "token": token,
        "username": username
    }
