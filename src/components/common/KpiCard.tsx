import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  badgeText?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  badgeText,
  onClick
}) => {
  const variantStyles = {
    primary: {
      bg: 'bg-blue-50/70 text-blue-700 border-blue-100',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/20',
      border: 'hover:border-blue-300'
    },
    success: {
      bg: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20',
      border: 'hover:border-emerald-300'
    },
    warning: {
      bg: 'bg-amber-50/70 text-amber-800 border-amber-100',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/20',
      border: 'hover:border-amber-300'
    },
    error: {
      bg: 'bg-red-50/70 text-red-700 border-red-100',
      iconBg: 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-500/20',
      border: 'hover:border-red-300'
    },
    info: {
      bg: 'bg-sky-50/70 text-sky-700 border-sky-100',
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/20',
      border: 'hover:border-sky-300'
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${style.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl shadow-md ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">{subtitle}</span>
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
