from fastapi import APIRouter, HTTPException
import asyncpg
from app.core.database import DATABASE_URL


router = APIRouter(prefix="/resources", tags=["Resources"])


# ---------- DB CONNECTION ----------
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)


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
                rt.target_id AS uploaded_at,
                r.uploaded_by,
                r.date_uploaded,
                COUNT(rt.target_id) AS target_count
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
                rt.target_id,
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