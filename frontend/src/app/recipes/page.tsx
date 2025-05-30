'use client';

import { useState } from 'react';
import RecipeCard from '@/components/RecipeCard';

// Temporary mock data
const mockRecipes = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'A simple yet delicious pizza with fresh tomatoes, mozzarella, and basil.',
    imageUrl: '/images/recipes/margherita-pizza.jpg',
    cookingTime: 30,
    difficulty: 'Easy' as const,
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Chicken Tikka Masala',
    description: 'Creamy curry dish with tender chicken pieces in a spiced tomato sauce.',
    imageUrl: '/images/recipes/chicken-tikka.jpg',
    cookingTime: 45,
    difficulty: 'Medium' as const,
    rating: 4.8,
  },
  // Add more mock recipes as needed
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');

  const filteredRecipes = mockRecipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const matchesTime = selectedTime === 'all' || 
      (selectedTime === 'quick' && recipe.cookingTime <= 30) ||
      (selectedTime === 'medium' && recipe.cookingTime > 30 && recipe.cookingTime <= 60) ||
      (selectedTime === 'long' && recipe.cookingTime > 60);
    
    return matchesSearch && matchesDifficulty && matchesTime;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Any Time</option>
              <option value="quick">Quick (≤ 30 min)</option>
              <option value="medium">Medium (30-60 min)</option>
              <option value="long">Long (> 60 min)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recipes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
} 