from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecipeBase(BaseModel):
    title: str
    ingredients: List[str]
    instructions: List[str]
    cooking_time: int  # in minutes
    difficulty: str
    servings: int

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: str
    user_id: str
    created_at: datetime
    rating: Optional[float] = None
    total_ratings: int = 0

    class Config:
        from_attributes = True

class RecipeRating(BaseModel):
    recipe_id: str
    rating: float  # 1-5 