# app/core/database.py

import os
from dotenv import load_dotenv
import asyncpg
import ssl

load_dotenv()  # Load environment variables from .env file

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

# SSL context required for Supabase on Vercel
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Global reusable connection (serverless-safe)
_db_conn: asyncpg.Connection | None = None


async def get_db_connection() -> asyncpg.Connection:
    global _db_conn

    if _db_conn is None or _db_conn.is_closed():
        _db_conn = await asyncpg.connect(
            DATABASE_URL,
            ssl=ssl_context,
        )

    return _db_conn
