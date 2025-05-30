import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from .supabase_client import supabase
import json

load_dotenv()

# Configure Google AI
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

print("Configuring Google AI with API key...")
genai.configure(api_key=api_key)
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
    """
    print(f"Generating recipe with ingredients: {ingredients}")
    print(f"Dietary preferences: {dietary_preferences}")
    print(f"Cooking time: {cooking_time}")
    print(f"Difficulty: {difficulty}")
    print(f"Servings: {servings}")

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
    Return a JSON object with the following structure. Make sure to use proper JSON formatting with double quotes for all keys and string values:
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
            "Step 1 description",
            "Step 2 description"
        ],
        "cooking_time": {
            "prep_time": 10,
            "cook_time": 20,
            "total_time": 30
        },
        "difficulty": "easy",
        "servings": 4
    }
    """)

    prompt = "\n".join(prompt_parts)
    print(f"Generated prompt: {prompt}")
    
    try:
        print("Calling Gemini API...")
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
        print("Received response from Gemini API")
        recipe_json = response.text
        print(f"Raw AI response: {recipe_json}")
        
        # Clean up the response to ensure it's valid JSON
        recipe_json = recipe_json.replace("```json", "").replace("```", "").strip()
        
        # Try to find the JSON object in the response
        start_idx = recipe_json.find("{")
        end_idx = recipe_json.rfind("}") + 1
        if start_idx >= 0 and end_idx > start_idx:
            recipe_json = recipe_json[start_idx:end_idx]
        
        print(f"Cleaned JSON: {recipe_json}")
        
        # Parse the JSON response
        recipe_data = json.loads(recipe_json)
        print(f"Parsed recipe data: {recipe_data}")
        
        # Validate required fields
        required_fields = ["title", "ingredients", "instructions", "cooking_time", "difficulty", "servings"]
        for field in required_fields:
            if field not in recipe_data:
                raise ValueError(f"Missing required field: {field}")
        
        return recipe_data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        print(f"Raw AI response: {recipe_json}")
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        print(f"Error in generate_recipe: {str(e)}")
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
        "user_id": user_id,
        "rating": 0,
        "total_ratings": 0
    }
    
    # Only add optional fields if they exist in the recipe data
    if "nutritional_info" in recipe_data:
        recipe["nutritional_info"] = recipe_data["nutritional_info"]
    if "tags" in recipe_data:
        recipe["tags"] = recipe_data["tags"]
    if "tips" in recipe_data:
        recipe["tips"] = recipe_data["tips"]
    
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