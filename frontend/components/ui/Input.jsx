'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, label, error, helperText, id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-[15px] text-ink-900',
          'placeholder:text-ink-400 transition-all duration-150',
          'focus-visible:border-electric-500 focus-visible:ring-2 focus-visible:ring-electric-100',
          error && 'border-danger-500 focus-visible:ring-danger-100',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-sm text-ink-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
