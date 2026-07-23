import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { GuestBanner } from '../common/GuestBanner';
import { PMTask, PMFrequency } from '../../types';
import { ClipboardList, Plus, Save, Trash2, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface PMTaskSetupViewProps {
  onOpenMobileMenu: () => void;
}

export const PMTaskSetupView: React.FC<PMTaskSetupViewProps> = ({ onOpenMobileMenu }) => {
  const {
    pmTasks,
    equipment,
    addPMTask,
    updatePMTask,
    deletePMTask,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');

  // Form State
  const [editingTask, setEditingTask] = useState<PMTask | null>(null);
  const [taskName, setTaskName] = useState('');
  const [frequency, setFrequency] = useState<PMFrequency>('daily');
  const [active, setActive] = useState(true);

  const selectedEquipment = equipment.find(e => e.id === selectedEqId);
  const filteredTasks = pmTasks.filter(t => t.equipmentId === selectedEqId);

  const handleSelectTask = (t: PMTask) => {
    setEditingTask(t);
    setTaskName(t.taskName);
    setFrequency(t.frequency);
    setActive(t.active);
  };

  const handleClearForm = () => {
    setEditingTask(null);
    setTaskName('');
    setFrequency('daily');
    setActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest || !selectedEqId) return;

    if (editingTask) {
      updatePMTask({
        ...editingTask,
        taskName,
        frequency,
        active
      });
    } else {
      addPMTask({
        equipmentId: selectedEqId,
        taskName,
        frequency,
        active
      });
    }
    handleClearForm();
  };

  const columns: Column<PMTask>[] = [
    {
      key: 'taskName',
      header: 'PM Task Name',
      accessor: t => <span className="font-bold text-slate-900">{t.taskName}</span>
    },
    {
      key: 'frequency',
      header: 'Frequency',
      accessor: t => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
          {t.frequency}
        </span>
      )
    },
    {
      key: 'active',
      header: 'Task Status',
      accessor: t => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            t.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {t.active ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
          {t.active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Preventive Maintenance Task Setup"
        subtitle="Configure recurring maintenance check routines (daily, weekly, monthly, quarterly, yearly)"
        icon={ClipboardList}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Equipment Selector Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Select Target Equipment Asset:</h3>
            <p className="text-xs text-slate-500">
              {selectedEquipment ? `${selectedEquipment.name} (${selectedEquipment.model})` : 'Select equipment below'}
            </p>
          </div>
        </div>

        <select
          value={selectedEqId}
          onChange={e => {
            setSelectedEqId(e.target.value);
            handleClearForm();
          }}
          className="w-full sm:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
        >
          {equipment.map(e => (
            <option key={e.id} value={e.id}>
              {e.id} - {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task Table */}
        <div className="lg:col-span-7">
          <DataTable
            data={filteredTasks}
            columns={columns}
            keyExtractor={t => t.id}
            title={`PM Tasks for ${selectedEqId}`}
            subtitle="Click any task below to edit configuration"
            onRowClick={handleSelectTask}
            emptyMessage={`No PM tasks configured for ${selectedEqId} yet.`}
          />
        </div>

        {/* Right Column: Task Form */}
        {!isGuest && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingTask ? `Edit Task: ${editingTask.taskName}` : '➕ Add New PM Routine Task'}
                </h3>
                {editingTask && (
                  <button
                    onClick={handleClearForm}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    + Add New Task
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    PM Task Name / Instruction *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                    placeholder="e.g. Clean GC inlet liner & replace septum"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Recurrence Frequency *
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as PMFrequency)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="taskActive"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="taskActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Enable Task Active Status
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  {editingTask && (
                    <button
                      type="button"
                      onClick={() => {
                        deletePMTask(editingTask.id);
                        handleClearForm();
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Task
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Task Routine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
