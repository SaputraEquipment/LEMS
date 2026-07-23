import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { GuestBanner } from '../common/GuestBanner';
import { CheckSquare, Save, Check, X, Minus, Calendar, Filter } from 'lucide-react';

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
    addToast
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // July

  const selectedEquipment = equipment.find(e => e.id === selectedEqId);
  const equipmentTasks = pmTasks.filter(t => t.equipmentId === selectedEqId && t.active);

  // Group tasks by frequency
  const dailyTasks = equipmentTasks.filter(t => t.frequency === 'daily');
  const weeklyTasks = equipmentTasks.filter(t => t.frequency === 'weekly');
  const monthlyTasks = equipmentTasks.filter(t => t.frequency === 'monthly');

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  const handleSaveAll = () => {
    addToast('success', 'PM Checklist Saved', 'All checklist entries recorded in audit log.');
  };

  return (
    <div className="space-y-6">
      <Header
        title="Preventive Maintenance Execution Checklist"
        subtitle="Interactive tick-style matrix for daily, weekly, and monthly equipment maintenance routines"
        icon={CheckSquare}
        actions={
          !isGuest ? (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Checklist Logs
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Filter Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">PM Checksheet Filter</h3>
            <p className="text-xs text-slate-500">
              {selectedEquipment ? `${selectedEquipment.name} (${selectedEquipment.id})` : 'Select equipment'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Equipment Dropdown */}
          <select
            value={selectedEqId}
            onChange={e => setSelectedEqId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
          >
            {equipment.map(e => (
              <option key={e.id} value={e.id}>
                {e.id} - {e.name}
              </option>
            ))}
          </select>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>

          {/* Year Dropdown */}
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
      </div>

      {/* Legend Bar */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 px-5 text-xs text-slate-600 flex flex-wrap items-center gap-6">
        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
          Checksheet Cell Legend:
        </span>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span>DONE (Passed PM)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
            —
          </span>
          <span>N/A (Not Applicable)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white border border-slate-300 text-slate-300 flex items-center justify-center font-bold text-[10px]">
            ○
          </span>
          <span>NOT DONE (Pending)</span>
        </div>
      </div>

      {/* DAILY PM TASKS MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Daily Checksheet Matrix — {selectedYear}-{String(selectedMonth).padStart(2, '0')}
          </h3>
          <span className="text-xs text-slate-500">
            {dailyTasks.length} Daily Routines
          </span>
        </div>

        {dailyTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold text-slate-600 select-none">
                  <th className="p-3 w-64 sticky left-0 bg-slate-100 border-r border-slate-200">
                    Daily Task Routine
                  </th>
                  {daysArray.map(day => (
                    <th key={day} className="p-2 text-center w-8 border-r border-slate-200/60">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {dailyTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-xs">
                      {task.taskName}
                    </td>
                    {daysArray.map(day => {
                      const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const status = getLogStatus(task.id, periodKey);

                      let cellBg = 'bg-white border-slate-200 hover:border-blue-400 text-slate-300';
                      let icon = '○';

                      if (status === 'done') {
                        cellBg = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                        icon = '✓';
                      } else if (status === 'na') {
                        cellBg = 'bg-slate-200 text-slate-600 border-slate-300';
                        icon = '—';
                      }

                      return (
                        <td key={day} className="p-1 text-center align-middle border-r border-slate-100">
                          <button
                            disabled={isGuest}
                            onClick={() => handleCellClick(task.id, periodKey, periodKey)}
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
            No daily PM tasks configured for this equipment. Configure tasks in PM Task Setup.
          </div>
        )}
      </div>

      {/* WEEKLY & MONTHLY PM TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Weekly Maintenance Tasks (Weeks 1 - 4)
          </h3>
          {weeklyTasks.length > 0 ? (
            <div className="space-y-3">
              {weeklyTasks.map(task => (
                <div key={task.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-800">{task.taskName}</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map(week => {
                      const periodKey = `${selectedYear}-M${selectedMonth}-W${week}`;
                      const status = getLogStatus(task.id, periodKey);
                      return (
                        <button
                          key={week}
                          disabled={isGuest}
                          onClick={() => handleCellClick(task.id, periodKey, `${selectedYear}-${selectedMonth}-W${week}`)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            status === 'done' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border-slate-200'
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
            <p className="text-xs text-slate-400">No weekly tasks configured.</p>
          )}
        </div>

        {/* Monthly Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Monthly Maintenance Tasks
          </h3>
          {monthlyTasks.length > 0 ? (
            <div className="space-y-3">
              {monthlyTasks.map(task => {
                const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                const status = getLogStatus(task.id, periodKey);
                return (
                  <div key={task.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800">{task.taskName}</span>
                    <button
                      disabled={isGuest}
                      onClick={() => handleCellClick(task.id, periodKey, `${selectedYear}-${selectedMonth}-01`)}
                      className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        status === 'done' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {status === 'done' ? '✓ DONE' : 'MARK DONE'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No monthly tasks configured.</p>
          )}
        </div>
      </div>
    </div>
  );
};
