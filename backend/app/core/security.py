# app/core/security.py

from datetime import datetime, timedelta, timezone
import jwt
import bcrypt

SECRET_KEY = "rms_secret_key_change_later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(data: dict) -> str:
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({"exp": expire})

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

from fastapi import Request
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from typing import Annotated, Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

async def get_current_user(request: Request, token: Annotated[Optional[str], Depends(oauth2_scheme)]):
    # Try getting token from header (oauth2_scheme) or cookie
    if not token:
        token = request.cookies.get("token")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id")
        if username is None or role is None:
            raise credentials_exception
        return {"username": username, "role": role, "id": user_id}
    except jwt.PyJWTError:
        raise credentials_exception

async def get_current_active_user(current_user: Annotated[dict, Depends(get_current_user)]):
    # In a real app, we might check if the user is active in DB here
    # For now, we trust the token or the initial login check
    return current_user

async def get_current_admin(current_user: Annotated[dict, Depends(get_current_active_user)]):
    # Normalize role to lowercase for comparison
    if current_user["role"].lower() != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_teacher(current_user: Annotated[dict, Depends(get_current_active_user)]):
    if current_user["role"].lower() != "teacher":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_student(current_user: Annotated[dict, Depends(get_current_active_user)]):
    if current_user["role"].lower() != "student":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
