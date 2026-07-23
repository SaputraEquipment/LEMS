import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FlaskConical,
  LayoutDashboard,
  Database,
  Wrench,
  Ruler,
  ClipboardList,
  CheckSquare,
  TestTube2,
  ArrowRightLeft,
  Settings2,
  Package,
  History,
  Settings,
  LogOut,
  UserCheck,
  Building2,
  Users,
  LogIn,
  X
} from 'lucide-react';

export type NavRoute =
  | 'dashboard'
  | 'master-data'
  | 'equipment'
  | 'calibration'
  | 'pm-setup'
  | 'pm-checklist'
  | 'chemicals'
  | 'chemical-tx'
  | 'spare-parts'
  | 'spare-parts-tx'
  | 'user-management'
  | 'audit-log'
  | 'settings';

interface SidebarProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { currentUser, logout, companyProfile } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const navItem = (
    id: NavRoute,
    label: string,
    icon: React.ReactNode,
    badge?: string
  ) => {
    const isActive = activeRoute === id;
    return (
      <button
        key={id}
        onClick={() => {
          onNavigate(id);
          onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer relative ${
          isActive
            ? 'bg-blue-600/20 text-white font-bold border border-blue-500/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-sm shadow-blue-400" />
        )}
        <div className="flex items-center gap-3">
          <span
            className={`transition-colors ${
              isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {badge && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-[#172554] text-white flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header Tile */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <FlaskConical className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-wider text-white">LEMS</h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 font-medium mt-0.5">
                  Lab Equipment Management
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{companyProfile.labName}</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {/* LEMS Group */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              LEMS Operations
            </div>
            <div className="space-y-1">
              {navItem('dashboard', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
              {navItem('master-data', 'Master Data', <Database className="w-4 h-4" />)}
              {navItem('equipment', 'Equipment', <Wrench className="w-4 h-4" />)}
              {navItem('calibration', 'Calibration Records', <Ruler className="w-4 h-4" />)}
              {navItem('pm-setup', 'PM Task Setup', <ClipboardList className="w-4 h-4" />)}
              {navItem('pm-checklist', 'PM Checklist', <CheckSquare className="w-4 h-4" />)}
              {navItem('chemicals', 'Chemical Inventory', <TestTube2 className="w-4 h-4" />)}
              {navItem(
                'chemical-tx',
                'Chemical Transactions',
                <ArrowRightLeft className="w-4 h-4" />
              )}
              {navItem('spare-parts', 'Spare Parts Inventory', <Package className="w-4 h-4" />)}
              {navItem(
                'spare-parts-tx',
                'Spare Parts Transactions',
                <Settings2 className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Administration Group */}
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span>Administration</span>
              {!isAdmin && (
                <span className="text-[9px] font-normal text-slate-500 uppercase">
                  (Admin Only)
                </span>
              )}
            </div>
            <div className="space-y-1">
              {isAdmin ? (
                <>
                  {navItem('user-management', 'User Management', <Users className="w-4 h-4" />)}
                  {navItem('audit-log', 'Audit Log', <History className="w-4 h-4" />)}
                  {navItem('settings', 'System Settings', <Settings className="w-4 h-4" />)}
                </>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-2">
                  <p>🔒 Admin sections are restricted to Quality Managers.</p>
                  <button
                    onClick={logout}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3 h-3 text-blue-400" /> Log In as Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer User Profile & Log Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || 'Guest Observer'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 capitalize">
                  <UserCheck className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">@{currentUser?.username || 'guest'}</span>
                  <span className="ml-auto text-[9px] px-1 py-0.2 bg-slate-800 rounded text-slate-300 font-bold uppercase shrink-0">
                    {currentUser?.role || 'guest'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out to Login Page"
              className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

