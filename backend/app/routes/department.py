from fastapi import APIRouter, HTTPException
import asyncpg
import bcrypt
from app.core.database import DATABASE_URL
from app.schemas.user import UserCreate
from datetime import date, datetime


router = APIRouter(prefix="/departments", tags=["Departments"])


# ---------- DB CONNECTION ----------
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

#--------- FETCH ALL Departments ----------
@router.get("/")
async def get_all_departments():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
                SELECT
                d.department_id,
                d.name,
                COUNT(DISTINCT c.class_id) AS total_classes,
                COUNT(DISTINCT t.teacher_id) AS total_teachers,
                COUNT(DISTINCT s.student_id) AS total_students
                FROM rms.department d
                LEFT JOIN rms.class c
                ON d.department_id = c.department_id
                LEFT JOIN rms.teachers t
                ON d.department_id = t.department_id
                LEFT JOIN rms.students s
                ON c.class_id = s.class_id
                GROUP BY
                d.department_id,
                d.name
                ORDER BY
                d.department_id;
                  
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

    finally:
        await conn.close()
