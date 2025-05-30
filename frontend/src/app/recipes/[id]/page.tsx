'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  cooking_time: number;
  difficulty: string;
  rating: number;
  user_id: string;
  created_at: string;
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setRecipe(data);

        // Check if recipe is saved by current user
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_recipes')
            .select('*')
            .eq('recipe_id', id)
            .eq('user_id', user.id)
            .single();

          setIsSaved(!!savedData);
        }
      } catch (err) {
        setError('Failed to load recipe');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user]);

  const handleSaveRecipe = async () => {
    if (!user) return;

    try {
      if (isSaved) {
        await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('saved_recipes')
          .insert([
            {
              recipe_id: id,
              user_id: user.id,
              saved_at: new Date().toISOString(),
            },
          ]);
      }

      setIsSaved(!isSaved);
    } catch (err) {
      setError('Failed to update saved status');
    }
  };

  const handleRateRecipe = async (rating: number) => {
    if (!user || !recipe) return;

    try {
      // Update the recipe's rating
      const { error } = await supabase
        .from('recipes')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;

      setRecipe({ ...recipe, rating });
      setUserRating(rating);
    } catch (err) {
      setError('Failed to update rating');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Recipe not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-700">{recipe.description}</p>
          </div>
          {user && (
            <button
              onClick={handleSaveRecipe}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
            >
              <svg
                className={`w-6 h-6 ${isSaved ? 'text-red-600' : 'text-gray-400'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">
                  <span className="font-medium text-gray-900">{index + 1}.</span> {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-500 mb-2">Rate this Recipe</h2>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRateRecipe(rating)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        rating <= (userRating || recipe.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Cooking Time</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.cooking_time} minutes</div>
              <div className="text-sm text-gray-500 mt-2">Difficulty</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.difficulty}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 