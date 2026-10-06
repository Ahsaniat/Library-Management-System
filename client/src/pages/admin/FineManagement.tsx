import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { Button, Input, LoadingSpinner, Pagination } from '../../components';
import { useAllFines, usePayFine, useWaiveFine } from '../../hooks/useFines';
import { Fine, UserRole } from '../../types';
import { formatDate, getApiErrorMessage } from '../../utils';
import { useAuthStore } from '../../store';

type ActionState = { id: string; type: 'pay' | 'waive' } | null;

export default function FineManagement() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActionState>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'card' | 'online' | 'other'>('cash');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, error } = useAllFines(statusFilter || undefined, page);
  const fines = data?.fines ?? [];
  const payFine = usePayFine();
  const waiveFine = useWaiveFine();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const outstanding = (fine: Fine) => Number(fine.amount) - Number(fine.paidAmount);

  const startAction = (fine: Fine, type: 'pay' | 'waive') => {
    setAction({ id: fine.id, type });
    setAmount(outstanding(fine).toFixed(2));
    setReason('');
    setMessage(null);
  };

  const handlePay = async (id: string) => {
    try {
      await payFine.mutateAsync({ id, data: { amount: Number(amount), method } });
      setMessage({ type: 'success', text: 'Payment recorded' });
      setAction(null);
    } catch (err) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'Failed to record payment'),
      });
    }
  };

  const handleWaive = async (id: string) => {
    try {
      await waiveFine.mutateAsync({ id, reason });
      setMessage({ type: 'success', text: 'Fine waived' });
      setAction(null);
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Failed to waive fine') });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          Fine Management
        </h1>
        <p className="mt-2" style={{ color: 'var(--ink-secondary)' }}>
          Record payments and waive fines.
        </p>
      </div>

      {message && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{
            backgroundColor:
              message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }`,
          }}
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
          ) : (
            <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
          )}
          <p style={{ color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
            {message.text}
          </p>
        </div>
      )}

      <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
          Filter by status
        </label>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg"
          style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="partial">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="waived">Waived</option>
        </select>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : error ? (
          <div className="p-6" style={{ color: 'var(--ink-primary)' }}>Failed to load fines.</div>
        ) : fines.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--ink-secondary)' }}>
            No fines found.
          </div>
        ) : (
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                {['Member', 'Reason', 'Amount', 'Balance', 'Status', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--ink-secondary)' }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
              {fines.map((fine) => (
                <tr key={fine.id}>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                    {fine.user ? `${fine.user.firstName} ${fine.user.lastName}` : fine.userId}
                    {fine.user && (
                      <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                        {fine.user.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                    {fine.reason}
                    <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                      {formatDate(fine.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                    ${Number(fine.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                    ${outstanding(fine).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-1 text-xs rounded-full capitalize"
                      style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}
                    >
                      {fine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(fine.status === 'pending' || fine.status === 'partial') && (
                      <div className="flex flex-wrap gap-2">
                        {action?.id === fine.id && action.type === 'pay' ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={amount}
                              onChange={(event) => setAmount(event.target.value)}
                              aria-label="Payment amount"
                              className="w-28"
                            />
                            <select
                              value={method}
                              onChange={(event) =>
                                setMethod(event.target.value as 'cash' | 'card' | 'online' | 'other')
                              }
                              className="px-2 py-2 border rounded-lg text-sm"
                              style={{ borderColor: 'var(--parchment-border)' }}
                              aria-label="Payment method"
                            >
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="online">Online</option>
                              <option value="other">Other</option>
                            </select>
                            <Button
                              size="sm"
                              onClick={() => handlePay(fine.id)}
                              isLoading={payFine.isPending}
                            >
                              Record
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAction(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : action?.id === fine.id && action.type === 'waive' ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              value={reason}
                              onChange={(event) => setReason(event.target.value)}
                              placeholder="Waiver reason"
                              aria-label="Waiver reason"
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleWaive(fine.id)}
                              isLoading={waiveFine.isPending}
                              disabled={!reason.trim()}
                            >
                              Waive
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAction(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startAction(fine, 'pay')}>
                              Pay
                            </Button>
                            {fine.status === 'pending' && isAdmin && (
                              <Button size="sm" variant="outline" onClick={() => startAction(fine, 'waive')}>
                                Waive
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination meta={data.pagination} onPageChange={setPage} className="mt-4" />
      )}
    </div>
  );
}
