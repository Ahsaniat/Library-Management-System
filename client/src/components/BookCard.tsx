import { Link } from 'react-router-dom';
import { Book as BookType } from '../types';
import { Star } from 'lucide-react';
import { cn } from '../utils';

interface BookCardProps {
  book: BookType;
  className?: string;
}

export default function BookCard({ book, className }: BookCardProps) {
  const availableCopies = book.copies?.filter((c) => c.status === 'available').length ?? 0;

  return (
    <Link
      to={`/books/${book.id}`}
      className={cn(
        'block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden',
        className
      )}
    >
      <div className="aspect-[3/4] bg-gray-200 relative">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📚</span>
          </div>
        )}
        {availableCopies > 0 && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {availableCopies} available
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{book.title}</h3>
        {book.author && (
          <p className="text-sm text-gray-600 mb-2">{book.author.name}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">
              {book.averageRating > 0 ? book.averageRating.toFixed(1) : 'N/A'}
            </span>
          </div>
          {book.category && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {book.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
