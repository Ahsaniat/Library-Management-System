import { Button } from './index';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
        style={{ backgroundColor: 'var(--parchment-light)' }}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
          {title}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-secondary)' }}>
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
