import React from 'react';
import { LucideIcon, Menu, User, LogOut } from 'lucide-react';
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
  const { currentUser, logout } = useApp();

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

        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.fullName || currentUser?.username || 'Guest'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-end gap-1">
              <span>@{currentUser?.username || 'guest'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-sans font-bold uppercase text-[9px]">
                {currentUser?.role || 'guest'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out / Switch User"
            className="p-2 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

