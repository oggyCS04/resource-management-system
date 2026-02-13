from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import asyncpg
from app.core.database import DATABASE_URL

router = APIRouter(prefix="/teacher", tags=["Teacher"])

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

# --- Schemas ---

class ResourceCreate(BaseModel):
    file_id: int
    description: str
    class_id: int
    uploaded_by: Optional[int] = None # Allow implicit if auth logic changes; for now frontend can send it or we defaulting to a teacher ID if available? 
    # Requirement said "no login", so frontend will likely have to mock or we pick a default teacher. 
    # Let's enforce it in the API but frontend might send a dummy ID or we pick one.
    # Actually, existing 'resource' table has `uploaded_by` (integer). 
    # Let's assume frontend sends a valid user_id (e.g., from a hardcoded teacher context or selector if strict auth isn't there).

class ResourceLink(BaseModel):
    resource_id: int
    class_id: int
    description: Optional[str] = None


# --- Routes ---

# 1. View list of classes they teach
# Since no login, we'll return ALL classes, or grouped by department?
# Request says "View the list of classes they teach". 
# Without login, "they" is ambiguous. I will return ALL classes in the system for now, 
# or maybe allow filtering by teacher_id if provided as a query param. 
# For simplicity and "no login", I'll just list all classes joined with department info.
@router.get("/classes")
async def get_teacher_classes():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
            SELECT 
                c.class_id,
                c.name as class_name,
                c.year,
                c.semester,
                d.name as department_name,
                (SELECT COUNT(*) FROM rms.resourcetarget rt WHERE rt.class_id = c.class_id) as resource_count
            FROM rms.class c
            JOIN rms.department d ON c.department_id = d.department_id
            ORDER BY d.name, c.year, c.semester, c.name
        """)
        
        classes = [dict(row) for row in rows]
        return {"classes": classes}
    finally:
        await conn.close()

# 2. Get class details (header info)
@router.get("/classes/{class_id}")
async def get_class_details(class_id: int):
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow("""
             SELECT 
                c.class_id,
                c.name as class_name,
                d.name as department_name
            FROM rms.class c
            JOIN rms.department d ON c.department_id = d.department_id
            WHERE c.class_id = $1
        """, class_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Class not found")
            
        return dict(row)
    finally:
        await conn.close()

# 3. View previously uploaded resources for that class
@router.get("/classes/{class_id}/resources")
async def get_class_resources(class_id: int):
    conn = await get_db_connection()
    try:
        # We need to join resource -> resourcetarget -> class
        # And also fetch file info
        rows = await conn.fetch("""
            SELECT 
                r.resource_id,
                r.description,
                r.date_uploaded,
                f.file_name,
                f.file_type,
                f.file_id,
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
            # Serialize date
            if res_dict["date_uploaded"]:
                res_dict["date_uploaded"] = res_dict["date_uploaded"].isoformat()
            resources.append(res_dict)
            
        return {"resources": resources}
    finally:
        await conn.close()

# 4. Upload a new resource (target to class)
@router.post("/resources")
async def create_resource_for_class(resource_data: ResourceCreate):
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # Create resource record
            # uploaded_by is required in DB schema? Let's check schema.
            # Assuming 'uploaded_by' is nullable or we need a valid user ID. 
            # I'll default to 1 (admin) if not provided for now, or fail if DB constraint exists.
            # Realistically, frontend should send a user ID or we assume a "System" user.
            
            # For now, I'll insert.
            
            # Check if file exists
            file_check = await conn.fetchrow("SELECT file_id FROM rms.file WHERE file_id = $1", resource_data.file_id)
            if not file_check:
                raise HTTPException(status_code=404, detail="File not found")

            # Insert Resource
            # We treat 'description' in Resource table as the master description? 
            # Or is it specific to this upload? yes.
            resource_row = await conn.fetchrow("""
                INSERT INTO rms.resource (file_id, description, uploaded_by, date_uploaded)
                VALUES ($1, $2, $3, NOW())
                RETURNING resource_id
            """, resource_data.file_id, resource_data.description, resource_data.uploaded_by or 1) 
            # Defaulting uploaded_by to 1 just to satisfy FK if exists.
            
            new_res_id = resource_row["resource_id"]
            
            # Link to Class (ResourceTarget)
            await conn.execute("""
                INSERT INTO rms.resourcetarget (resource_id, class_id)
                VALUES ($1, $2)
            """, new_res_id, resource_data.class_id)
            
            return {"message": "Resource created and linked successfully", "resource_id": new_res_id}
            
    except Exception as e:
        print(f"Error creating resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

# 5. Target an existing resource to that class with a new description
@router.post("/resources/link")
async def link_existing_resource(link_data: ResourceLink):
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # 1. Get the original resource to find the file_id
            orig_res = await conn.fetchrow("SELECT file_id, uploaded_by FROM rms.resource WHERE resource_id = $1", link_data.resource_id)
            if not orig_res:
                 raise HTTPException(status_code=404, detail="Original resource not found")
            
            file_id = orig_res["file_id"]
            uploaded_by = orig_res["uploaded_by"]
            
            # 2. Create NEW resource entry with the NEW description (or old one if none provided)
            # This satisfies "Target an existing resource ... with a new description"
            # It essentially duplicates the metadata (description) pointing to the same physical file.
            
            # Fetch old description if new one is None
            description = link_data.description
            if description is None:
                 old_desc_row = await conn.fetchrow("SELECT description FROM rms.resource WHERE resource_id = $1", link_data.resource_id)
                 description = old_desc_row["description"]
            
            new_res_row = await conn.fetchrow("""
                INSERT INTO rms.resource (file_id, description, uploaded_by, date_uploaded)
                VALUES ($1, $2, $3, NOW())
                RETURNING resource_id
            """, file_id, description, uploaded_by)
            
            new_res_id = new_res_row["resource_id"]
            
            # 3. Link this NEW resource to the class
            await conn.execute("""
                INSERT INTO rms.resourcetarget (resource_id, class_id)
                 VALUES ($1, $2)
            """, new_res_id, link_data.class_id)
            
            return {"message": "Resource linked with new description successfully", "resource_id": new_res_id}

    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

# Helper to look up resources for dropdown
@router.get("/resources/search")
async def search_resources(query: str = ""):
     conn = await get_db_connection()
     try:
        # Simple search by description or file name
        rows = await conn.fetch("""
            SELECT r.resource_id, r.description, f.file_name 
            FROM rms.resource r
            JOIN rms.file f ON r.file_id = f.file_id
            WHERE r.description ILIKE $1 OR f.file_name ILIKE $1
            LIMIT 20
        """, f"%{query}%")
        
        return {"resources": [dict(row) for row in rows]}
     finally:
        await conn.close()
