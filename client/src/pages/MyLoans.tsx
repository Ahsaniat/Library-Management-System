import { useMyLoans, useRenewLoan } from '../hooks';
import { LoadingSpinner, Button } from '../components';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils';
import { Link } from 'react-router-dom';

export default function MyLoans() {
  const { data: loans, isLoading } = useMyLoans();
  const renewLoan = useRenewLoan();

  const handleRenew = async (loanId: string) => {
    try {
      await renewLoan.mutateAsync(loanId);
      alert('Loan renewed successfully!');
    } catch {
      alert('Failed to renew loan. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Loans</h1>

      {loans?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg mb-4">You have no loans.</p>
          <Link to="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans?.map((loan) => {
                const overdue = loan.status === 'active' && isOverdue(loan.dueDate);
                const daysLeft = getDaysUntilDue(loan.dueDate);
                const canRenew =
                  loan.status === 'active' &&
                  !overdue &&
                  loan.renewalCount < loan.maxRenewals;

                return (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {loan.bookCopy?.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loan.bookCopy?.barcode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(loan.borrowedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.status === 'returned' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          Returned
                        </span>
                      ) : overdue ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                          Overdue ({Math.abs(daysLeft)} days)
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Active ({daysLeft} days left)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canRenew && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRenew(loan.id)}
                          isLoading={renewLoan.isPending}
                        >
                          Renew ({loan.maxRenewals - loan.renewalCount} left)
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
