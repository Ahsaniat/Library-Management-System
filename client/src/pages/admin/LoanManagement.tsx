import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { Button, Input, LoadingSpinner } from '../../components';
import { Loan } from '../../types';

interface LoansResponse {
  success: boolean;
  data: Loan[];
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
      return response.data.data;
    },
  });
}

export default function LoanManagement() {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({ bookCopyId: '', userId: '' });
  const [checkinBarcode, setCheckinBarcode] = useState('');
  const queryClient = useQueryClient();

  const { data: overdueLoans, isLoading } = useOverdueLoans();

  const checkout = useMutation({
    mutationFn: async (data: CheckoutData) => {
      await api.post('/loans/checkout', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowCheckoutModal(false);
      setCheckoutData({ bookCopyId: '', userId: '' });
      alert('Book checked out successfully!');
    },
    onError: (error: Error) => {
      alert(`Checkout failed: ${error.message}`);
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
      alert('Book checked in successfully!');
    },
    onError: (error: Error) => {
      alert(`Checkin failed: ${error.message}`);
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
