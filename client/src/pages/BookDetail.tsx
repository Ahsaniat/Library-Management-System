import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, HeartOff, BookOpen, Clock, Check, AlertCircle } from 'lucide-react';
import { useBook, useCreateReservation, useSelfCheckout, useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from '../hooks';
import { LoadingSpinner, Button } from '../components';
import { useAuthStore } from '../store';
import { UserRole } from '../types';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error, refetch } = useBook(id!);
  const createReservation = useCreateReservation();
  const selfCheckout = useSelfCheckout();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: inWishlist, refetch: refetchWishlist } = useIsInWishlist(id!);
  const { isAuthenticated, user } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableCopies = book?.copies?.filter((c) => c.status === 'available').length ?? 0;
  const totalCopies = book?.copies?.length ?? 0;
  const isMember = user?.role === UserRole.MEMBER;

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleBorrow = async () => {
    if (!book) return;
    try {
      await selfCheckout.mutateAsync(book.id);
      setSuccessMessage('Book borrowed successfully! Check your loans for details.');
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to borrow book. Please try again.';
      setErrorMessage(message);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!book) return;
    try {
      await createReservation.mutateAsync(book.id);
      setSuccessMessage('You have been added to the waitlist. We\'ll notify you when the book is available.');
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.';
      setErrorMessage(message);
    }
  };

  const handleToggleWishlist = async () => {
    if (!book) return;
    try {
      if (inWishlist) {
        await removeFromWishlist.mutateAsync(book.id);
        setSuccessMessage('Book removed from wishlist.');
      } else {
        await addToWishlist.mutateAsync({ bookId: book.id });
        setSuccessMessage('Book added to wishlist.');
      }
      refetchWishlist();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update wishlist.';
      setErrorMessage(message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink-primary)' }}>Book Not Found</h1>
        <p style={{ color: 'var(--ink-secondary)' }}>The book you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getAvailabilityStatus = () => {
    if (totalCopies === 0) return { text: 'Not Available', color: 'var(--ink-secondary)', icon: AlertCircle };
    if (availableCopies === 0) return { text: 'All Checked Out', color: 'var(--accent-warm)', icon: Clock };
    return { text: 'Available', color: 'var(--accent-success, #22c55e)', icon: Check };
  };

  const status = getAvailabilityStatus();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--parchment-dark)' }}>
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-secondary)' }}>
                <span className="text-6xl">📚</span>
              </div>
            )}
          </div>
          
          {isAuthenticated && isMember && (
            <button
              onClick={handleToggleWishlist}
              disabled={addToWishlist.isPending || removeFromWishlist.isPending}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors hover:opacity-80"
              style={{ 
                borderColor: 'var(--parchment-border)',
                backgroundColor: inWishlist ? 'var(--accent-warm)' : 'var(--parchment-light)',
                color: inWishlist ? 'white' : 'var(--ink-primary)'
              }}
            >
              {inWishlist ? <HeartOff className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          )}
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-primary)' }}>{book.title}</h1>
          {book.subtitle && (
            <p className="text-xl mb-4" style={{ color: 'var(--ink-secondary)' }}>{book.subtitle}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            {book.author && (
              <div className="flex items-center gap-2" style={{ color: 'var(--ink-secondary)' }}>
                <span>by {book.author.name}</span>
              </div>
            )}
            {book.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                  {book.averageRating.toFixed(1)} ★
                </span>
                {book.totalRatings > 0 && (
                  <span style={{ color: 'var(--ink-secondary)' }}>({book.totalRatings} reviews)</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>ISBN</p>
              <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{book.isbn}</p>
            </div>
            {book.publishedYear && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Published</p>
                <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{book.publishedYear}</p>
              </div>
            )}
            {book.category && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Category</p>
                <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{book.category.name}</p>
              </div>
            )}
            {book.pageCount && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Pages</p>
                <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{book.pageCount}</p>
              </div>
            )}
            {book.language && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Language</p>
                <p className="font-medium capitalize" style={{ color: 'var(--ink-primary)' }}>{book.language}</p>
              </div>
            )}
            {book.publisher && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Publisher</p>
                <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{book.publisher.name}</p>
              </div>
            )}
          </div>

          {book.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>Description</h2>
              <p className="leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                {book.description}
              </p>
            </div>
          )}

          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>Availability</p>
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: status.color }}>
                    <StatusIcon className="h-3 w-3" />
                    {status.text}
                  </span>
                </div>
                <p style={{ color: 'var(--ink-secondary)' }}>
                  {availableCopies} of {totalCopies} copies available
                </p>
              </div>
              {isAuthenticated && isMember && (
                <div className="flex gap-2 flex-wrap">
                  {availableCopies > 0 ? (
                    <Button 
                      onClick={handleBorrow} 
                      isLoading={selfCheckout.isPending}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Borrow Now
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinWaitlist}
                      isLoading={createReservation.isPending}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Join Waitlist
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
              <p style={{ color: 'var(--ink-secondary)' }}>
                Please <a href="/login" className="underline" style={{ color: 'var(--accent-warm)' }}>login</a> to borrow this book.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
