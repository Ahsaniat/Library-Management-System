import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Button, Input, LoadingSpinner } from '../../components';
import { Loan } from '../../types';

interface LoansResponse {
  success: boolean;
  data: {
    loans: Loan[];
  };
}

interface CheckoutData {
  bookCopyId: string;
  userId: string;
}

function useOverdueLoans() {
  return useQuery({
    queryKey: ['admin', 'loans', 'overdue'],
    queryFn: async () => {
      const response = await api.get<LoansResponse>('/loans/overdue');
      return response.data.data?.loans || [];
    },
  });
}

export default function LoanManagement() {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({ bookCopyId: '', userId: '' });
  const [checkinBarcode, setCheckinBarcode] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: overdueLoans, isLoading, error } = useOverdueLoans();

  const checkout = useMutation({
    mutationFn: async (data: CheckoutData) => {
      await api.post('/loans/checkout', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowCheckoutModal(false);
      setCheckoutData({ bookCopyId: '', userId: '' });
      setSuccessMessage('Book checked out successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(`Checkout failed: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const checkin = useMutation({
    mutationFn: async (bookCopyId: string) => {
      await api.post('/loans/checkin', { bookCopyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowCheckinModal(false);
      setCheckinBarcode('');
      setSuccessMessage('Book checked in successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(`Checkin failed: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

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

      {error && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444' }}>Failed to load loans. Please refresh the page.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
            Loan Management
          </h1>
          <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">
            Manage book checkouts and returns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCheckoutModal(true)}>
            Checkout Book
          </Button>
          <Button variant="outline" onClick={() => setShowCheckinModal(true)}>
            Return Book
          </Button>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--parchment-border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Overdue Loans
          </h2>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : !overdueLoans || overdueLoans.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--ink-secondary)' }}>
            <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No overdue loans</p>
          </div>
        ) : (
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Due Date
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
              {overdueLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {loan.bookCopy?.book?.title || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {loan.userId}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {formatDate(loan.dueDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkin.mutate(loan.bookCopyId)}
                    >
                      Return
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>
              Checkout Book
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Book Copy ID / Barcode
                </label>
                <Input
                  placeholder="Enter book copy ID or barcode"
                  value={checkoutData.bookCopyId}
                  onChange={(e) => setCheckoutData({ ...checkoutData, bookCopyId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  User ID
                </label>
                <Input
                  placeholder="Enter user ID"
                  value={checkoutData.userId}
                  onChange={(e) => setCheckoutData({ ...checkoutData, userId: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => checkout.mutate(checkoutData)}
                disabled={!checkoutData.bookCopyId || !checkoutData.userId}
                isLoading={checkout.isPending}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>
              Return Book
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                Book Copy ID / Barcode
              </label>
              <Input
                placeholder="Enter book copy ID or barcode"
                value={checkinBarcode}
                onChange={(e) => setCheckinBarcode(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCheckinModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => checkin.mutate(checkinBarcode)}
                disabled={!checkinBarcode}
                isLoading={checkin.isPending}
              >
                Return
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
