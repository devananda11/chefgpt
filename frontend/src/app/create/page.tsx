'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateRecipe } from '@/lib/api';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher'
];

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function CreateRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({ name: '', amount: '', unit: '' });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  // New state for recipe parameters
  const [recipeParams, setRecipeParams] = useState({
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    difficulty: 'Medium'
  });

  const handleAddIngredient = () => {
    if (newIngredient.name.trim()) {
      setIngredients([...ingredients, { ...newIngredient }]);
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleParamChange = (field: string, value: string | number) => {
    setRecipeParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateRecipe = async () => {
    if (!user) {
      setError('Please sign in to generate recipes');
      return;
    }

    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setGeneratedRecipe(null);

      console.log('Sending ingredients:', ingredients);

      const recipe = await generateRecipe({
        ingredients: ingredients.map(i => i.name),
        dietary_preferences: selectedPreferences,
        cooking_time: recipeParams.cook_time,
        difficulty: recipeParams.difficulty.toLowerCase(),
        servings: recipeParams.servings
      });

      console.log('Generated recipe:', recipe);
      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe || !user) return;

    try {
      setIsGenerating(true);
      setError('');

      // Save the recipe to Supabase
      const { data: savedRecipe, error: saveError } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          title: generatedRecipe.title,
          description: generatedRecipe.description,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
          cooking_time: generatedRecipe.cooking_time,
          difficulty: generatedRecipe.difficulty,
          servings: generatedRecipe.servings,
          rating: 0
        }])
        .select()
        .single();

      if (saveError) {
        console.error('Error saving recipe:', saveError);
        throw new Error('Failed to save recipe');
      }

      console.log('Recipe saved successfully:', savedRecipe);
      router.push('/recipes');
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Please sign in to create recipes.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-500 mb-8">Create a New Recipe</h1>

      {!generatedRecipe ? (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Recipe Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Prep Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={recipeParams.prep_time}
                  onChange={(e) => handleParamChange('prep_time', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Cook Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={recipeParams.cook_time}
                  onChange={(e) => handleParamChange('cook_time', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Servings</label>
                <input
                  type="number"
                  min="1"
                  value={recipeParams.servings}
                  onChange={(e) => handleParamChange('servings', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Difficulty</label>
                <select
                  value={recipeParams.difficulty}
                  onChange={(e) => handleParamChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Add Ingredients</h2>
            
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Amount"
                value={newIngredient.amount}
                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                className="flex-1 p-2 border rounded-md text-gray-500"
              />
              <input
                type="text"
                placeholder="Unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="flex-1 p-2 border rounded-md text-gray-500"
              />
              <input
                type="text"
                placeholder="Ingredient name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="flex-2 p-2 border rounded-md text-gray-500"
              />
              <button
                onClick={handleAddIngredient}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {ingredients.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-500 mb-2">Added Ingredients:</h3>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-gray-500">
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </span>
                      <button
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateRecipe}
              disabled={isGenerating || ingredients.length === 0}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isGenerating || ingredients.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Recipe...
                </div>
              ) : (
                'Generate Recipe'
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">Dietary Preferences & Restrictions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {DIETARY_PREFERENCES.map((preference) => (
                <button
                  key={preference}
                  onClick={() => togglePreference(preference)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPreferences.includes(preference)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-500 mb-4">{generatedRecipe.title}</h2>
          <p className="text-gray-600 mb-4">{generatedRecipe.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Prep Time</p>
              <p className="font-semibold">{generatedRecipe.cooking_time.prep_time} mins</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Cook Time</p>
              <p className="font-semibold">{generatedRecipe.cooking_time.cook_time} mins</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="font-semibold capitalize">{generatedRecipe.difficulty}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Servings</p>
              <p className="font-semibold">{generatedRecipe.servings}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1">
              {generatedRecipe.ingredients.map((ing: any, index: number) => (
                <li key={index} className="text-gray-600">
                  {ing.amount} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2">
              {generatedRecipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="text-gray-600">{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveRecipe}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isGenerating ? 'Saving...' : 'Save Recipe'}
            </button>
            <button
              onClick={() => setGeneratedRecipe(null)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 