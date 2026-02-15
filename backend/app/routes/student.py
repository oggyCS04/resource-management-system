from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Annotated
import asyncpg
from app.core.database import DATABASE_URL
from app.core.security import get_current_student

router = APIRouter(prefix="/student", tags=["Student"])

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)


# --- Routes ---

# 1. Get student dashboard info (class and roll number)
@router.get("/dashboard")
async def get_student_dashboard(current_user: Annotated[dict, Depends(get_current_student)]):
    conn = await get_db_connection()
    try:
        # Get student info
        student = await conn.fetchrow("""
            SELECT 
                s.student_id,
                s.roll_number,
                c.class_id,
                c.name as class_name,
                c.year,
                c.semester,
                d.name as department_name
            FROM rms.students s
            JOIN rms.class c ON s.class_id = c.class_id
            JOIN rms.department d ON c.department_id = d.department_id
            WHERE s.user_id = $1
        """, current_user["id"])
        
        if not student:
            raise HTTPException(status_code=404, detail="Student record not found")
        
        return dict(student)
    finally:
        await conn.close()


# 2. Get all resources grouped by subject for student's class
@router.get("/resources")
async def get_student_resources(current_user: Annotated[dict, Depends(get_current_student)]):
    conn = await get_db_connection()
    try:
        # Get student's class
        student = await conn.fetchrow("""
            SELECT class_id FROM rms.students WHERE user_id = $1
        """, current_user["id"])
        
        if not student:
            return {"subjects": []}
        
        class_id = student["class_id"]
        
        # ✅ Get all subjects for this class with their resources
        rows = await conn.fetch("""
            SELECT DISTINCT
                s.subject_id,
                s.name as subject_name,
                r.resource_id,
                r.description,
                r.date_uploaded,
                f.file_name,
                f.file_type,
                f.file_id,
                u.full_name as uploaded_by_name
            FROM rms.subject s
            JOIN rms.teachersubjectclass tsc ON s.subject_id = tsc.subject_id
            LEFT JOIN rms.teachers t ON tsc.teacher_id = t.teacher_id
            LEFT JOIN rms.resource r ON r.uploaded_by = t.user_id
            LEFT JOIN rms.resourcetarget rt ON r.resource_id = rt.resource_id
            LEFT JOIN rms.file f ON r.file_id = f.file_id
            LEFT JOIN rms.users u ON r.uploaded_by = u.id
            WHERE tsc.class_id = $1 
            AND (rt.class_id = $1 OR rt.class_id IS NULL)
            ORDER BY s.name, r.date_uploaded DESC
        """, class_id)
        
        # ✅ Group resources by subject
        subjects_dict = {}
        
        for row in rows:
            subject_id = row["subject_id"]
            subject_name = row["subject_name"]
            
            # Create subject entry if doesn't exist
            if subject_id not in subjects_dict:
                subjects_dict[subject_id] = {
                    "subject_id": subject_id,
                    "subject_name": subject_name,
                    "resources": []
                }
            
            # Add resource if it exists (LEFT JOIN may return null)
            if row["resource_id"]:
                # Avoid duplicates
                resource_exists = any(
                    res["resource_id"] == row["resource_id"] 
                    for res in subjects_dict[subject_id]["resources"]
                )
                
                if not resource_exists:
                    subjects_dict[subject_id]["resources"].append({
                        "resource_id": row["resource_id"],
                        "description": row["description"],
                        "file_name": row["file_name"],
                        "file_type": row["file_type"],
                        "file_id": row["file_id"],
                        "uploaded_by_name": row["uploaded_by_name"],
                        "date_uploaded": row["date_uploaded"].isoformat() if row["date_uploaded"] else None
                    })
        
        return {"subjects": list(subjects_dict.values())}
        
    finally:
        await conn.close()


# 3. Get resources for a specific subject (optional - for filtering)
@router.get("/subjects/{subject_id}/resources")
async def get_subject_resources(subject_id: int, current_user: Annotated[dict, Depends(get_current_student)]):
    conn = await get_db_connection()
    try:
        # Get student's class
        student = await conn.fetchrow("""
            SELECT class_id FROM rms.students WHERE user_id = $1
        """, current_user["id"])
        
        if not student:
            return {"resources": []}
        
        class_id = student["class_id"]
        
        # Get resources for specific subject
        rows = await conn.fetch("""
            SELECT DISTINCT
                r.resource_id,
                r.description,
                r.date_uploaded,
                f.file_name,
                f.file_type,
                f.file_id,
                u.full_name as uploaded_by_name
            FROM rms.teachersubjectclass tsc
            JOIN rms.teachers t ON tsc.teacher_id = t.teacher_id
            JOIN rms.resource r ON r.uploaded_by = t.user_id
            JOIN rms.resourcetarget rt ON r.resource_id = rt.resource_id
            JOIN rms.file f ON r.file_id = f.file_id
            LEFT JOIN rms.users u ON r.uploaded_by = u.id
            WHERE tsc.class_id = $1 
            AND tsc.subject_id = $2
            AND rt.class_id = $1
            ORDER BY r.date_uploaded DESC
        """, class_id, subject_id)
        
        resources = []
        for row in rows:
            res_dict = dict(row)
            if res_dict["date_uploaded"]:
                res_dict["date_uploaded"] = res_dict["date_uploaded"].isoformat()
            resources.append(res_dict)
        
        return {"resources": resources}
        
    finally:
        await conn.close()


# 4. Get download URL for a file
@router.get("/files/{file_id}/download")
async def get_file_download_url(file_id: int, current_user: Annotated[dict, Depends(get_current_student)]):
    """
    Get download URL for a file.
    This endpoint verifies the student has access to the file.
    """
    conn = await get_db_connection()
    try:
        # Verify student has access to this file through their class
        student = await conn.fetchrow("""
            SELECT class_id FROM rms.students WHERE user_id = $1
        """, current_user["id"])
        
        if not student:
            raise HTTPException(status_code=403, detail="Student record not found")
        
        # Check if file is accessible to student's class
        file_access = await conn.fetchrow("""
            SELECT f.file_id
            FROM rms.file f
            JOIN rms.resource r ON f.file_id = r.file_id
            JOIN rms.resourcetarget rt ON r.resource_id = rt.resource_id
            WHERE f.file_id = $1 AND rt.class_id = $2
        """, file_id, student["class_id"])
        
        if not file_access:
            raise HTTPException(status_code=403, detail="You don't have access to this file")
        
        # Return file_id to be used with files endpoint
        # The actual download will happen through /files/{file_id} endpoint
        return {"file_id": file_id, "message": "Access granted"}
        
    finally:
        await conn.close()