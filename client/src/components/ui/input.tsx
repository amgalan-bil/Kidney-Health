import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-xl border border-input bg-white px-4 text-base text-ink shadow-[0_1px_2px_rgb(23_43_58/0.04)] transition-[border-color,box-shadow] outline-none placeholder:text-ink/35 focus-visible:border-teal focus-visible:ring-4 focus-visible:ring-teal/15 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/15',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
