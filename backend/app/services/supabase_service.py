from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class SupabaseService:
    @staticmethod
    async def create_recipe(recipe_data: dict):
        response = supabase.from_("recipes").insert(recipe_data).execute()
        return response

    @staticmethod
    async def get_user_recipes(user_id: str):
        response = supabase.from_("recipes").select("*").eq("user_id", user_id).execute()
        return response

    @staticmethod
    async def update_recipe_rating(recipe_id: str, rating: float):
        response = supabase.from_("recipes").update({"rating": rating}).eq("id", recipe_id).execute()
        return response 