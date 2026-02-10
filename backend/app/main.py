from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import admin, users

app = FastAPI(title="Resource Management System API")

# -------------------- ROUTERS --------------------
app.include_router(admin.router)
app.include_router(users.router)

# -------------------- CORS --------------------
origins = [
    "http://localhost:3000",
    "https://rms-dbms.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- ROOT --------------------
@app.get("/")
async def root():
    return {"message": "Resource Management System API is running"}

# -------------------- HEALTH CHECK --------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api": "Resource Management System",
        "version": "1.0"
    }
