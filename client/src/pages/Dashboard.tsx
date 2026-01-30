import { Link } from 'react-router-dom';
import { BookOpen, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store';
import { useMyLoans, useMyReservations } from '../hooks';
import { LoadingSpinner } from '../components';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: loans, isLoading: loansLoading } = useMyLoans('active');
  const { data: reservations, isLoading: reservationsLoading } = useMyReservations();

  const activeLoans = loans?.filter((l) => l.status === 'active') ?? [];
  const overdueLoans = activeLoans.filter((l) => isOverdue(l.dueDate));
  const pendingReservations = reservations?.filter((r) => r.status === 'pending' || r.status === 'ready') ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your library activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-2xl font-bold">{activeLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Reservations</p>
              <p className="text-2xl font-bold">{pendingReservations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold">{overdueLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg font-medium">
                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Loans</h2>
            <Link to="/my-loans" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {loansLoading ? (
            <LoadingSpinner />
          ) : activeLoans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active loans</p>
          ) : (
            <div className="space-y-4">
              {activeLoans.slice(0, 3).map((loan) => {
                const daysLeft = getDaysUntilDue(loan.dueDate);
                const overdue = daysLeft < 0;

                return (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {loan.bookCopy?.book?.title || 'Unknown Book'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        overdue
                          ? 'bg-red-100 text-red-700'
                          : daysLeft <= 3
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reservations</h2>
            <Link to="/my-reservations" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {reservationsLoading ? (
            <LoadingSpinner />
          ) : pendingReservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending reservations</p>
          ) : (
            <div className="space-y-4">
              {pendingReservations.slice(0, 3).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {reservation.book?.title || 'Unknown Book'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Position: #{reservation.queuePosition}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      reservation.status === 'ready'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {reservation.status === 'ready' ? 'Ready for pickup' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
