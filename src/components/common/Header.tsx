import React from 'react';
import { LucideIcon, Menu, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  onOpenMobileMenu
}) => {
  const { currentUser } = useApp();

  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-md shadow-blue-900/20 shrink-0">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        {actions}

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="p-1.5 bg-slate-100 rounded-xl text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser?.username || 'Guest'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">{currentUser?.role || 'guest'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
