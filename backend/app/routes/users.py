from fastapi import APIRouter, HTTPException
import asyncpg
import bcrypt
from app.core.database import DATABASE_URL
from app.schemas.user import UserCreate


router = APIRouter(prefix="/users", tags=["Users"])


# ---------- DB CONNECTION ----------
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)


# ---------- FETCH ALL USERS ----------
@router.get("/")
async def get_all_users():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
            SELECT id, full_name, email, role_id, is_active
            FROM rms.users
            ORDER BY id DESC
        """)

        users = []
        for row in rows:
            users.append({
                "id": row["id"],
                "full_name": row["full_name"],
                "email": row["email"],
                "role_id": row["role_id"],
                "is_active": row["is_active"]
            })

        return {
            "count": len(users),
            "users": users
        }

    finally:
        await conn.close()


# ---------- ADD NEW USER ----------
@router.post("/")
async def add_user(user: UserCreate):
    conn = await get_db_connection()

    try:
        async with conn.transaction():
            existing = await conn.fetchrow(
                "SELECT id FROM rms.users WHERE email = $1",
                user.email
            )
            if existing:
                raise HTTPException(status_code=400, detail="Email already exists")

            hashed_password = bcrypt.hashpw(
                user.password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            user_row = await conn.fetchrow("""
                INSERT INTO rms.users (full_name, email, password, role_id, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            """,
                user.full_name,
                user.email,
                hashed_password,
                user.role_id,
                user.is_active
            )
            
            user_id = user_row["id"]

            if user.role_id == 2 :
                await conn.execute("""
                    INSERT INTO rms.students(user_id,class_id,campus_rollno)
                    VALUES ($1, $2, $3)
                """,
                    user_id,
                    user.class_id,
                    user.campus_rollno
                )

            if user.role_id == 1 :
                await conn.execute("""
                    INSERT INTO rms.teachers(user_id, department_id)
                    VALUES ($1, $2)
                """,
                    user_id,
                    user.department_id
                )
    
        return {"message": "User added successfully"}
    
    finally:
        await conn.close()


# ---------- DELETE USER ----------
@router.delete("/{user_id}")
async def delete_user(user_id: int):
    conn = await get_db_connection()
    try:
        await conn.execute("DELETE FROM rms.users WHERE id = $1", user_id)
        return {"message": "User deleted successfully"}
    finally:
        await conn.close() 


# ---------- FETCH ALL Students ----------
@router.get("/students")
async def get_all_students():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
            select *
            from rms.students s
            join rms.users u
            on s.user_id = u.id
            join rms.class c
            on s.class_id = c.class_id
                    """)

        students= []
        for row in rows:
            students.append({
                "user_id": row["id"],
                "campus_rollno": row["campus_rollno"],
                "full_name": row["full_name"],
                "email": row["email"],
                "class": row["name"],
                "year": row["year"],
                "part": row["semester"],
                "is_active": row["is_active"]
            })

        return {
            "count": len(students),
            "students": students
        }

    finally:
        await conn.close()

# ---------- FETCH ALL Teachers ----------
@router.get("/teachers")
async def get_all_teachers():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
            select *
            from rms.users u
            join rms.teachers t
            on u.id = t.user_id
                    """)

        teachers= []
        for row in rows:
            teachers.append({
                "teacher_id": row["teacher_id"],
                "full_name": row["full_name"],
                "email": row["email"],
                "department_id": row["department_id"],
                "is_active": row["is_active"]
            })

        return {
            "count": len(teachers),
            "teachers": teachers
        }

    finally:
        await conn.close()

