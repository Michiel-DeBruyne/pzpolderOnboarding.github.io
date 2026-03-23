import React from 'react';
import { cn } from '@/src/lib/utils';

export const Card = ({ children, className }: any) => (
  <div className={cn("bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);
