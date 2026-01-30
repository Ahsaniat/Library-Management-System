import { useParams } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import { useBook, useCreateReservation } from '../hooks';
import { LoadingSpinner, Button } from '../components';
import { useAuthStore } from '../store';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id!);
  const createReservation = useCreateReservation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const availableCopies = book?.copies?.filter((c) => c.status === 'available').length ?? 0;

  const handleReserve = async () => {
    if (!book) return;
    try {
      await createReservation.mutateAsync(book.id);
      alert('Reservation created successfully!');
    } catch {
      alert('Failed to create reservation. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
        <p className="text-gray-600">The book you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-6xl">📚</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          {book.subtitle && (
            <p className="text-xl text-gray-600 mb-4">{book.subtitle}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            {book.author && (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5" />
                <span>{book.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">
                {book.averageRating > 0 ? book.averageRating.toFixed(1) : 'No ratings'}
              </span>
              {book.totalRatings > 0 && (
                <span className="text-gray-500">({book.totalRatings} reviews)</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">ISBN</p>
              <p className="font-medium">{book.isbn}</p>
            </div>
            {book.publishedYear && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Published</p>
                <p className="font-medium">{book.publishedYear}</p>
              </div>
            )}
            {book.category && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{book.category.name}</p>
              </div>
            )}
            {book.pageCount && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pages</p>
                <p className="font-medium">{book.pageCount}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {book.description || 'No description available.'}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Availability</p>
                <p className="text-blue-700">
                  {availableCopies > 0
                    ? `${availableCopies} copies available`
                    : 'No copies available'}
                </p>
              </div>
              {isAuthenticated && availableCopies === 0 && (
                <Button
                  onClick={handleReserve}
                  isLoading={createReservation.isPending}
                >
                  Reserve
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
