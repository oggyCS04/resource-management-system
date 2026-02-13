from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    class_id: Optional[int] = None
    campus_rollno: Optional[str] = None
    role_id: int
    is_active: bool = True
    department_id: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    class_id: Optional[int] = None
    campus_rollno: Optional[str] = None
    department_id: Optional[int] = None