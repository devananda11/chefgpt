from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# SQL to create the recipes table
CREATE_RECIPES_TABLE = """
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL,
    instructions JSONB NOT NULL,
    cooking_time JSONB NOT NULL,
    difficulty TEXT NOT NULL,
    servings INTEGER NOT NULL,
    nutritional_info JSONB,
    tags TEXT[],
    tips TEXT[],
    user_id TEXT NOT NULL,
    rating FLOAT DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- Create index on rating for sorting
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(rating);

-- Create index on difficulty for filtering
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
"""

def init_db():
    """Initialize the database with required tables."""
    try:
        # Execute the SQL to create the table
        supabase.table("recipes").select("*").limit(1).execute()
        print("Recipes table already exists")
    except Exception as e:
        if "does not exist" in str(e):
            # If the table doesn't exist, create it
            supabase.rpc('exec_sql', {'sql': CREATE_RECIPES_TABLE}).execute()
            print("Created recipes table")
        else:
            raise e

# Initialize the database when the module is imported
init_db() 