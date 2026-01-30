import { cn } from '../utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, style, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: 'var(--accent-warm)', color: 'white' },
      secondary: { backgroundColor: 'var(--ink-secondary)', color: 'white' },
      outline: { border: '1px solid var(--parchment-border)', backgroundColor: 'var(--parchment-light)', color: 'var(--ink-primary)' },
      ghost: { backgroundColor: 'transparent', color: 'var(--ink-primary)' },
      danger: { backgroundColor: 'var(--ink-secondary)', color: 'white' },
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
