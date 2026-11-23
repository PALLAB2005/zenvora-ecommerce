import * as React from 'react';
import { cn } from '../../lib/cn';

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-xs font-medium text-[#171717] mb-1.5', className)}
      {...props}
    >
      {children}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3.5 rounded-[10px] bg-white border text-sm text-[#171717] placeholder:text-[#737373] transition-colors focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-[#F8F8F7] disabled:text-[#737373]',
          error ? 'border-[#DC2626]' : 'border-[#E5E5E5]',
          className
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-[10px] bg-white border text-sm text-[#171717] transition-colors focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15',
          error ? 'border-[#DC2626]' : 'border-[#E5E5E5]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  )
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          'w-full p-3.5 rounded-[10px] bg-white border text-sm text-[#171717] placeholder:text-[#737373] transition-colors focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15',
          error ? 'border-[#DC2626]' : 'border-[#E5E5E5]',
          className
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  )
);
Textarea.displayName = 'Textarea';
