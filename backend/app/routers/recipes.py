from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.recipe_service import generate_recipe, save_recipe, get_user_recipes, rate_recipe

router = APIRouter(prefix="/recipes", tags=["recipes"])

class RecipeGenerationRequest(BaseModel):
    ingredients: List[str]
    dietary_preferences: Optional[List[str]] = None
    cooking_time: Optional[int] = None
    difficulty: Optional[str] = None
    servings: Optional[int] = None
    user_id: Optional[str] = None

@router.post("/generate")
async def create_recipe(request: RecipeGenerationRequest):
    """Generate a recipe based on ingredients and preferences."""
    try:
        recipe_data = await generate_recipe(
            ingredients=request.ingredients,
            dietary_preferences=request.dietary_preferences,
            cooking_time=request.cooking_time,
            difficulty=request.difficulty,
            servings=request.servings
        )
        return recipe_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_recipes(user_id: str):
    """Get all recipes for a user."""
    try:
        recipes = await get_user_recipes(user_id)
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{recipe_id}/rate")
async def rate_recipe_endpoint(recipe_id: str, rating: float):
    """Rate a recipe."""
    try:
        if not 0 <= rating <= 5:
            raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")
        updated_recipe = await rate_recipe(recipe_id, rating)
        return updated_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 