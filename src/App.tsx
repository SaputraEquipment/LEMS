import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavRoute } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { EquipmentView } from './components/views/EquipmentView';
import { CalibrationView } from './components/views/CalibrationView';
import { PMTaskSetupView } from './components/views/PMTaskSetupView';
import { PMChecklistView } from './components/views/PMChecklistView';
import { ChemicalInventoryView } from './components/views/ChemicalInventoryView';
import { ChemicalTransactionsView } from './components/views/ChemicalTransactionsView';
import { SparePartsInventoryView } from './components/views/SparePartsInventoryView';
import { SparePartsTransactionsView } from './components/views/SparePartsTransactionsView';
import { MasterDataView } from './components/views/MasterDataView';
import { UserManagementView } from './components/views/UserManagementView';
import { AuditLogView } from './components/views/AuditLogView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveRoute} onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'equipment':
        return <EquipmentView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'calibration':
        return <CalibrationView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'pm-setup':
        return <PMTaskSetupView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'pm-checklist':
        return <PMChecklistView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'chemicals':
        return <ChemicalInventoryView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'chemical-tx':
        return <ChemicalTransactionsView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'spare-parts':
        return <SparePartsInventoryView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'spare-parts-tx':
        return <SparePartsTransactionsView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'master-data':
        return <MasterDataView onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
      case 'user-management':
        return currentUser.role === 'admin' ? (
          <UserManagementView onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        ) : (
          <DashboardView onNavigate={setActiveRoute} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        );
      case 'audit-log':
        return currentUser.role === 'admin' ? (
          <AuditLogView onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        ) : (
          <DashboardView onNavigate={setActiveRoute} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        );
      case 'settings':
        return currentUser.role === 'admin' ? (
          <SettingsView onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        ) : (
          <DashboardView onNavigate={setActiveRoute} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        );
      default:
        return <DashboardView onNavigate={setActiveRoute} onOpenMobileMenu={() => setMobileMenuOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 lg:pl-72 min-w-0 flex flex-col">
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderView()}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

