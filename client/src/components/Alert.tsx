import { AlertCircle, Check } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'info';
  message: string;
}

const STYLES: Record<AlertProps['variant'], { bg: string; border: string; color: string }> = {
  success: {
    bg: 'var(--status-success-bg)',
    border: 'var(--status-success-border)',
    color: 'var(--status-success)',
  },
  error: {
    bg: 'var(--status-danger-bg)',
    border: 'var(--status-danger-border)',
    color: 'var(--status-danger)',
  },
  info: {
    bg: 'var(--parchment-dark)',
    border: 'var(--parchment-border)',
    color: 'var(--ink-secondary)',
  },
};

export default function Alert({ variant, message }: AlertProps) {
  const style = STYLES[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="mb-6 p-4 rounded-lg flex items-center gap-3"
      style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
    >
      {variant === 'success' ? (
        <Check className="h-5 w-5" style={{ color: style.color }} />
      ) : (
        <AlertCircle className="h-5 w-5" style={{ color: style.color }} />
      )}
      <p style={{ color: style.color }}>{message}</p>
    </div>
  );
}
