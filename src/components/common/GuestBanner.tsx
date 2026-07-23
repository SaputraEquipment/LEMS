import React from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GuestBanner: React.FC = () => {
  const { currentUser, logout } = useApp();

  if (currentUser?.role !== 'guest') return null;

  return (
    <div className="bg-sky-50/90 border border-sky-200/90 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sky-950">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-100 rounded-xl text-sky-700 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-sky-900">🔒 Guest Mode — Read Only Access</h4>
          <p className="text-xs text-sky-700 mt-0.5">
            You are viewing LEMS as a Guest observer. Operational forms, editing controls, and deletion buttons are disabled.
          </p>
        </div>
      </div>
      <button
        onClick={logout}
        className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        Log In / Switch Account
      </button>
    </div>
  );
};
