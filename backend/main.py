from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import List, Optional
import json
from app.services.recipe_service import generate_recipe, save_recipe, get_user_recipes, rate_recipe
from app.services.supabase_client import supabase
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI(title="ChefGPT API")

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeGenerationRequest(BaseModel):
    ingredients: List[str]
    dietary_preferences: Optional[List[str]] = None
    cooking_time: Optional[int] = None
    difficulty: Optional[str] = None
    servings: Optional[int] = None
    user_id: Optional[str] = None  # Make user_id optional

@app.get("/")
async def root():
    return {"message": "Welcome to ChefGPT API"}

@app.get("/test")
async def test():
    """Test endpoint to check if server is running."""
    return {"status": "ok", "message": "Server is running"}

@app.post("/generate-recipe")
async def create_recipe(request: RecipeGenerationRequest):
    """
    Generate a recipe based on ingredients and preferences.
    
    Parameters:
    - ingredients: List of ingredients to use
    - dietary_preferences: Optional list of dietary preferences
    - cooking_time: Optional maximum cooking time in minutes
    - difficulty: Optional difficulty level
    - servings: Optional number of servings
    """
    try:
        print("Received recipe generation request:", request.dict())
        recipe_data = await generate_recipe(
            ingredients=request.ingredients,
            dietary_preferences=request.dietary_preferences,
            cooking_time=request.cooking_time,
            difficulty=request.difficulty,
            servings=request.servings
        )
        
        return recipe_data
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipes/{user_id}")
async def get_recipes(user_id: str):
    """Get all recipes for a user."""
    try:
        recipes = await get_user_recipes(user_id)
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recipes/{recipe_id}/rate")
async def rate_recipe_endpoint(recipe_id: str, rating: float):
    """Rate a recipe."""
    try:
        if not 0 <= rating <= 5:
            raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")
        updated_recipe = await rate_recipe(recipe_id, rating)
        return updated_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 