import React from 'react';

export type StatusType =
  // Equipment statuses
  | 'active'
  | 'inactive'
  | 'under_maintenance'
  | 'decommissioned'
  // Results & States
  | 'pass'
  | 'fail'
  | 'conditional'
  | 'completed'
  | 'done'
  | 'due_soon'
  | 'overdue'
  | 'expired'
  | 'low_stock'
  | 'in_stock'
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'admin'
  | 'user'
  | 'guest';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normStatus = (status || '').toLowerCase().replace(/\s+/g, '_');

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  // Green / Success
  if (['active', 'pass', 'completed', 'done', 'in_stock', 'stock_in', 'admin'].includes(normStatus)) {
    bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotClass = 'bg-emerald-500';
  }
  // Warning / Amber
  if (['due_soon', 'conditional', 'under_maintenance', 'low_stock', 'adjustment', 'user'].includes(normStatus)) {
    bgClass = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotClass = 'bg-amber-500';
  }
  // Error / Red
  if (['fail', 'overdue', 'expired', 'decommissioned', 'inactive'].includes(normStatus)) {
    bgClass = 'bg-red-50 text-red-800 border-red-200/80';
    dotClass = 'bg-red-500';
  }
  // Sky / Info / Stock out
  if (['stock_out', 'guest', 'info'].includes(normStatus)) {
    bgClass = 'bg-sky-50 text-sky-800 border-sky-200/80';
    dotClass = 'bg-sky-500';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-xs font-bold tracking-wide'
  };

  const formattedText = label || normStatus.replace(/_/g, ' ').toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses[size]} shrink-0 shadow-xs transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
      <span className="whitespace-nowrap">{formattedText}</span>
    </span>
  );
};
