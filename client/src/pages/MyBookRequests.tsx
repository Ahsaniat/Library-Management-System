import { useState } from 'react';
import { BookPlus, Check, AlertCircle, Clock, X, CheckCircle } from 'lucide-react';
import { useMyBookRequests, useCreateBookRequest, useCancelBookRequest } from '../hooks';
import { LoadingSpinner, Button, Input } from '../components';
import { CreateBookRequestData } from '../services/bookRequestService';

export default function MyBookRequests() {
  const { data: requests, isLoading, refetch } = useMyBookRequests();
  const createRequest = useCreateBookRequest();
  const cancelRequest = useCancelBookRequest();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateBookRequestData>({
    title: '',
    author: '',
    isbn: '',
    reason: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrorMessage('Book title is required');
      return;
    }

    try {
      await createRequest.mutateAsync(formData);
      setSuccessMessage('Book request submitted successfully!');
      setErrorMessage(null);
      setFormData({ title: '', author: '', isbn: '', reason: '' });
      setShowForm(false);
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit request';
      setErrorMessage(message);
      setSuccessMessage(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync(id);
      setSuccessMessage('Request cancelled');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage('Failed to cancel request');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'rgba(234, 179, 8, 0.1)', text: '#ca8a04', icon: <Clock className="h-3 w-3" /> },
      approved: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: <X className="h-3 w-3" /> },
      acquired: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', icon: <Check className="h-3 w-3" /> },
    };
    const style = styles[status] || styles.pending;
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full capitalize"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.icon}
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BookPlus className="h-8 w-8" style={{ color: 'var(--accent-warm)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
            Request New Books
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <BookPlus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
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

      {showForm && (
        <div className="mb-8 p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>
            Request a New Book
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Book Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter book title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                ISBN (if known)
              </label>
              <Input
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="Enter ISBN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Reason for Request
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Why would you like this book in our library?"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createRequest.isPending}>
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      )}

      {!requests || requests.length === 0 ? (
        <div className="text-center py-20 rounded-lg shadow" style={{ backgroundColor: 'var(--parchment-light)' }}>
          <BookPlus className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--ink-secondary)' }} />
          <p className="text-lg mb-4" style={{ color: 'var(--ink-secondary)' }}>
            You haven't requested any books yet.
          </p>
          <Button onClick={() => setShowForm(true)}>Request a Book</Button>
        </div>
      ) : (
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Requested On
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
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{request.title}</p>
                      {request.author && (
                        <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>by {request.author}</p>
                      )}
                      {request.isbn && (
                        <p className="text-xs" style={{ color: 'var(--ink-secondary)' }}>ISBN: {request.isbn}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(request.status)}
                    {request.adminNotes && (
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
                        {request.adminNotes}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancel(request.id)}
                        isLoading={cancelRequest.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
