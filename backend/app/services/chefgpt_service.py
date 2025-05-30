from typing import List, Dict
import openai
from app.config import settings

class ChefGPTService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    async def generate_recipe(self, ingredients: List[Dict]) -> Dict:
        # Format ingredients for the prompt
        ingredients_text = "\n".join([
            f"- {ing['amount']} {ing['unit']} {ing['name']}"
            for ing in ingredients
        ])

        # Create the prompt for recipe generation
        prompt = f"""Given these ingredients:
{ingredients_text}

Generate a recipe with the following format:
Title: [Recipe Name]
Description: [Brief description of the recipe]
Instructions:
1. [Step 1]
2. [Step 2]
...
Cooking Time: [Time in minutes]
Difficulty: [Easy/Medium/Hard]

Make sure the recipe is practical and uses the given ingredients effectively."""

        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional chef who creates delicious and practical recipes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the response
        recipe_text = response.choices[0].message.content

        # Extract recipe components
        lines = recipe_text.split('\n')
        title = lines[0].replace('Title:', '').strip()
        description = lines[1].replace('Description:', '').strip()
        
        # Extract instructions
        instructions_start = recipe_text.find('Instructions:') + len('Instructions:')
        instructions_end = recipe_text.find('Cooking Time:')
        instructions_text = recipe_text[instructions_start:instructions_end].strip()
        instructions = [
            line.strip().lstrip('123456789.- ')
            for line in instructions_text.split('\n')
            if line.strip() and not line.strip().startswith('Instructions:')
        ]

        # Extract cooking time and difficulty
        cooking_time_line = next(line for line in lines if 'Cooking Time:' in line)
        difficulty_line = next(line for line in lines if 'Difficulty:' in line)
        
        cooking_time = int(cooking_time_line.replace('Cooking Time:', '').replace('minutes', '').strip())
        difficulty = difficulty_line.replace('Difficulty:', '').strip()

        return {
            "title": title,
            "description": description,
            "instructions": instructions,
            "cooking_time": cooking_time,
            "difficulty": difficulty
        } 