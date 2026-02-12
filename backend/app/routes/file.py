from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
from datetime import datetime
import asyncpg
from app.core.database import DATABASE_URL
from app.core.storage import supabase, BUCKET_NAME

router = APIRouter(prefix="/files", tags=["Files"])

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)


# ---------- UPLOAD FILE (PRIVATE) ----------
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    conn = await get_db_connection()

    try:
        # 1️⃣ Generate unique file name
        unique_filename = f"{uuid.uuid4()}_{file.filename}"

        # 2️⃣ Read file content
        file_bytes = await file.read()

        # 3️⃣ Upload to PRIVATE Supabase bucket
        supabase.storage.from_(BUCKET_NAME).upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )

        # 4️⃣ Store ONLY file path in database
        await conn.execute("""
            INSERT INTO rms.file (file_name, file_path, file_type, uploaded_at)
            VALUES ($1, $2, $3, $4)
        """,
            file.filename,
            unique_filename,  # store only path
            file.content_type,
            datetime.now()
        )

        return {
            "message": "File uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        await conn.close()


# ------------ FETCH ALL FILES ----------
@router.get("/")
async def get_all_files():
    conn = await get_db_connection()

    try:
        rows = await conn.fetch("""
            SELECT file_id, file_name, file_type, uploaded_at
            FROM rms.file
            ORDER BY uploaded_at DESC
        """)

        files = []
        for row in rows:
            files.append({
                "file_id": row["file_id"],
                "file_name": row["file_name"],
                "file_type": row["file_type"],
                "uploaded_at": row["uploaded_at"].isoformat()
            })

        return {
            "count": len(files),
            "files": files
        }

    finally:
        await conn.close()


# ---------- GET SIGNED URL ----------
@router.get("/{file_id}")
async def get_file(file_id: int):
    conn = await get_db_connection()

    try:
        # 1️⃣ Get file path from DB
        record = await conn.fetchrow("""
            SELECT file_path FROM rms.file WHERE file_id = $1
        """, file_id)

        if not record:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = record["file_path"]

        # 2️⃣ Create signed URL (valid 60 seconds)
        signed_url = supabase.storage.from_(BUCKET_NAME).create_signed_url(
            file_path,
            60  # expiry in seconds
        )

        return {
            "download_url": signed_url["signedURL"]
        }

    finally:
        await conn.close()


# ---------- DELETE FILE ----------
@router.delete("/{file_id}")
async def delete_file(file_id: int):
    conn = await get_db_connection()

    try:
        record = await conn.fetchrow("""
            SELECT file_path FROM rms.file WHERE file_id = $1
        """, file_id)

        if not record:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = record["file_path"]

        # Delete from storage
        supabase.storage.from_(BUCKET_NAME).remove([file_path])

        # Delete from database
        await conn.execute("""
            DELETE FROM rms.file WHERE file_id = $1
        """, file_id)

        return {"message": "File deleted successfully"}

    finally:
        await conn.close()
