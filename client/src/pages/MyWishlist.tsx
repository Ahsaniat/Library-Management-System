import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, AlertCircle, Check } from 'lucide-react';
import { useMyWishlist, useRemoveFromWishlist } from '../hooks';
import { LoadingSpinner, Button } from '../components';

export default function MyWishlist() {
  const { data: items, isLoading, refetch } = useMyWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRemove = async (bookId: string) => {
    try {
      await removeFromWishlist.mutateAsync(bookId);
      setSuccessMessage('Book removed from wishlist');
      setErrorMessage(null);
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage('Failed to remove book from wishlist');
      setSuccessMessage(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8" style={{ color: 'var(--accent-warm)' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>My Wishlist</h1>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
          <p style={{ color: '#22c55e' }}>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444' }}>{errorMessage}</p>
        </div>
      )}

      {!items || items.length === 0 ? (
        <div className="text-center py-20 rounded-lg shadow" style={{ backgroundColor: 'var(--parchment-light)' }}>
          <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--ink-secondary)' }} />
          <p className="text-lg mb-4" style={{ color: 'var(--ink-secondary)' }}>Your wishlist is empty.</p>
          <Link to="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: 'var(--parchment-light)' }}
            >
              <div className="flex">
                <div className="w-24 h-32 flex-shrink-0" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                  {item.book?.coverImage ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <Link 
                    to={`/books/${item.bookId}`}
                    className="font-semibold hover:underline line-clamp-2"
                    style={{ color: 'var(--ink-primary)' }}
                  >
                    {item.book?.title || 'Unknown Book'}
                  </Link>
                  {item.book?.author && (
                    <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
                      by {item.book.author.name}
                    </p>
                  )}
                  {item.book?.category && (
                    <span 
                      className="inline-block mt-2 px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-secondary)' }}
                    >
                      {item.book.category.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--parchment-border)' }}>
                <Link to={`/books/${item.bookId}`}>
                  <Button size="sm">View Details</Button>
                </Link>
                <button
                  onClick={() => handleRemove(item.bookId)}
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--ink-secondary)' }}
                  disabled={removeFromWishlist.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
