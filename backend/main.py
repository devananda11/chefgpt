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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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

@app.get("/")
async def root():
    return {"message": "Welcome to ChefGPT API"}

@app.post("/generate-recipe")
async def create_recipe(request: RecipeGenerationRequest, user_id: str):
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
        recipe_data = await generate_recipe(
            ingredients=request.ingredients,
            dietary_preferences=request.dietary_preferences,
            cooking_time=request.cooking_time,
            difficulty=request.difficulty,
            servings=request.servings
        )
        saved_recipe = await save_recipe(recipe_data, user_id)
        return saved_recipe
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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