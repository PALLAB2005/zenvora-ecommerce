import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, type = 'button', ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-[#171717] text-white hover:bg-[#2E2E2E] focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2',
      accent:
        'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
      secondary:
        'bg-[#F8F8F7] text-[#171717] border border-[#E5E5E5] hover:bg-[#EFEFED] focus-visible:ring-2 focus-visible:ring-[#171717]/30',
      outline:
        'bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F8F8F7] hover:border-[#D4D4D4] focus-visible:ring-2 focus-visible:ring-[#171717]/30',
      ghost:
        'bg-transparent text-[#171717] hover:bg-[#F8F8F7] focus-visible:ring-2 focus-visible:ring-[#171717]/20',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-9 px-3.5 text-xs rounded-lg',
      md: 'h-10 px-5 text-sm rounded-[10px]',
      lg: 'h-12 px-7 text-sm rounded-[12px]',
      icon: 'h-10 w-10 p-0 rounded-[10px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
