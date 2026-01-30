import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useBooks } from '../hooks';
import { BookCard, LoadingSpinner, Button, Input } from '../components';

interface FilterState {
  category: string;
  year: string;
  language: string;
  available: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    year: searchParams.get('year') || '',
    language: searchParams.get('language') || '',
    available: searchParams.get('available') === 'true',
    sortBy: searchParams.get('sortBy') || 'title',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  });

  const params = {
    q: searchParams.get('q') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    category: searchParams.get('category') || undefined,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    language: searchParams.get('language') || undefined,
    available: searchParams.get('available') === 'true',
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
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

  const applyFilters = () => {
    setSearchParams((prev) => {
      if (filters.category) prev.set('category', filters.category);
      else prev.delete('category');
      
      if (filters.year) prev.set('year', filters.year);
      else prev.delete('year');
      
      if (filters.language) prev.set('language', filters.language);
      else prev.delete('language');
      
      if (filters.available) prev.set('available', 'true');
      else prev.delete('available');
      
      if (filters.sortBy !== 'title') prev.set('sortBy', filters.sortBy);
      else prev.delete('sortBy');
      
      if (filters.sortOrder !== 'asc') prev.set('sortOrder', filters.sortOrder);
      else prev.delete('sortOrder');
      
      prev.set('page', '1');
      return prev;
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      year: '',
      language: '',
      available: false,
      sortBy: 'title',
      sortOrder: 'asc',
    });
    setSearchParams((prev) => {
      prev.delete('category');
      prev.delete('year');
      prev.delete('language');
      prev.delete('available');
      prev.delete('sortBy');
      prev.delete('sortOrder');
      prev.set('page', '1');
      return prev;
    });
    setShowFilters(false);
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', page.toString());
      return prev;
    });
  };

  const hasActiveFilters = filters.category || filters.year || filters.language || filters.available || filters.sortBy !== 'title' || filters.sortOrder !== 'asc';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--ink-primary)' }}>Book Catalog</h1>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--ink-secondary)' }} />
            <Input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button 
            type="button" 
            variant={hasActiveFilters ? 'primary' : 'outline'} 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
            {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white text-gray-900">!</span>}
          </Button>
        </form>
      </div>

      {showFilters && (
        <div className="mb-6 p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Filter & Sort</h3>
            <button onClick={() => setShowFilters(false)} style={{ color: 'var(--ink-secondary)' }}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Category
              </label>
              <Input
                placeholder="e.g., Fiction, Science"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Published Year
              </label>
              <Input
                type="number"
                placeholder="e.g., 2020"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
              >
                <option value="title">Title</option>
                <option value="publishedYear">Published Year</option>
                <option value="averageRating">Rating</option>
                <option value="totalRatings">Popularity</option>
                <option value="createdAt">Recently Added</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available}
                onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                className="rounded"
              />
              <span style={{ color: 'var(--ink-secondary)' }}>Available Only</span>
            </label>
            <label className="flex items-center gap-2">
              <span style={{ color: 'var(--ink-secondary)' }}>Order:</span>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-1 border rounded"
                style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>Clear All</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">Failed to load books. Please try again.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--ink-secondary)' }}>No books found matching your search.</p>
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
              <span className="flex items-center px-4" style={{ color: 'var(--ink-secondary)' }}>
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
