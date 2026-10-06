import { useState } from 'react';
import { AlertCircle, Receipt } from 'lucide-react';
import { LoadingSpinner, Pagination } from '../components';
import { useMyFines, useMyFineSummary } from '../hooks/useFines';
import { useCurrency } from '../hooks/useSettings';
import { formatDate } from '../utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  partial: 'Partially paid',
  paid: 'Paid',
  waived: 'Waived',
};

export default function MyFines() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyFines(page);
  const { data: outstanding } = useMyFineSummary();
  const { format } = useCurrency();
  const fines = data?.fines ?? [];

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          My Fines
        </h1>
        <div
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}
        >
          <span style={{ color: 'var(--ink-secondary)' }}>Outstanding: </span>
          <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
            {format(outstanding)}
          </span>
        </div>
      </div>

      {fines.length === 0 ? (
        <div className="text-center py-20 rounded-lg shadow" style={{ backgroundColor: 'var(--parchment-light)' }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--ink-secondary)' }} />
          <p style={{ color: 'var(--ink-secondary)' }}>You have no fines on record.</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
              <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
                <tr>
                  {['Date', 'Reason', 'Amount', 'Paid', 'Status'].map((heading) => (
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
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                      {formatDate(fine.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                      <div>{fine.reason}</div>
                      {fine.loan?.bookCopy?.book?.title && (
                        <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          {fine.loan.bookCopy.book.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-primary)' }}>
                      {format(fine.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                      {format(fine.paidAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}
                      >
                        {STATUS_LABELS[fine.status] ?? fine.status}
                      </span>
                      {fine.payments && fine.payments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--ink-secondary)' }}>
                          <Receipt className="h-3 w-3" />
                          {fine.payments[fine.payments.length - 1]?.receiptNumber}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <Pagination meta={data.pagination} onPageChange={setPage} className="mt-4" />
          )}
        </>
      )}
    </div>
  );
}
