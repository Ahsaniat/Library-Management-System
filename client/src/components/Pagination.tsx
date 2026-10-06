import { PaginationMeta } from '../types';
import Button from './Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ meta, onPageChange, className }: PaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className ?? ''}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrev}
        aria-label="Previous page"
      >
        Previous
      </Button>
      <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
        Page {meta.page} of {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNext}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}
