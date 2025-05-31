from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.routers import recipes

# Load environment variables
load_dotenv()

app = FastAPI(title="ChefGPT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chefgpt-two.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(recipes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to ChefGPT API"}

@app.get("/test")
async def test():
    """Test endpoint to check if server is running."""
    return {"status": "ok", "message": "Server is running"} 