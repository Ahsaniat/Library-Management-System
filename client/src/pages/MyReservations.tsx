import { useMyReservations, useCancelReservation } from '../hooks';
import { LoadingSpinner, Button } from '../components';
import { formatDate } from '../utils';
import { Link } from 'react-router-dom';

export default function MyReservations() {
  const { data: reservations, isLoading } = useMyReservations();
  const cancelReservation = useCancelReservation();

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      await cancelReservation.mutateAsync({ id });
      alert('Reservation cancelled successfully!');
    } catch {
      alert('Failed to cancel reservation. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

      {reservations?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg mb-4">You have no reservations.</p>
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
                  Reserved On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Queue Position
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
              {reservations?.map((reservation) => {
                const canCancel =
                  reservation.status === 'pending' || reservation.status === 'ready';

                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 text-yellow-700',
                  ready: 'bg-green-100 text-green-700',
                  fulfilled: 'bg-blue-100 text-blue-700',
                  cancelled: 'bg-gray-100 text-gray-700',
                  expired: 'bg-red-100 text-red-700',
                };

                return (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/books/${reservation.bookId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {reservation.book?.title || 'Unknown Book'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reservation.reservedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{reservation.queuePosition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          statusColors[reservation.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {reservation.status === 'ready' ? 'Ready for pickup' : reservation.status}
                      </span>
                      {reservation.expiresAt && reservation.status === 'ready' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {formatDate(reservation.expiresAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancel(reservation.id)}
                          isLoading={cancelReservation.isPending}
                        >
                          Cancel
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
