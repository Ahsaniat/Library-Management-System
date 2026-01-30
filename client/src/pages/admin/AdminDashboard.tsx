import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Calendar, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components';

interface DashboardStats {
  circulation: {
    totalCheckouts: number;
    totalReturns: number;
    activeLoans: number;
    overdueLoans: number;
    renewals: number;
  };
  books: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    popularBooks: Array<{ bookId: string; title: string; borrowCount: number }>;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    usersByRole: Array<{ role: string; count: number }>;
  };
  financial: {
    totalFinesGenerated: number;
    totalFinesCollected: number;
    totalFinesPending: number;
    totalFinesWaived: number;
  };
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/reports/dashboard');
      return response.data.data;
    },
  });
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <p style={{ color: 'var(--ink-primary)' }}>Failed to load dashboard statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Library system overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />}
          label="Total Users"
          value={stats.users.totalUsers}
          subLabel={`${stats.users.activeUsers} active`}
        />
        <StatCard
          icon={<BookOpen className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />}
          label="Total Books"
          value={stats.books.totalBooks}
          subLabel={`${stats.books.totalCopies} copies`}
        />
        <StatCard
          icon={<Calendar className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />}
          label="Active Loans"
          value={stats.circulation.activeLoans}
          subLabel={`${stats.circulation.totalCheckouts} total`}
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" style={{ color: 'var(--accent-warm)' }} />}
          label="Fines Collected"
          value={`$${stats.financial.totalFinesCollected.toFixed(2)}`}
          subLabel={`$${stats.financial.totalFinesPending.toFixed(2)} pending`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
            Overdue Loans
          </h2>
          <div className="text-center py-8">
            <p className="text-4xl font-bold" style={{ color: 'var(--ink-primary)' }}>{stats.circulation.overdueLoans}</p>
            <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">books overdue</p>
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
            Book Availability
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--ink-secondary)' }}>Available</span>
              <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{stats.books.availableCopies}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--ink-secondary)' }}>Borrowed</span>
              <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{stats.books.borrowedCopies}</span>
            </div>
            <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <div
                className="h-3 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-warm)',
                  width: `${(stats.books.availableCopies / stats.books.totalCopies) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Users by Role</h2>
          <div className="space-y-3">
            {stats.users.usersByRole.map((item) => (
              <div key={item.role} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                <span className="capitalize" style={{ color: 'var(--ink-secondary)' }}>{item.role}</span>
                <span className="font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--parchment-light)', color: 'var(--ink-primary)' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Popular Books</h2>
          <div className="space-y-3">
            {stats.books.popularBooks.length === 0 ? (
              <p className="text-center py-4" style={{ color: 'var(--ink-secondary)' }}>No loan data yet</p>
            ) : (
              stats.books.popularBooks.slice(0, 5).map((book, index) => (
                <div key={book.bookId} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: 'var(--ink-secondary)' }}>#{index + 1}</span>
                    <span className="line-clamp-1" style={{ color: 'var(--ink-primary)' }}>{book.title}</span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{book.borrowCount} loans</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel: string;
}) {
  return (
    <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--parchment-dark)' }}>{icon}</div>
        <div>
          <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>{value}</p>
          <p className="text-xs" style={{ color: 'var(--ink-secondary)' }}>{subLabel}</p>
        </div>
      </div>
    </div>
  );
}
