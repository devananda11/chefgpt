'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: any[];
  instructions: string[];
  cooking_time: {
    prep_time: number;
    cook_time: number;
    total_time: number;
  };
  difficulty: string;
  servings: number;
  rating: number;
  created_at: string;
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setRecipe(data);
        setRating(data.rating);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [user, params.id]);

  const handleRate = async (newRating: number) => {
    if (!recipe || !user) return;

    try {
      setIsRating(true);
      const { error } = await supabase
        .from('recipes')
        .update({ rating: newRating })
        .eq('id', recipe.id);

      if (error) throw error;
      setRating(newRating);
    } catch (err) {
      console.error('Error rating recipe:', err);
      setError('Failed to rate recipe');
    } finally {
      setIsRating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Please sign in to view recipes.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || 'Recipe not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-500 mb-2">{recipe.title}</h1>
          <p className="text-gray-600">{recipe.description}</p>
        </div>
        <button
          onClick={() => router.push('/recipes')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Recipes
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Prep Time</p>
          <p className="text-xl font-semibold">{recipe.cooking_time.prep_time} mins</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Cook Time</p>
          <p className="text-xl font-semibold">{recipe.cooking_time.cook_time} mins</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Difficulty</p>
          <p className="text-xl font-semibold capitalize">{recipe.difficulty}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Servings</p>
          <p className="text-xl font-semibold">{recipe.servings}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-500 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-500 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-500 mb-4">Rate this Recipe</h2>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              disabled={isRating}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-gray-500">
            {rating > 0 ? `(${rating.toFixed(1)} stars)` : 'Not rated yet'}
          </span>
        </div>
      </div>
    </div>
  );
} 