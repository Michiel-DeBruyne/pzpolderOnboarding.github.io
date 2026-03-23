import React from 'react';
import { cn } from '@/src/lib/utils';

export const Input = ({ className, ...props }: any) => (
  <input 
    className={cn(
      "w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all",
      className
    )} 
    {...props} 
  />
);
