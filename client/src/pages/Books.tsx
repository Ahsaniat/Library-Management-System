import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useBooks } from '../hooks';
import { BookCard, LoadingSpinner, Button, Input } from '../components';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const params = {
    q: searchParams.get('q') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    category: searchParams.get('category') || undefined,
    available: searchParams.get('available') === 'true',
  };

  const { data, isLoading, error } = useBooks(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchQuery) {
        prev.set('q', searchQuery);
      } else {
        prev.delete('q');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', page.toString());
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Catalog</h1>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline">
            <Filter className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">Failed to load books. Please try again.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No books found matching your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.data.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={!data.pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={!data.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
