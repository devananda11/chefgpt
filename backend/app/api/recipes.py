from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.chefgpt_service import ChefGPTService

router = APIRouter()
chefgpt_service = ChefGPTService()

class Ingredient(BaseModel):
    name: str
    amount: str
    unit: str

class RecipeRequest(BaseModel):
    ingredients: List[Ingredient]

class RecipeResponse(BaseModel):
    title: str
    description: str
    instructions: List[str]
    cooking_time: int
    difficulty: str

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest):
    try:
        # Generate recipe using ChefGPT
        recipe = await chefgpt_service.generate_recipe(request.ingredients)
        return recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 