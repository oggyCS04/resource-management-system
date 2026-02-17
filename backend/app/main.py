from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import SessionLocal
from app.routes import auth, admin, users, department, resource, file, teacher, student
import os


app = FastAPI(title="Resource Management System API")

app.include_router(auth.router)
app.include_router(admin.router) 
app.include_router(users.router)
app.include_router(department.router)
app.include_router(resource.router)
app.include_router(file.router)
app.include_router(teacher.router)
app.include_router(student.router)

# CORS - Updated for production
origins = [
    "http://localhost:3000",  # Local development
    os.getenv("FRONTEND_URL", ""),  # Frontend URL from environment variable
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
    
    return {
        "status": "healthy",
        "api": "Resource Management System",
        "version": "1.0"
    }
