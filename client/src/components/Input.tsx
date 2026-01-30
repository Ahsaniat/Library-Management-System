import { cn } from '../utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors',
            className
          )}
          style={{
            borderColor: error ? '#b91c1c' : 'var(--parchment-border)',
            backgroundColor: 'var(--parchment-light)',
            color: 'var(--ink-primary)',
            ...style,
          }}
          {...props}
        />
        {error && <p className="mt-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
