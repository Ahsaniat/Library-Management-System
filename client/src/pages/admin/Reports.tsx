import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Calendar, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { Button, LoadingSpinner } from '../../components';

type ReportType = 'circulation' | 'inventory' | 'overdue' | 'financial' | 'users';

interface OverdueReportItem {
  loanId: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookTitle: string;
  barcode: string;
  dueDate: string;
  daysOverdue: number;
  estimatedFine: number;
}

interface OverdueReport {
  loans: OverdueReportItem[];
  totalOverdue: number;
  totalEstimatedFines: number;
}

interface InventoryReport {
  totalBooks: number;
  totalCopies: number;
  byStatus: Array<{ status: string; count: number }>;
  byCondition: Array<{ condition: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byLibrary: Array<{ library: string; count: number }>;
}

function useOverdueReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'overdue'],
    queryFn: async (): Promise<OverdueReport> => {
      const response = await api.get<{ success: boolean; data: OverdueReport }>('/reports/overdue');
      return response.data.data;
    },
  });
}

function useInventoryReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'inventory'],
    queryFn: async (): Promise<InventoryReport> => {
      const response = await api.get<{ success: boolean; data: InventoryReport }>('/reports/inventory');
      return response.data.data;
    },
  });
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('overdue');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>Reports</h1>
        <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Generate and view library reports</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ReportTab
          icon={<Calendar className="h-5 w-5" />}
          label="Overdue"
          isActive={activeReport === 'overdue'}
          onClick={() => setActiveReport('overdue')}
        />
        <ReportTab
          icon={<BookOpen className="h-5 w-5" />}
          label="Inventory"
          isActive={activeReport === 'inventory'}
          onClick={() => setActiveReport('inventory')}
        />
        <ReportTab
          icon={<TrendingUp className="h-5 w-5" />}
          label="Circulation"
          isActive={activeReport === 'circulation'}
          onClick={() => setActiveReport('circulation')}
        />
        <ReportTab
          icon={<DollarSign className="h-5 w-5" />}
          label="Financial"
          isActive={activeReport === 'financial'}
          onClick={() => setActiveReport('financial')}
        />
        <ReportTab
          icon={<Users className="h-5 w-5" />}
          label="Users"
          isActive={activeReport === 'users'}
          onClick={() => setActiveReport('users')}
        />
      </div>

      {activeReport === 'overdue' && <OverdueReportView />}
      {activeReport === 'inventory' && <InventoryReportView />}
      {activeReport === 'circulation' && <ComingSoonReport type="Circulation" />}
      {activeReport === 'financial' && <ComingSoonReport type="Financial" />}
      {activeReport === 'users' && <ComingSoonReport type="User" />}
    </div>
  );
}

function ReportTab({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors"
      style={{
        borderColor: isActive ? 'var(--accent-warm)' : 'var(--parchment-border)',
        backgroundColor: isActive ? 'var(--parchment-dark)' : 'var(--parchment-light)',
        color: 'var(--ink-primary)',
      }}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function OverdueReportView() {
  const { data, isLoading, error } = useOverdueReport();

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error) return <div style={{ color: 'var(--ink-primary)' }} className="p-4">Failed to load report</div>;
  if (!data) return null;

  return (
    <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
      <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--parchment-border)' }}>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>Overdue Books Report</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
            {data.totalOverdue} overdue items • ${data.totalEstimatedFines.toFixed(2)} estimated fines
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {data.loans.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--ink-secondary)' }}>
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No overdue books!</p>
        </div>
      ) : (
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
          <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                Days Overdue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                Fine
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            {data.loans.map((item) => (
              <tr key={item.loanId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>{item.userName}</div>
                  <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{item.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm" style={{ color: 'var(--ink-primary)' }}>{item.bookTitle}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>{item.barcode}</div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {new Date(item.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
                    {item.daysOverdue} days
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                  ${item.estimatedFine.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function InventoryReportView() {
  const { data, isLoading, error } = useInventoryReport();

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error) return <div style={{ color: 'var(--ink-primary)' }} className="p-4">Failed to load report</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span style={{ color: 'var(--ink-secondary)' }}>Total Books</span>
              <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{data.totalBooks}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--ink-secondary)' }}>Total Copies</span>
              <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{data.totalCopies}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>By Status</h3>
          <div className="space-y-2">
            {data.byStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="capitalize" style={{ color: 'var(--ink-secondary)' }}>{item.status}</span>
                <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>By Condition</h3>
          <div className="space-y-2">
            {data.byCondition.map((item) => (
              <div key={item.condition} className="flex justify-between items-center">
                <span className="capitalize" style={{ color: 'var(--ink-secondary)' }}>{item.condition}</span>
                <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>By Category</h3>
          <div className="space-y-2">
            {data.byCategory.map((item) => (
              <div key={item.category} className="flex justify-between items-center">
                <span style={{ color: 'var(--ink-secondary)' }}>{item.category}</span>
                <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonReport({ type }: { type: string }) {
  return (
    <div className="rounded-lg shadow-md p-12 text-center" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--ink-secondary)' }} />
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>{type} Report</h3>
      <p style={{ color: 'var(--ink-secondary)' }}>Detailed {type.toLowerCase()} reports coming soon</p>
    </div>
  );
}
