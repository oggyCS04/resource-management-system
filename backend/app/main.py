from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import SessionLocal
from app.routes import admin, users
import os

app = FastAPI(title="Resource Management System API")
app.include_router(admin.router) 
app.include_router(users.router)

# CORS - Updated for production
origins = [
    "http://localhost:3000",  # Local development
    os.getenv("FRONTEND_URL", ""),  # Production frontend
    "https://*.vercel.app",  # All Vercel deployments
]

# Remove empty strings
origins = [origin for origin in origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Resource Management System API is running"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "api": "Resource Management System",
        "version": "1.0"
    }

# Uncomment for testing database connection
# @app.get("/db-test")
# def db_test():
#     db = None
#     try:
#         db = SessionLocal()
#         result = db.execute(text("SELECT 1"))
#         return {"database": "connected", "status": "ok"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
#     finally:
#         if db:
#             db.close()