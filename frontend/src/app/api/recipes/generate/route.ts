import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Log Supabase configuration
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RecipeResponse {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  cooking_time: {
    prep_time: number;
    cook_time: number;
    total_time: number;
  };
  difficulty: string;
  servings: number;
}

export async function POST(request: Request) {
  try {
    // Get the session from the request
    const cookieStore = await cookies();
    const supabaseCookie = cookieStore.get('sb-auth-token') || cookieStore.get('supabase-auth-token');
    
    console.log('Available cookies:', cookieStore.getAll().map(c => c.name));
    
    let accessToken: string | undefined;

    if (supabaseCookie) {
      try {
        const cookieValue = JSON.parse(decodeURIComponent(supabaseCookie.value));
        accessToken = cookieValue.access_token;
      } catch (e) {
        console.error('Error parsing cookie value:', e);
      }
    }

    // If no access token in cookie, try to get it from the request body
    if (!accessToken) {
      const body = await request.json();
      accessToken = body.access_token;
    }

    if (!accessToken) {
      console.error('No access token found');
      return NextResponse.json(
        { error: 'Authentication required - No access token found' },
        { status: 401 }
      );
    }

    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        { error: 'Invalid authentication - User not found' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      );
    }

    console.log('Sending request to backend with ingredients:', ingredients);

    // Call the backend to generate the recipe
    const response = await fetch(`${BACKEND_URL}/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        ingredients: ingredients.map(i => i.name),
        user_id: user.id,
        dietary_preferences: body.dietary_preferences || [],
        cooking_time: body.cooking_time || 30,
        difficulty: body.difficulty || 'medium',
        servings: body.servings || 4
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to generate recipe' },
        { status: response.status }
      );
    }

    const recipe: RecipeResponse = await response.json();
    console.log('Generated recipe:', recipe);

    // Format the recipe data according to our schema
    const recipeData = {
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount || '',
        unit: ing.unit || ''
      })),
      instructions: recipe.instructions,
      cooking_time: {
        prep_time: recipe.cooking_time?.prep_time || 0,
        cook_time: recipe.cooking_time?.cook_time || 0,
        total_time: recipe.cooking_time?.total_time || 0
      },
      difficulty: recipe.difficulty || 'medium',
      servings: recipe.servings || 4,
      rating: 0
    };

    console.log('Saving recipe to database:', recipeData);

    // Save the recipe to Supabase
    const { data: savedRecipe, error: saveError } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single();

    if (saveError) {
      console.error('Supabase error:', saveError);
      return NextResponse.json(
        { error: 'Failed to save recipe' },
        { status: 500 }
      );
    }

    console.log('Recipe saved successfully:', savedRecipe);

    return NextResponse.json(savedRecipe);
  } catch (error) {
    console.error('Error in recipe generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 