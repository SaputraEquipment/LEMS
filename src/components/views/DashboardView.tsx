import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { NavRoute } from '../common/Sidebar';
import {
  LayoutDashboard,
  Wrench,
  Ruler,
  ClipboardList,
  TestTube2,
  Package,
  Activity,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (route: NavRoute) => void;
  onOpenMobileMenu: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenMobileMenu }) => {
  const {
    equipment,
    calibrationRecords,
    pmTasks,
    chemicals,
    spareParts,
    auditLogs,
    getChemicalCurrentStock,
    getSparePartCurrentStock,
    currentUser
  } = useApp();

  const [activeKpiModal, setActiveKpiModal] = useState<'active' | 'cal-due' | 'pm-due' | 'chem-low' | 'sp-low' | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. KPI Counts
  const activeEquipmentList = equipment.filter(e => e.status === 'active');
  const activeEquipmentCount = activeEquipmentList.length;

  // Calibration due in 30 days or overdue
  const calibrationDueList = equipment.filter(e => {
    if (!e.nextCalibrationDate) return false;
    return e.nextCalibrationDate <= in30Days;
  });
  const calibrationDueCount = calibrationDueList.length;

  // PM Due in 30 days or overdue
  const pmDueList = equipment.filter(e => {
    if (!e.nextPmDate) return false;
    return e.nextPmDate <= in30Days;
  });
  const pmDueCount = pmDueList.length;

  // Chemical low stock list
  const chemicalLowStockList = chemicals.filter(c => getChemicalCurrentStock(c.id) <= c.minimumStock);
  const chemicalLowStockCount = chemicalLowStockList.length;

  // Spare part low stock list
  const sparePartLowStockList = spareParts.filter(sp => getSparePartCurrentStock(sp.id) <= sp.minimumStock);
  const sparePartLowStockCount = sparePartLowStockList.length;

  return (
    <div className="space-y-6">
      <Header
        title="Laboratory Equipment Dashboard"
        subtitle="Real-time lab equipment compliance, calibration alerts, and audit overview"
        icon={LayoutDashboard}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      {/* Row of 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Active Equipment"
          value={activeEquipmentCount}
          subtitle={`Total Assets: ${equipment.length}`}
          icon={Wrench}
          variant="primary"
          badgeText="ISO Operational"
          onClick={() => setActiveKpiModal('active')}
        />

        <KpiCard
          title="Calibration Due (30d)"
          value={calibrationDueCount}
          subtitle={calibrationDueCount > 0 ? 'Click to view pending' : 'All calibrated'}
          icon={Ruler}
          variant={calibrationDueCount > 0 ? 'warning' : 'success'}
          badgeText={calibrationDueCount > 0 ? 'Action Required' : 'On Schedule'}
          onClick={() => setActiveKpiModal('cal-due')}
        />

        <KpiCard
          title="PM Due (30d)"
          value={pmDueCount}
          subtitle={pmDueCount > 0 ? 'Click to view pending' : 'Tasks current'}
          icon={ClipboardList}
          variant={pmDueCount > 0 ? 'warning' : 'success'}
          badgeText={pmDueCount > 0 ? 'Pending PM' : 'Up to date'}
          onClick={() => setActiveKpiModal('pm-due')}
        />

        <KpiCard
          title="Chemicals Low Stock"
          value={chemicalLowStockCount}
          subtitle={chemicalLowStockCount > 0 ? 'Click to view low stock' : 'Stock Healthy'}
          icon={TestTube2}
          variant={chemicalLowStockCount > 0 ? 'error' : 'success'}
          badgeText={chemicalLowStockCount > 0 ? 'Reorder Needed' : 'Stock Healthy'}
          onClick={() => setActiveKpiModal('chem-low')}
        />

        <KpiCard
          title="Spare Parts Low Stock"
          value={sparePartLowStockCount}
          subtitle={sparePartLowStockCount > 0 ? 'Click to view low stock' : 'Adequate'}
          icon={Package}
          variant={sparePartLowStockCount > 0 ? 'error' : 'success'}
          badgeText={sparePartLowStockCount > 0 ? 'Critically Low' : 'Adequate'}
          onClick={() => setActiveKpiModal('sp-low')}
        />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Recently Updated Equipment */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recently Updated Equipment</h3>
                  <p className="text-[11px] text-slate-500">Asset statuses and maintenance updates</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('equipment')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                View All Equipment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {equipment.slice(0, 5).map(eq => (
                <div
                  key={eq.id}
                  onClick={() => onNavigate('equipment')}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{eq.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        {eq.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>Model: {eq.model}</span>
                      <span>•</span>
                      <span>Next Cal: <strong className={eq.nextCalibrationDate && eq.nextCalibrationDate <= in30Days ? 'text-amber-600' : ''}>{eq.nextCalibrationDate || 'N/A'}</strong></span>
                    </div>
                  </div>
                  <StatusBadge status={eq.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Recent Activities Audit Feed */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">System Audit Trail Feed</h3>
                  <p className="text-[11px] text-slate-500">Live activity log from lab technicians & admins</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (currentUser?.role === 'admin') {
                    onNavigate('audit-log');
                  } else {
                    alert('Audit Trail details are available for Admin users in the Audit Log menu.');
                  }
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                Full Trail <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => {
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (log.action === 'create') badgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
                if (log.action === 'update') badgeClass = 'bg-amber-100 text-amber-800 font-bold';
                if (log.action === 'delete') badgeClass = 'bg-red-100 text-red-800 font-bold';

                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      if (currentUser?.role === 'admin') onNavigate('audit-log');
                    }}
                    className={`p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3 ${
                      currentUser?.role === 'admin' ? 'hover:bg-indigo-50/50 cursor-pointer' : ''
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${badgeClass} shrink-0 mt-0.5`}>
                      {log.action}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{log.module}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{log.details}</p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        By: <span className="font-medium text-slate-700">{log.username}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Detail Modals */}
      {/* 1. Active Equipment Modal */}
      <Modal
        isOpen={activeKpiModal === 'active'}
        onClose={() => setActiveKpiModal(null)}
        title="Active Laboratory Equipment Assets"
        subtitle={`Showing ${activeEquipmentCount} active equipment items in ISO operational status`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Click any item or open full view</span>
            <button
              onClick={() => {
                setActiveKpiModal(null);
                onNavigate('equipment');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Open Full Equipment List <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {activeEquipmentList.map(eq => (
              <div
                key={eq.id}
                onClick={() => {
                  setActiveKpiModal(null);
                  onNavigate('equipment');
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{eq.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{eq.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Model: {eq.model} | Serial: {eq.serialNumber}</p>
                </div>
                <StatusBadge status={eq.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 2. Calibration Due Modal */}
      <Modal
        isOpen={activeKpiModal === 'cal-due'}
        onClose={() => setActiveKpiModal(null)}
        title="Equipment Pending Calibration (Due in 30 Days / Overdue)"
        subtitle={`${calibrationDueCount} items require calibration inspection or certificate logging`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Pending calibration review list</span>
            <button
              onClick={() => {
                setActiveKpiModal(null);
                onNavigate('calibration');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Go to Calibration Records <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {calibrationDueList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No calibration items due within 30 days.</p>
            ) : (
              calibrationDueList.map(eq => {
                const isOverdue = eq.nextCalibrationDate && eq.nextCalibrationDate < todayStr;
                return (
                  <div
                    key={eq.id}
                    onClick={() => {
                      setActiveKpiModal(null);
                      onNavigate('calibration');
                    }}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{eq.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold">{eq.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Model: {eq.model} | Serial: {eq.serialNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        isOverdue ? 'bg-red-100 text-red-800 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        Due: {eq.nextCalibrationDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* 3. PM Due Modal */}
      <Modal
        isOpen={activeKpiModal === 'pm-due'}
        onClose={() => setActiveKpiModal(null)}
        title="Equipment Pending Preventative Maintenance (PM)"
        subtitle={`${pmDueCount} items due for maintenance checklist execution`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Preventative maintenance schedules</span>
            <button
              onClick={() => {
                setActiveKpiModal(null);
                onNavigate('pm-checklist');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Go to PM Checklist <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {pmDueList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No PM items due within 30 days.</p>
            ) : (
              pmDueList.map(eq => {
                const isOverdue = eq.nextPmDate && eq.nextPmDate < todayStr;
                return (
                  <div
                    key={eq.id}
                    onClick={() => {
                      setActiveKpiModal(null);
                      onNavigate('pm-checklist');
                    }}
                    className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{eq.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-900 font-bold">{eq.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Model: {eq.model} | Serial: {eq.serialNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        isOverdue ? 'bg-red-100 text-red-800 border-red-300' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      }`}>
                        <ClipboardList className="w-3 h-3" />
                        Next PM: {eq.nextPmDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* 4. Chemical Low Stock Modal */}
      <Modal
        isOpen={activeKpiModal === 'chem-low'}
        onClose={() => setActiveKpiModal(null)}
        title="Low Stock Chemical Reagents"
        subtitle={`${chemicalLowStockCount} chemical items at or below minimum threshold`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Reagent reorder requirements</span>
            <button
              onClick={() => {
                setActiveKpiModal(null);
                onNavigate('chemicals');
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Go to Chemical Inventory <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {chemicalLowStockList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">All chemical stock levels are healthy.</p>
            ) : (
              chemicalLowStockList.map(c => {
                const curStock = getChemicalCurrentStock(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveKpiModal(null);
                      onNavigate('chemicals');
                    }}
                    className="p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{c.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-200/60 text-red-900 font-bold">{c.casNumber || c.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Grade: {c.grade} | Location: {c.storageLocation}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                        <AlertTriangle className="w-3 h-3" />
                        Stock: {curStock} / Min: {c.minimumStock} {c.unit}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* 5. Spare Parts Low Stock Modal */}
      <Modal
        isOpen={activeKpiModal === 'sp-low'}
        onClose={() => setActiveKpiModal(null)}
        title="Low Stock Spare Parts & Components"
        subtitle={`${sparePartLowStockCount} spare part items at or below minimum threshold`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Critical parts reorder alerts</span>
            <button
              onClick={() => {
                setActiveKpiModal(null);
                onNavigate('spare-parts');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Go to Spare Parts Inventory <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sparePartLowStockList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">All spare parts stock levels are healthy.</p>
            ) : (
              sparePartLowStockList.map(sp => {
                const curStock = getSparePartCurrentStock(sp.id);
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setActiveKpiModal(null);
                      onNavigate('spare-parts');
                    }}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{sp.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200/60 text-rose-900 font-bold">{sp.partNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Compatible Eq: {sp.compatibleEquipmentId || 'General'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3 h-3" />
                        Stock: {curStock} / Min: {sp.minimumStock} {sp.unit}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
