from fastapi import APIRouter, HTTPException, Depends
import asyncpg
import bcrypt
from app.core.database import DATABASE_URL
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_current_admin

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(get_current_admin)])


# ---------- DB CONNECTION ----------
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)




# ---------- DASHBOARD STATS (using JOINs) ----------
@router.get("/dashboard-stats")
async def get_dashboard_stats():
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow("""
            SELECT
                s.total_students,
                t.total_teachers,
                d.total_departments,
                c.total_classes,
                r.total_resources
            FROM
                (SELECT COUNT(*) AS total_students
                 FROM rms.students st
                 JOIN rms.users u ON st.user_id = u.id
                 WHERE u.is_active = true) s,

                (SELECT COUNT(*) AS total_teachers
                 FROM rms.teachers tc
                 JOIN rms.users u ON tc.user_id = u.id
                 WHERE u.is_active = true) t,

                (SELECT COUNT(*) AS total_departments
                 FROM rms.department) d,

                (SELECT COUNT(*) AS total_classes
                 FROM rms.class) c,

                (SELECT COUNT(*) AS total_resources
                 FROM rms.resource) r
        """)

        return {
            "total_students": row["total_students"],
            "total_teachers": row["total_teachers"],
            "total_departments": row["total_departments"],
            "total_classes": row["total_classes"],
            "total_resources": row["total_resources"]
        }

    finally:
        await conn.close()


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




# ---------- GET SINGLE USER ----------
@router.get("/{user_id}")
async def get_user(user_id: int):
    conn = await get_db_connection()
    try:
        # First check if user exists and get basic info
        user = await conn.fetchrow("SELECT * FROM rms.users WHERE id = $1", user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role_id": user["role_id"],
            "is_active": user["is_active"]
        }

        # If student, get student details
        if user["role_id"] == 2:
            student = await conn.fetchrow("SELECT * FROM rms.students WHERE user_id = $1", user_id)
            if student:
                user_data["class_id"] = student["class_id"]
                user_data["campus_rollno"] = student["campus_rollno"]

        # If teacher, get teacher details
        elif user["role_id"] == 1:
            teacher = await conn.fetchrow("SELECT * FROM rms.teachers WHERE user_id = $1", user_id)
            if teacher:
                user_data["department_id"] = teacher["department_id"]

        return user_data

    finally:
        await conn.close()


# ---------- UPDATE USER ----------
@router.patch("/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate):
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # 1. Update basic user info
            update_query = "UPDATE rms.users SET "
            update_params = []
            param_idx = 1
            updates = []

            if user_update.full_name is not None:
                updates.append(f"full_name = ${param_idx}")
                update_params.append(user_update.full_name)
                param_idx += 1
            
            if user_update.email is not None:
                updates.append(f"email = ${param_idx}")
                update_params.append(user_update.email)
                param_idx += 1
            
            if user_update.is_active is not None:
                updates.append(f"is_active = ${param_idx}")
                update_params.append(user_update.is_active)
                param_idx += 1

            if user_update.password:
                hashed_password = bcrypt.hashpw(
                    user_update.password.encode("utf-8"),
                    bcrypt.gensalt()
                ).decode("utf-8")
                updates.append(f"password = ${param_idx}")
                update_params.append(hashed_password)
                param_idx += 1

            if updates:
                update_query += ", ".join(updates) + f" WHERE id = ${param_idx}"
                update_params.append(user_id)
                await conn.execute(update_query, *update_params)

            # 2. Get user role to update specific tables
            role_row = await conn.fetchrow("SELECT role_id FROM rms.users WHERE id = $1", user_id)
            if not role_row:
                raise HTTPException(status_code=404, detail="User not found")
            
            role_id = role_row["role_id"]

            # Update Student details
            if role_id == 2:
                student_updates = []
                student_params = []
                s_idx = 1

                if user_update.class_id is not None:
                    student_updates.append(f"class_id = ${s_idx}")
                    student_params.append(user_update.class_id)
                    s_idx += 1
                
                if user_update.campus_rollno is not None:
                    student_updates.append(f"campus_rollno = ${s_idx}")
                    student_params.append(user_update.campus_rollno)
                    s_idx += 1
                
                if student_updates:
                    s_query = "UPDATE rms.students SET " + ", ".join(student_updates) + f" WHERE user_id = ${s_idx}"
                    student_params.append(user_id)
                    await conn.execute(s_query, *student_params)

            # Update Teacher details
            elif role_id == 1:
                if user_update.department_id is not None:
                    await conn.execute(
                        "UPDATE rms.teachers SET department_id = $1 WHERE user_id = $2",
                        user_update.department_id,
                        user_id
                    )

        return {"message": "User updated successfully"}

    finally:
        await conn.close()