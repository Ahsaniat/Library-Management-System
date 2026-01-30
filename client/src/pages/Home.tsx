import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, Users } from 'lucide-react';
import { usePopularBooks, useRecentBooks } from '../hooks';
import { BookCard, LoadingSpinner, Button } from '../components';

export default function Home() {
  const { data: popularBooks, isLoading: loadingPopular } = usePopularBooks(4);
  const { data: recentBooks, isLoading: loadingRecent } = useRecentBooks(4);

  return (
    <div>
    
      <section className="text-black py-20" style={{ backgroundColor: 'var(--parchment-dark)', border: '1px solid var(--parchment-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" >
              Welcome to the Library Management System
            </h1>
            <p className="text-xl text-black-100 mb-8 max-w-2xl mx-auto">
              Discover thousands of books, manage your loans, and reserve your favorite titles.
              Your gateway to knowledge starts here.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/books">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Browse Catalog
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">Access thousands of books across various genres</p>
            </div>
            <div className="text-center p-6">
              <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600">Find books quickly with advanced search filters</p>
            </div>
            <div className="text-center p-6">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Reservations</h3>
              <p className="text-gray-600">Reserve books online and pick up at your convenience</p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Member Benefits</h3>
              <p className="text-gray-600">Enjoy exclusive features as a registered member</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Books</h2>
            <Link to="/books?sort=popular" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {loadingPopular ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {popularBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
            <Link to="/books?sort=recent" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {loadingRecent ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recentBooks?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
