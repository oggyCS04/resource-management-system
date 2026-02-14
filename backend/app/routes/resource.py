from fastapi import APIRouter, HTTPException
import asyncpg
from app.core.database import DATABASE_URL


router = APIRouter(prefix="/resources", tags=["Resources"])


# ---------- DB CONNECTION ----------
# ---------- DB CONNECTION ----------
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

from app.core.security import get_current_student
from typing import Annotated
from fastapi import Depends

#--------- FETCH Student Resources ----------
@router.get("/student")
async def get_student_resources(current_user: Annotated[dict, Depends(get_current_student)]):
    conn = await get_db_connection()
    try:
        # 1. Get student's class_id
        student = await conn.fetchrow("SELECT class_id, campus_rollno FROM rms.students WHERE user_id = $1", current_user["id"])
        if not student:
             raise HTTPException(status_code=404, detail="Student record not found")
        
        class_id = student["class_id"]

        # 2. Get resources for this class
        rows = await conn.fetch("""
            SELECT 
                r.resource_id,
                r.description,
                r.date_uploaded,
                f.file_name,
                f.file_type,
                u.full_name as uploaded_by_name
            FROM rms.resourcetarget rt
            JOIN rms.resource r ON rt.resource_id = r.resource_id
            JOIN rms.file f ON r.file_id = f.file_id
            LEFT JOIN rms.users u ON r.uploaded_by = u.id
            WHERE rt.class_id = $1
            ORDER BY r.date_uploaded DESC
        """, class_id)
        
        resources = []
        for row in rows:
            res_dict = dict(row)
            if res_dict["date_uploaded"]:
                res_dict["date_uploaded"] = res_dict["date_uploaded"].isoformat()
            resources.append(res_dict)
            
        return {"resources": resources, "student_info": dict(student)}
        
    finally:
        await conn.close()


#--------- UPLOAD RESOURCE ----------
@router.post("/upload")
async def upload_resource(file_id: int, description: str, uploaded_by: int):
    conn = await get_db_connection()
    try:
        await conn.execute("""
                INSERT INTO rms.resource (file_id, description, uploaded_by)
                VALUES ($1, $2, $3)
                """,
                file_id,
                description,
                uploaded_by
        )

        return {"message": "Resource uploaded successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        await conn.close()

#--------- FETCH ALL Resources ----------
@router.get("/")
async def get_all_resources():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
                SELECT
                r.resource_id,
                r.file_id,
                r.description,
                f.file_type AS type,
                rt.class_id AS uploaded_at,
                r.uploaded_by,
                r.date_uploaded,
                COUNT(rt.id) AS target_count
                FROM rms.resource r
                LEFT JOIN rms.resourcetarget rt
                ON r.resource_id = rt.resource_id
                LEFT JOIN rms.file f
                ON r.file_id = f.file_id
                GROUP BY
                r.resource_id,
                r.file_id,
                r.description,
                f.file_type,
                rt.class_id,
                r.uploaded_by,
                r.date_uploaded
                ORDER BY
                r.date_uploaded DESC;
                  
                    """)

        resources = []
        for row in rows:
            resources.append({
                "resource_id": row["resource_id"],
                "file_id": row["file_id"],
                "description": row["description"],
                "type": row["type"],
                "uploaded_at": row["uploaded_at"],
                "uploaded_by": row["uploaded_by"],
                "date_uploaded": row["date_uploaded"].isoformat(),
                "target_count": row["target_count"]
            })

        return {
            "count": len(resources),
            "resources": resources
        }

    finally:
        await conn.close()


#--------- GET SINGLE RESOURCE ----------
@router.get("/{resource_id}")
async def get_resource(resource_id: int):
    conn = await get_db_connection()
    try:
        resource = await conn.fetchrow("""
                SELECT * FROM rms.resource WHERE resource_id = $1
                """, resource_id)
        
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        return {
            "resource_id": resource["resource_id"],
            "description": resource["description"],
            "uploaded_by": resource["uploaded_by"],
            "date_uploaded": resource["date_uploaded"]
        }

    finally:
        await conn.close()


#--------- DELETE RESOURCE ----------
@router.delete("/{resource_id}")
async def delete_resource(resource_id: int):
    conn = await get_db_connection()
    try:
        result = await conn.execute("""
                DELETE FROM rms.resource WHERE resource_id = $1
                """, resource_id)
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Resource not found")
        
        return {"message": "Resource deleted successfully"}

    finally:
        await conn.close()