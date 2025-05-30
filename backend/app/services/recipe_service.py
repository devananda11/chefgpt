import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from .supabase_client import supabase
import json

load_dotenv()

# Configure Google AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')  # Using Gemini 1.5 Flash

async def generate_recipe(
    ingredients: List[str],
    dietary_preferences: Optional[List[str]] = None,
    cooking_time: Optional[int] = None,
    difficulty: Optional[str] = None,
    servings: Optional[int] = None
) -> Dict:
    """
    Generate a recipe based on provided ingredients and preferences using Gemini AI.
    
    Args:
        ingredients: List of ingredients to use
        dietary_preferences: Optional list of dietary preferences (e.g., ["vegetarian", "gluten-free"])
        cooking_time: Optional maximum cooking time in minutes
        difficulty: Optional difficulty level ("easy", "medium", "hard")
        servings: Optional number of servings
    """
    # Build the prompt with all available information
    prompt_parts = [
        f"Create a recipe using these ingredients: {', '.join(ingredients)}"
    ]
    
    if dietary_preferences:
        prompt_parts.append(f"Dietary preferences: {', '.join(dietary_preferences)}")
    if cooking_time:
        prompt_parts.append(f"Maximum cooking time: {cooking_time} minutes")
    if difficulty:
        prompt_parts.append(f"Difficulty level: {difficulty}")
    if servings:
        prompt_parts.append(f"Number of servings: {servings}")

    prompt_parts.append("""
    Format the response as a JSON object with the following structure:
    {
        "title": "Recipe name",
        "description": "Brief description of the recipe",
        "ingredients": [
            {
                "name": "ingredient name",
                "amount": "quantity",
                "unit": "unit of measurement"
            }
        ],
        "instructions": [
            {
                "step": 1,
                "description": "detailed step description"
            }
        ],
        "cooking_time": {
            "prep_time": minutes,
            "cook_time": minutes,
            "total_time": minutes
        },
        "difficulty": "easy/medium/hard",
        "servings": number,
        "nutritional_info": {
            "calories": number,
            "protein": "grams",
            "carbs": "grams",
            "fat": "grams"
        },
        "tags": ["tag1", "tag2"],
        "tips": ["tip1", "tip2"]
    }
    """)

    prompt = "\n".join(prompt_parts)
    
    try:
        # Configure generation parameters for better results
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        recipe_json = response.text
        
        # Clean up the response to ensure it's valid JSON
        # Sometimes the model might include markdown code blocks
        recipe_json = recipe_json.replace("```json", "").replace("```", "").strip()
        
        # Parse the JSON response
        recipe_data = json.loads(recipe_json)
        
        # Validate required fields
        required_fields = ["title", "ingredients", "instructions", "cooking_time", "difficulty", "servings"]
        for field in required_fields:
            if field not in recipe_data:
                raise ValueError(f"Missing required field: {field}")
        
        return recipe_data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Error generating recipe: {str(e)}")

async def save_recipe(recipe_data: Dict, user_id: str) -> Dict:
    """Save a recipe to Supabase."""
    recipe = {
        "title": recipe_data["title"],
        "description": recipe_data.get("description", ""),
        "ingredients": recipe_data["ingredients"],
        "instructions": recipe_data["instructions"],
        "cooking_time": recipe_data["cooking_time"],
        "difficulty": recipe_data["difficulty"],
        "servings": recipe_data["servings"],
        "nutritional_info": recipe_data.get("nutritional_info", {}),
        "tags": recipe_data.get("tags", []),
        "tips": recipe_data.get("tips", []),
        "user_id": user_id,
        "rating": 0,
        "total_ratings": 0
    }
    
    result = supabase.table("recipes").insert(recipe).execute()
    return result.data[0]

async def get_user_recipes(user_id: str) -> List[Dict]:
    """Get all recipes for a specific user."""
    result = supabase.table("recipes").select("*").eq("user_id", user_id).execute()
    return result.data

async def rate_recipe(recipe_id: str, rating: float) -> Dict:
    """Update recipe rating."""
    # First get current recipe data
    recipe = supabase.table("recipes").select("*").eq("id", recipe_id).execute().data[0]
    
    # Calculate new average rating
    current_total = recipe["rating"] * recipe["total_ratings"]
    new_total = current_total + rating
    new_count = recipe["total_ratings"] + 1
    new_rating = new_total / new_count
    
    # Update recipe
    result = supabase.table("recipes").update({
        "rating": new_rating,
        "total_ratings": new_count
    }).eq("id", recipe_id).execute()
    
    return result.data[0] 