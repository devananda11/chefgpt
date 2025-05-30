'use client';

import { useRouter } from 'next/navigation';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface CookingTime {
  cook_time: number;
  prep_time: number;
  total_time: number;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cooking_time: CookingTime;
  difficulty: string;
  servings: number;
  rating: number;
  created_at: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: () => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const router = useRouter();

  const handleGenerateAnother = () => {
    router.push('/create');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-500">{recipe.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{recipe.difficulty}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{recipe.cooking_time.total_time} mins</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{recipe.description}</p>

        <div className="mb-4">
          <h4 className="font-medium text-gray-500 mb-2">Ingredients:</h4>
          <ul className="list-disc list-inside text-gray-600">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-500 mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside text-gray-600">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="mb-2">{instruction}</li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="space-y-1">
            <div>Prep Time: {recipe.cooking_time.prep_time} mins</div>
            <div>Cook Time: {recipe.cooking_time.cook_time} mins</div>
            <div>Total Time: {recipe.cooking_time.total_time} mins</div>
          </div>
          <div className="space-y-1">
            <div>Servings: {recipe.servings}</div>
            <div>Rating: {recipe.rating}/5</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 px-4 py-2 rounded-md font-medium"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleGenerateAnother}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Generate Another Recipe
          </button>
        </div>
      </div>
    </div>
  );
} 