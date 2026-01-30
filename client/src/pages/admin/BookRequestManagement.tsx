import { useState } from 'react';
import { BookPlus, Check, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAllBookRequests, useProcessBookRequest } from '../../hooks';
import { Button, Input, LoadingSpinner } from '../../components';

export default function BookRequestManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: requests, isLoading, refetch } = useAllBookRequests(statusFilter || undefined);
  const processRequest = useProcessBookRequest();
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcess = async (id: string, status: 'approved' | 'rejected' | 'acquired') => {
    try {
      await processRequest.mutateAsync({ id, status, adminNotes });
      setSuccessMessage(`Request ${status} successfully`);
      setErrorMessage(null);
      setProcessingId(null);
      setAdminNotes('');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process request';
      setErrorMessage(message);
      setSuccessMessage(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
            Book Request Management
          </h1>
          <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">
            Review and manage user book requests
          </p>
        </div>
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

      <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
        >
          <option value="">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="acquired">Acquired</option>
        </select>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : !requests || requests.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--ink-secondary)' }}>
            <BookPlus className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No book requests found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Date
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
                      {request.reason && (
                        <p className="text-xs mt-1 italic" style={{ color: 'var(--ink-secondary)' }}>
                          "{request.reason}"
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {request.userId}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {request.status === 'pending' && (
                      processingId === request.id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Admin notes (optional)"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleProcess(request.id, 'approved')}
                              isLoading={processRequest.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleProcess(request.id, 'rejected')}
                              isLoading={processRequest.isPending}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProcessingId(null);
                                setAdminNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setProcessingId(request.id)}
                        >
                          Process
                        </Button>
                      )
                    )}
                    {request.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleProcess(request.id, 'acquired')}
                        isLoading={processRequest.isPending}
                      >
                        Mark Acquired
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
