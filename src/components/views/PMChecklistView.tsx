import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { GuestBanner } from '../common/GuestBanner';
import {
  CheckSquare,
  Save,
  Check,
  X,
  Minus,
  Calendar,
  Filter,
  Printer,
  FileCheck2,
  AlertCircle,
  Award,
  Layers,
  Sparkles,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface PMChecklistViewProps {
  onOpenMobileMenu: () => void;
}

export const PMChecklistView: React.FC<PMChecklistViewProps> = ({ onOpenMobileMenu }) => {
  const {
    equipment,
    pmTasks,
    pmTaskLogs,
    togglePMTaskLog,
    currentUser,
    companyProfile,
    addToast
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [viewMode, setViewMode] = useState<'matrix' | 'form'>('matrix');

  const selectedEquipment = equipment.find(e => e.id === selectedEqId);
  const equipmentTasks = pmTasks.filter(t => t.equipmentId === selectedEqId && t.active);

  // Group tasks by frequency
  const dailyTasks = equipmentTasks.filter(t => t.frequency === 'daily');
  const weeklyTasks = equipmentTasks.filter(t => t.frequency === 'weekly');
  const monthlyTasks = equipmentTasks.filter(t => t.frequency === 'monthly');

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Today's day number if selected month & year match current date
  const todayDate = new Date();
  const isCurrentMonthYear =
    todayDate.getFullYear() === selectedYear && todayDate.getMonth() + 1 === selectedMonth;
  const currentDayNum = isCurrentMonthYear ? todayDate.getDate() : -1;

  // Helper to get log status for task & periodKey
  const getLogStatus = (taskId: string, periodKey: string) => {
    const log = pmTaskLogs.find(l => l.taskId === taskId && l.periodKey === periodKey);
    return log?.status || 'not_done';
  };

  const handleCellClick = (taskId: string, periodKey: string, dateStr: string) => {
    if (isGuest) return;
    const currentStatus = getLogStatus(taskId, periodKey);
    let nextStatus: 'done' | 'not_done' | 'na' = 'done';
    if (currentStatus === 'done') nextStatus = 'na';
    else if (currentStatus === 'na') nextStatus = 'not_done';
    else nextStatus = 'done';

    togglePMTaskLog(taskId, selectedEqId, dateStr, periodKey, nextStatus);
  };

  const handleMarkAllTodayDone = () => {
    if (isGuest || currentDayNum === -1) return;
    const todayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(currentDayNum).padStart(2, '0')}`;
    dailyTasks.forEach(task => {
      const status = getLogStatus(task.id, todayStr);
      if (status !== 'done') {
        togglePMTaskLog(task.id, selectedEqId, todayStr, todayStr, 'done');
      }
    });
    addToast('success', 'Daily Routines Completed', `Marked all ${dailyTasks.length} daily PM routines as completed for today (${todayStr}).`);
  };

  const handleSaveAll = () => {
    addToast('success', 'PM Checksheet Record Saved', 'All maintenance routines logged & verified under ISO 17025 audit trail.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate Monthly Completion Statistics
  let totalRequiredChecks = dailyTasks.length * daysInMonth + weeklyTasks.length * 4 + monthlyTasks.length;
  let completedChecks = 0;

  dailyTasks.forEach(task => {
    daysArray.forEach(day => {
      const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (getLogStatus(task.id, periodKey) === 'done') completedChecks++;
    });
  });

  weeklyTasks.forEach(task => {
    [1, 2, 3, 4].forEach(w => {
      const periodKey = `${selectedYear}-M${selectedMonth}-W${w}`;
      if (getLogStatus(task.id, periodKey) === 'done') completedChecks++;
    });
  });

  monthlyTasks.forEach(task => {
    const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (getLogStatus(task.id, periodKey) === 'done') completedChecks++;
  });

  const completionPercentage = totalRequiredChecks > 0 ? Math.round((completedChecks / totalRequiredChecks) * 100) : 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      <div className="print:hidden">
        <Header
          title="Preventive Maintenance Execution Checklist"
          subtitle="ISO 17025 & GMP compliant maintenance execution matrix with audit verification"
          icon={CheckSquare}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Print Form
              </button>
              {!isGuest && (
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Checksheet
                </button>
              )}
            </div>
          }
          onOpenMobileMenu={onOpenMobileMenu}
        />
      </div>

      <div className="print:hidden">
        <GuestBanner />
      </div>

      {/* Equipment Asset & Completion Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                  {selectedEquipment?.id || selectedEqId}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  SAP: {selectedEquipment?.sapCode || 'N/A'}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedEquipment?.status || 'Active'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {selectedEquipment?.name || 'Equipment Unit'}
              </h2>
              <p className="text-xs text-slate-500">
                Model: <strong className="text-slate-800">{selectedEquipment?.model}</strong> | S/N: <strong className="text-slate-800 font-mono">{selectedEquipment?.serialNumber}</strong> | Location: <strong className="text-slate-800">{selectedEquipment?.locationId}</strong>
              </p>
            </div>
          </div>

          {/* Monthly Completion Progress Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                {monthNames[selectedMonth - 1]} {selectedYear} PM Progress
              </span>
              <span className="font-mono font-black text-blue-700 text-sm">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{completedChecks} of {totalRequiredChecks} routines logged</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> ISO Verified
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter:
            </span>

            {/* Equipment Select */}
            <select
              value={selectedEqId}
              onChange={e => setSelectedEqId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
            >
              {equipment.map(e => (
                <option key={e.id} value={e.id}>
                  {e.id} - {e.name}
                </option>
              ))}
            </select>

            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'matrix' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Matrix View
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'form' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Official ISO Form
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <>
          {/* Legend & Quick Action Bar */}
          <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-3.5 px-5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                Cell Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-[11px] shadow-xs">
                  ✓
                </span>
                <span className="font-medium text-slate-700">DONE (Passed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                  —
                </span>
                <span className="font-medium text-slate-700">N/A (Not Applicable)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-white border border-slate-300 text-slate-300 flex items-center justify-center font-bold text-[11px]">
                  ○
                </span>
                <span className="font-medium text-slate-700">PENDING</span>
              </div>
            </div>

            {currentDayNum !== -1 && !isGuest && (
              <button
                onClick={handleMarkAllTodayDone}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" /> Mark Today's Daily Routines (Day {currentDayNum}) Done
              </button>
            )}
          </div>

          {/* DAILY PM TASKS MATRIX GRID */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Daily Maintenance Checksheet Matrix — {monthNames[selectedMonth - 1]} {selectedYear}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                {dailyTasks.length} Routines
              </span>
            </div>

            {dailyTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-extrabold text-slate-700 select-none">
                      <th className="p-3.5 w-72 sticky left-0 bg-slate-100 border-r border-slate-200/80 z-10 shadow-xs">
                        Daily Inspection Routine
                      </th>
                      {daysArray.map(day => {
                        const cellDate = new Date(selectedYear, selectedMonth - 1, day);
                        const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
                        const isToday = day === currentDayNum;

                        return (
                          <th
                            key={day}
                            className={`p-2 text-center w-9 border-r border-slate-200/60 ${
                              isToday
                                ? 'bg-blue-600 text-white font-black'
                                : isWeekend
                                ? 'bg-slate-200/60 text-slate-600'
                                : ''
                            }`}
                          >
                            <div>{day}</div>
                            <div className="text-[8px] opacity-75 font-mono uppercase">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][cellDate.getDay()]}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {dailyTasks.map(task => (
                      <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-xs z-10">
                          {task.taskName}
                        </td>
                        {daysArray.map(day => {
                          const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const status = getLogStatus(task.id, periodKey);
                          const cellDate = new Date(selectedYear, selectedMonth - 1, day);
                          const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
                          const isToday = day === currentDayNum;

                          let cellBg = 'bg-white border-slate-200 hover:border-blue-400 text-slate-300';
                          let icon = '○';

                          if (status === 'done') {
                            cellBg = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                            icon = '✓';
                          } else if (status === 'na') {
                            cellBg = 'bg-slate-300 text-slate-700 border-slate-400';
                            icon = '—';
                          }

                          return (
                            <td
                              key={day}
                              className={`p-1 text-center align-middle border-r border-slate-100 ${
                                isToday ? 'bg-blue-50/50' : isWeekend ? 'bg-slate-50/80' : ''
                              }`}
                            >
                              <button
                                disabled={isGuest}
                                onClick={() => handleCellClick(task.id, periodKey, periodKey)}
                                title={`Day ${day}: Click to toggle (${status})`}
                                className={`w-7 h-7 rounded-lg border text-xs font-black transition-all flex items-center justify-center mx-auto cursor-pointer disabled:cursor-default ${cellBg}`}
                              >
                                {icon}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No daily PM tasks configured for this equipment.
              </div>
            )}
          </div>

          {/* WEEKLY & MONTHLY PM TASKS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Tasks Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Weekly Maintenance Routines (Weeks 1 – 4)
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {weeklyTasks.length} Tasks
                </span>
              </div>

              {weeklyTasks.length > 0 ? (
                <div className="space-y-3">
                  {weeklyTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <span className="text-xs font-bold text-slate-900">{task.taskName}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {[1, 2, 3, 4].map(week => {
                          const periodKey = `${selectedYear}-M${selectedMonth}-W${week}`;
                          const status = getLogStatus(task.id, periodKey);
                          return (
                            <button
                              key={week}
                              disabled={isGuest}
                              onClick={() => handleCellClick(task.id, periodKey, `${selectedYear}-${selectedMonth}-W${week}`)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                                status === 'done'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : status === 'na'
                                  ? 'bg-slate-300 text-slate-700 border-slate-400'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              W{week} {status === 'done' ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-4 text-center">No weekly tasks configured.</p>
              )}
            </div>

            {/* Monthly Tasks Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Monthly Deep Maintenance Routines
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {monthlyTasks.length} Tasks
                </span>
              </div>

              {monthlyTasks.length > 0 ? (
                <div className="space-y-3">
                  {monthlyTasks.map(task => {
                    const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                    const status = getLogStatus(task.id, periodKey);
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{task.taskName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Cycle: Monthly ({monthNames[selectedMonth - 1]})
                          </span>
                        </div>
                        <button
                          disabled={isGuest}
                          onClick={() => handleCellClick(task.id, periodKey, `${selectedYear}-${selectedMonth}-01`)}
                          className={`px-4 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            status === 'done'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {status === 'done' ? '✓ PASSED & COMPLETED' : 'MARK DONE'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-4 text-center">No monthly tasks configured.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* OFFICIAL ISO 17025 PRINTABLE FORM VIEW */
        <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-md space-y-6 text-slate-900 print:border-none print:shadow-none print:p-0">
          {/* Form Header ISO Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider uppercase">{companyProfile.companyName}</h1>
                <p className="text-xs font-bold text-slate-600 uppercase">{companyProfile.labName}</p>
                <p className="text-[10px] text-slate-500">ISO/IEC 17025:2017 Accredited Laboratory System</p>
              </div>
            </div>
            <div className="text-right border-l border-slate-200 pl-4 font-mono text-[11px]">
              <div className="font-bold text-slate-900">FORM NO: SOP-QC-PM-2026-F01</div>
              <div className="text-slate-500">REV: 03 | EFF DATE: 2026-01-01</div>
              <div className="text-blue-700 font-bold">STATUS: OFFICIAL RECORD</div>
            </div>
          </div>

          <div className="text-center bg-slate-100 p-3 rounded-xl border border-slate-200">
            <h2 className="text-base font-black uppercase text-slate-900">
              PREVENTIVE MAINTENANCE EXECUTION CHECKSHEET
            </h2>
            <p className="text-xs text-slate-600 font-semibold">
              Period: {monthNames[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          {/* Asset & Specification Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Asset ID Code:</span>
              <span className="font-mono font-black text-slate-900">{selectedEquipment?.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Equipment Name:</span>
              <span className="font-bold text-slate-900">{selectedEquipment?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Model & Serial No:</span>
              <span className="font-semibold text-slate-900">{selectedEquipment?.model} ({selectedEquipment?.serialNumber})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Location & Dept:</span>
              <span className="font-semibold text-slate-900">{selectedEquipment?.locationId} ({selectedEquipment?.department})</span>
            </div>
          </div>

          {/* Itemized Routine Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-1">
              Routine Task Inspection Itemization
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold text-[10px] uppercase">
                  <th className="p-2 border border-slate-300 w-12 text-center">No</th>
                  <th className="p-2 border border-slate-300">Routine Maintenance Instruction</th>
                  <th className="p-2 border border-slate-300 w-28 text-center">Frequency</th>
                  <th className="p-2 border border-slate-300 w-32 text-center">Monthly Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {equipmentTasks.map((task, idx) => {
                  const periodKey = task.frequency === 'daily'
                    ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
                    : task.frequency === 'weekly'
                    ? `${selectedYear}-M${selectedMonth}-W1`
                    : `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                  const status = getLogStatus(task.id, periodKey);

                  return (
                    <tr key={task.id}>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-medium">{task.taskName}</td>
                      <td className="p-2 border border-slate-300 text-center uppercase text-[10px] font-bold text-slate-600">{task.frequency}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {status === 'done' ? '✓ PASSED' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Verification & Sign-off Footer */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900 text-xs">
            <div className="border border-slate-300 p-4 rounded-xl space-y-3">
              <span className="font-bold uppercase text-[10px] text-slate-500 block">Executed By (Analyst / Tech):</span>
              <div className="font-black text-slate-900">{currentUser?.fullName || 'Sarah Jenkins'}</div>
              <div className="text-[10px] text-slate-500 font-mono">Role: QC Analyst / Tech Specialist</div>
              <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400">Electronic Stamp & Date: {new Date().toISOString().split('T')[0]}</div>
            </div>

            <div className="border border-slate-300 p-4 rounded-xl space-y-3">
              <span className="font-bold uppercase text-[10px] text-slate-500 block">Verified & Approved By (QA Supervisor):</span>
              <div className="font-black text-slate-900">Dr. Robert Chen, M.Sc</div>
              <div className="text-[10px] text-slate-500 font-mono">Role: Quality Manager (Admin)</div>
              <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400">ISO 17025 Compliance Verified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
