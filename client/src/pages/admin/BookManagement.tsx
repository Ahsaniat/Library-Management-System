import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import api from '../../services/api';
import { Button, Input, LoadingSpinner } from '../../components';
import { Book } from '../../types';

interface BooksResponse {
  success: boolean;
  data: {
    data: Book[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

interface OpenLibraryBook {
  isbn: string;
  title: string;
  subtitle?: string;
  authorName?: string;
  publisherName?: string;
  publishedYear?: number;
  pageCount?: number;
  coverImage?: string;
  description?: string;
  categories?: string[];
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

interface EditBookData {
  title?: string;
  subtitle?: string;
  description?: string;
  publishedYear?: number;
  pageCount?: number;
  language?: string;
  numberOfCopies?: number;
}

function useAdminBooks(params: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: ['admin', 'books', params],
    queryFn: async () => {
      const response = await api.get<BooksResponse>('/books', { params });
      return response.data.data;
    },
  });
}

export default function BookManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editData, setEditData] = useState<EditBookData>({});
  const [isbnLookup, setIsbnLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<OpenLibraryBook | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminBooks({ page, limit: 20, q: search || undefined });

  const createBook = useMutation({
    mutationFn: async (bookData: Partial<Book> & { numberOfCopies?: number }) => {
      await api.post('/books', bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowAddModal(false);
      setLookupResult(null);
      setIsbnLookup('');
      setNumberOfCopies(1);
    },
  });

  const updateBook = useMutation({
    mutationFn: async ({ bookId, data }: { bookId: string; data: EditBookData }) => {
      await api.put(`/books/${bookId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowEditModal(false);
      setEditingBook(null);
      setEditData({});
    },
  });

  const deleteBook = useMutation({
    mutationFn: async (bookId: string) => {
      await api.delete(`/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const handleIsbnLookup = async () => {
    if (!isbnLookup.trim()) return;
    setLookupLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: { book: OpenLibraryBook; source: string } }>(
        `/books/isbn/${isbnLookup.trim()}`
      );
      if (response.data.success && response.data.data) {
        setLookupResult(response.data.data.book);
      }
    } catch {
      alert('Book not found in database or Open Library');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddBook = () => {
    if (!lookupResult) return;
    createBook.mutate({
      isbn: lookupResult.isbn,
      title: lookupResult.title,
      subtitle: lookupResult.subtitle,
      description: lookupResult.description,
      publishedYear: lookupResult.publishedYear,
      pageCount: lookupResult.pageCount,
      coverImage: lookupResult.coverImage,
      language: lookupResult.language,
      numberOfCopies,
      averageRating: lookupResult.averageRating || 0,
      totalRatings: lookupResult.ratingsCount || 0,
    } as Partial<Book> & { numberOfCopies: number; averageRating?: number; totalRatings?: number });
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setEditData({
      title: book.title,
      subtitle: book.subtitle,
      description: book.description,
      publishedYear: book.publishedYear,
      pageCount: book.pageCount,
      language: book.language,
      numberOfCopies: book.copies?.length ?? 0,
    });
    setShowEditModal(true);
  };

  const handleUpdateBook = () => {
    if (!editingBook) return;
    updateBook.mutate({ bookId: editingBook.id, data: editData });
  };

  const getAvailabilityStatus = (book: Book) => {
    const copies = book.copies ?? [];
    const available = copies.filter(c => c.status === 'available').length;
    if (copies.length === 0) return 'No Copies';
    if (available === 0) return 'All Out';
    return `${available}/${copies.length}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>Book Management</h1>
          <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Manage library book catalog</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--ink-secondary)' }} />
          <Input
            placeholder="Search by title, ISBN, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--ink-secondary)' }}>
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No books found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
              {data.data.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-10 flex-shrink-0 rounded overflow-hidden" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center" style={{ color: 'var(--ink-secondary)' }}>
                            📚
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium line-clamp-1" style={{ color: 'var(--ink-primary)' }}>
                          {book.title}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                          {book.author?.name ?? 'Unknown author'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
                      {book.category?.name ?? 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
                      {getAvailabilityStatus(book)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEdit(book)}
                      className="mr-3 hover:opacity-70"
                      style={{ color: 'var(--accent-warm)' }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this book?')) {
                          deleteBook.mutate(book.id);
                        }
                      }}
                      className="hover:opacity-70"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t" style={{ backgroundColor: 'var(--parchment-dark)', borderColor: 'var(--parchment-border)' }}>
            <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Add New Book</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                ISBN Lookup
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ISBN to auto-fill from OpenLibrary"
                  value={isbnLookup}
                  onChange={(e) => setIsbnLookup(e.target.value)}
                />
                <Button onClick={handleIsbnLookup} isLoading={lookupLoading}>
                  Lookup
                </Button>
              </div>
            </div>

            {lookupResult && (
              <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                <div className="flex gap-4">
                  {lookupResult.coverImage && (
                    <img
                      src={lookupResult.coverImage}
                      alt={lookupResult.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{lookupResult.title}</h3>
                    {lookupResult.subtitle && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{lookupResult.subtitle}</p>
                    )}
                    {lookupResult.authorName && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>by {lookupResult.authorName}</p>
                    )}
                    {lookupResult.publishedYear && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{lookupResult.publishedYear}</p>
                    )}
                    {lookupResult.publisherName && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Publisher: {lookupResult.publisherName}</p>
                    )}
                    {lookupResult.pageCount && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{lookupResult.pageCount} pages</p>
                    )}
                    {lookupResult.categories && lookupResult.categories.length > 0 && (
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Categories: {lookupResult.categories.slice(0, 3).join(', ')}</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>ISBN: {lookupResult.isbn}</p>
                  </div>
                </div>
                {lookupResult.description && (
                  <p className="text-sm mt-3 line-clamp-3" style={{ color: 'var(--ink-secondary)' }}>
                    {lookupResult.description}
                  </p>
                )}
              </div>
            )}

            {lookupResult && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Number of Copies
                </label>
                <Input
                  type="number"
                  min="1"
                  value={numberOfCopies}
                  onChange={(e) => setNumberOfCopies(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setLookupResult(null);
                  setIsbnLookup('');
                  setNumberOfCopies(1);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBook}
                disabled={!lookupResult}
                isLoading={createBook.isPending}
              >
                Add Book
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Edit Book</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Title</label>
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Subtitle</label>
                <Input
                  value={editData.subtitle || ''}
                  onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
                  rows={4}
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Published Year</label>
                  <Input
                    type="number"
                    value={editData.publishedYear || ''}
                    onChange={(e) => setEditData({ ...editData, publishedYear: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Page Count</label>
                  <Input
                    type="number"
                    value={editData.pageCount || ''}
                    onChange={(e) => setEditData({ ...editData, pageCount: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Language</label>
                <Input
                  value={editData.language || ''}
                  onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Number of Copies (current: {editingBook.copies?.length ?? 0})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editData.numberOfCopies ?? editingBook.copies?.length ?? 0}
                  onChange={(e) => setEditData({ ...editData, numberOfCopies: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBook(null);
                  setEditData({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBook}
                isLoading={updateBook.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
