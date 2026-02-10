from fastapi import APIRouter, HTTPException
import bcrypt
from datetime import date, datetime

from app.core.database import get_db_connection
from app.schemas.user import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])


# ---------- FETCH ALL USERS ----------
@router.get("/")
async def get_all_users():
    conn = await get_db_connection()

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


# ---------- ADD NEW USER ----------
@router.post("/")
async def add_user(user: UserCreate):
    conn = await get_db_connection()

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

        if user.role_id == 2:
            await conn.execute("""
                INSERT INTO rms.students (user_id, class_id, campus_rollno)
                VALUES ($1, $2, $3)
            """,
                user_id,
                user.class_id,
                user.campus_rollno
            )

        if user.role_id == 1:
            await conn.execute("""
                INSERT INTO rms.teachers (user_id, department_id)
                VALUES ($1, $2)
            """,
                user_id,
                user.department_id
            )

    return {"message": "User added successfully"}


# ---------- DELETE USER ----------
@router.delete("/{user_id}")
async def delete_user(user_id: int):
    conn = await get_db_connection()

    await conn.execute(
        "DELETE FROM rms.users WHERE id = $1",
        user_id
    )

    return {"message": "User deleted successfully"}


# ---------- FETCH ALL STUDENTS ----------
@router.get("/students")
async def get_all_students():
    conn = await get_db_connection()

    rows = await conn.fetch("""
        SELECT *
        FROM rms.students s
        JOIN rms.users u ON s.user_id = u.id
        JOIN rms.class c ON s.class_id = c.class_id
    """)

    students = []
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


# ---------- FETCH ALL TEACHERS ----------
@router.get("/teachers")
async def get_all_teachers():
    conn = await get_db_connection()

    rows = await conn.fetch("""
        SELECT *
        FROM rms.users u
        JOIN rms.teachers t ON u.id = t.user_id
    """)

    teachers = []
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


# ---------- FETCH ALL DEPARTMENTS ----------
@router.get("/departments")
async def get_all_departments():
    conn = await get_db_connection()

    rows = await conn.fetch("""
        SELECT
            d.department_id,
            d.name,
            COUNT(DISTINCT c.class_id) AS total_classes,
            COUNT(DISTINCT t.teacher_id) AS total_teachers,
            COUNT(DISTINCT s.student_id) AS total_students
        FROM rms.department d
        LEFT JOIN rms.class c ON d.department_id = c.department_id
        LEFT JOIN rms.teachers t ON d.department_id = t.department_id
        LEFT JOIN rms.students s ON c.class_id = s.class_id
        GROUP BY d.department_id, d.name
        ORDER BY d.department_id
    """)

    departments = []
    for row in rows:
        departments.append({
            "department_id": row["department_id"],
            "name": row["name"],
            "total_classes": row["total_classes"],
            "total_teachers": row["total_teachers"],
            "total_students": row["total_students"]
        })

    return {
        "count": len(departments),
        "departments": departments
    }


# ---------- FETCH ALL RESOURCES ----------
@router.get("/resources")
async def get_all_resources():
    conn = await get_db_connection()

    rows = await conn.fetch("""
        SELECT
            r.resource_id,
            r.file_id,
            r.description,
            r.uploaded_by,
            r.date_uploaded,
            COUNT(rt.target_id) AS target_count
        FROM rms.resource r
        LEFT JOIN rms.resourcetarget rt ON r.resource_id = rt.resource_id
        GROUP BY
            r.resource_id,
            r.file_id,
            r.description,
            r.uploaded_by,
            r.date_uploaded
        ORDER BY r.date_uploaded DESC
    """)

    resources = []
    for row in rows:
        resources.append({
            "resource_id": row["resource_id"],
            "description": row["description"],
            "uploaded_by": row["uploaded_by"],
            "date_uploaded": row["date_uploaded"].isoformat(),
            "target_count": row["target_count"]
        })

    return {
        "count": len(resources),
        "resources": resources
    }


# ---------- GET SINGLE RESOURCE ----------
@router.get("/resources/{resource_id}")
async def get_resource(resource_id: int):
    conn = await get_db_connection()

    resource = await conn.fetchrow(
        "SELECT * FROM rms.resource WHERE resource_id = $1",
        resource_id
    )

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    return {
        "resource_id": resource["resource_id"],
        "description": resource["description"],
        "uploaded_by": resource["uploaded_by"],
        "date_uploaded": resource["date_uploaded"]
    }


# ---------- DELETE RESOURCE ----------
@router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: int):
    conn = await get_db_connection()

    result = await conn.execute(
        "DELETE FROM rms.resource WHERE resource_id = $1",
        resource_id
    )

    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Resource not found")

    return {"message": "Resource deleted successfully"}
