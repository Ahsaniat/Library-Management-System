import { Link } from 'react-router-dom';
import { BookOpen, Clock, Calendar } from 'lucide-react';
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
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          Welcome back, {user?.firstName}!
        </h1>
        <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Here's an overview of your library activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <BookOpen className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Active Loans</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>{activeLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <Clock className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Pending Reservations</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>{pendingReservations.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <BookOpen className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Overdue</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>{overdueLoans.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <Calendar className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Member Since</p>
              <p className="text-lg font-medium" style={{ color: 'var(--ink-primary)' }}>
                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>Current Loans</h2>
            <Link to="/my-loans" className="text-sm underline" style={{ color: 'var(--accent-warm)' }}>
              View All
            </Link>
          </div>
          {loansLoading ? (
            <LoadingSpinner />
          ) : activeLoans.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--ink-secondary)' }}>No active loans</p>
          ) : (
            <div className="space-y-4">
              {activeLoans.slice(0, 3).map((loan) => {
                const daysLeft = getDaysUntilDue(loan.dueDate);
                const overdue = daysLeft < 0;

                return (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--parchment-dark)' }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                        {loan.bookCopy?.book?.title || 'Unknown Book'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Due: {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    <span
                      className="text-sm px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'var(--parchment-light)', color: 'var(--ink-primary)' }}
                    >
                      {overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>Reservations</h2>
            <Link to="/my-reservations" className="text-sm underline" style={{ color: 'var(--accent-warm)' }}>
              View All
            </Link>
          </div>
          {reservationsLoading ? (
            <LoadingSpinner />
          ) : pendingReservations.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--ink-secondary)' }}>No pending reservations</p>
          ) : (
            <div className="space-y-4">
              {pendingReservations.slice(0, 3).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--parchment-dark)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {reservation.book?.title || 'Unknown Book'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Position: #{reservation.queuePosition}
                    </p>
                  </div>
                  <span
                    className="text-sm px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--parchment-light)', color: 'var(--ink-primary)' }}
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
