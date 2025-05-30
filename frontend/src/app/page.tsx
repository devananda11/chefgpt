import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray">
          Discover Your Next
          <span className="text-blue-600"> Perfect Recipe</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get personalized recipe suggestions powered by AI. Save your favorites, rate them, and share with friends.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/recipes"
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-500">AI-Powered Suggestions</h3>
          <p className="text-gray-500">
            Get personalized recipe recommendations based on your preferences and dietary restrictions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-500">Save & Organize</h3>
          <p className="text-gray-500">
            Keep track of your favorite recipes and organize them into custom collections.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-500">Share & Connect</h3>
          <p className="text-gray-500">
            Share your favorite recipes with friends and connect with other food enthusiasts.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Cooking?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of food lovers who are discovering new recipes every day.
        </p>
        <Link
          href="/login"
          className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
