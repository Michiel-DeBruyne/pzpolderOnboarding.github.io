import React from 'react';
import { cn } from '@/src/lib/utils';

export const Button = ({ className, variant = 'primary', ...props }: any) => (
  <button 
    className={cn(
      "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
      variant === 'primary' ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
      className
    )} 
    {...props} 
  />
);
