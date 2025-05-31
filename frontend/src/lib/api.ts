const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateRecipe(data: {
  ingredients: string[];
  dietary_preferences?: string[];
  cooking_time?: number;
  difficulty?: string;
  servings?: number;
}) {
  const response = await fetch(`${API_URL}/recipes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to generate recipe: ${errorData}`);
  }

  return response.json();
}

export async function getUserRecipes(userId: string) {
  const response = await fetch(`${API_URL}/recipes/${userId}`);

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch recipes: ${errorData}`);
  }

  return response.json();
}

export async function rateRecipe(recipeId: string, rating: number) {
  const response = await fetch(`${API_URL}/recipes/${recipeId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to rate recipe: ${errorData}`);
  }

  return response.json();
} 