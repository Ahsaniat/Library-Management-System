import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Calendar, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { Button, LoadingSpinner, Alert } from '../../components';
import { getApiErrorMessage } from '../../utils';
import { useCurrency } from '../../hooks/useSettings';

type ReportType = 'circulation' | 'inventory' | 'overdue' | 'financial' | 'users';

interface CirculationStats {
  totalCheckouts: number;
  totalReturns: number;
  activeLoans: number;
  overdueLoans: number;
  renewals: number;
}

interface FinancialStats {
  totalFinesGenerated: number;
  totalFinesCollected: number;
  totalFinesPending: number;
  totalFinesWaived: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  usersByRole: Array<{ role: string; count: number }>;
}

interface OverdueReportItem {
  loanId: string;
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

function useReport<T>(path: string, key: string) {
  return useQuery({
    queryKey: ['admin', 'reports', key],
    queryFn: async (): Promise<T> => {
      const response = await api.get<{ success: boolean; data: T }>(path);
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
        <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Generate and export library reports</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ReportTab icon={<Calendar className="h-5 w-5" />} label="Overdue" isActive={activeReport === 'overdue'} onClick={() => setActiveReport('overdue')} />
        <ReportTab icon={<BookOpen className="h-5 w-5" />} label="Inventory" isActive={activeReport === 'inventory'} onClick={() => setActiveReport('inventory')} />
        <ReportTab icon={<TrendingUp className="h-5 w-5" />} label="Circulation" isActive={activeReport === 'circulation'} onClick={() => setActiveReport('circulation')} />
        <ReportTab icon={<DollarSign className="h-5 w-5" />} label="Financial" isActive={activeReport === 'financial'} onClick={() => setActiveReport('financial')} />
        <ReportTab icon={<Users className="h-5 w-5" />} label="Users" isActive={activeReport === 'users'} onClick={() => setActiveReport('users')} />
      </div>

      {activeReport === 'overdue' && <OverdueReportView />}
      {activeReport === 'inventory' && <InventoryReportView />}
      {activeReport === 'circulation' && <CirculationReportView />}
      {activeReport === 'financial' && <FinancialReportView />}
      {activeReport === 'users' && <UsersReportView />}
    </div>
  );
}

function exportCsv(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escape = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

function StatList({ title, items }: { title: string; items: Array<[string, string | number]> }) {
  return (
    <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>{title}</h3>
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="capitalize" style={{ color: 'var(--ink-secondary)' }}>{label}</span>
            <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverdueReportView() {
  const { format } = useCurrency();
  const { data, isLoading, error } = useReport<OverdueReport>('/reports/overdue', 'overdue');

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error || !data) return <Alert variant="error" message={getApiErrorMessage(error, 'Failed to load report')} />;

  return (
    <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
      <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--parchment-border)' }}>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>Overdue Books Report</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
            {data.totalOverdue} overdue items • {format(data.totalEstimatedFines)} estimated fines
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            exportCsv(
              'overdue-report.csv',
              ['Member', 'Email', 'Book', 'Barcode', 'Due date', 'Days overdue', 'Estimated fine'],
              data.loans.map((item) => [
                item.userName,
                item.userEmail,
                item.bookTitle,
                item.barcode,
                item.dueDate,
                item.daysOverdue,
                Number(item.estimatedFine).toFixed(2),
              ])
            )
          }
        >
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
              {['Member', 'Book', 'Due Date', 'Days Overdue', 'Fine'].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--ink-secondary)' }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            {data.loans.map((item) => (
              <tr key={item.loanId}>
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
                  {format(item.estimatedFine)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CirculationReportView() {
  const { data, isLoading, error } = useReport<CirculationStats>('/reports/circulation', 'circulation');

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error || !data) return <Alert variant="error" message={getApiErrorMessage(error, 'Failed to load report')} />;

  return (
    <StatList
      title="Circulation"
      items={[
        ['Total checkouts', data.totalCheckouts],
        ['Total returns', data.totalReturns],
        ['Active loans', data.activeLoans],
        ['Overdue loans', data.overdueLoans],
        ['Renewals', data.renewals],
      ]}
    />
  );
}

function FinancialReportView() {
  const { format } = useCurrency();
  const { data, isLoading, error } = useReport<FinancialStats>('/reports/financial', 'financial');

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error || !data) return <Alert variant="error" message={getApiErrorMessage(error, 'Failed to load report')} />;

  return (
    <StatList
      title="Financial"
      items={[
        ['Fines generated', format(data.totalFinesGenerated)],
        ['Fines collected', format(data.totalFinesCollected)],
        ['Fines pending', format(data.totalFinesPending)],
        ['Fines waived', format(data.totalFinesWaived)],
      ]}
    />
  );
}

function UsersReportView() {
  const { data, isLoading, error } = useReport<UserStats>('/reports/users', 'users');

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error || !data) return <Alert variant="error" message={getApiErrorMessage(error, 'Failed to load report')} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatList
        title="Members"
        items={[
          ['Total users', data.totalUsers],
          ['Active users', data.activeUsers],
          ['New registrations', data.newRegistrations],
        ]}
      />
      <StatList
        title="By role"
        items={data.usersByRole.map((item) => [item.role, item.count])}
      />
    </div>
  );
}

function InventoryReportView() {
  const { data, isLoading, error } = useReport<InventoryReport>('/reports/inventory', 'inventory');

  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (error || !data) return <Alert variant="error" message={getApiErrorMessage(error, 'Failed to load report')} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            exportCsv(
              'inventory-report.csv',
              ['Section', 'Value', 'Count'],
              [
                ...data.byStatus.map((item) => ['Status', item.status, item.count] as Array<string | number>),
                ...data.byCondition.map((item) => ['Condition', item.condition, item.count] as Array<string | number>),
                ...data.byCategory.map((item) => ['Category', item.category, item.count] as Array<string | number>),
                ...data.byLibrary.map((item) => ['Library', item.library, item.count] as Array<string | number>),
              ]
            )
          }
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatList
          title="Overview"
          items={[
            ['Total books', data.totalBooks],
            ['Total copies', data.totalCopies],
          ]}
        />
        <StatList title="By status" items={data.byStatus.map((item) => [item.status, item.count])} />
        <StatList title="By condition" items={data.byCondition.map((item) => [item.condition, item.count])} />
        <StatList title="By category" items={data.byCategory.map((item) => [item.category, item.count])} />
        <StatList title="By library" items={data.byLibrary.map((item) => [item.library, item.count])} />
      </div>
    </div>
  );
}
