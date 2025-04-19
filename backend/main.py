from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import test_connection
from routers import users, auth0_users
app = FastAPI(title="HackDavis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(auth0_users.router)

@app.get("/")
async def root():
    return {"message": "Welcome to HackDavis API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/db-status")
async def db_status():
    """Check MongoDB connection status"""
    return await test_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 