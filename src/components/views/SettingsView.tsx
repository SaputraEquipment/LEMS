import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { SqliteInspector } from '../common/SqliteInspector';
import { Settings as SettingsIcon, Save, Download, Upload, RotateCcw, Building2, ShieldCheck, Database, AlertTriangle } from 'lucide-react';

interface SettingsViewProps {
  onOpenMobileMenu: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenMobileMenu }) => {
  const {
    companyProfile,
    updateCompanyProfile,
    exportDatabase,
    importDatabase,
    resetToSeedData,
    addToast
  } = useApp();

  const [labName, setLabName] = useState(companyProfile?.labName || 'Quality Department');
  const [calAlertDays, setCalAlertDays] = useState(30);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [jsonInput, setJsonInput] = useState('');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({
      ...companyProfile,
      labName
    });
    addToast('success', 'Preferences Updated', 'Laboratory system parameters saved.');
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      addToast('error', 'Import Failed', 'Please paste valid JSON or choose a file.');
      return;
    }
    const success = importDatabase(jsonInput);
    if (success) {
      setJsonInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Header
        title="System Administration & Database Backup"
        subtitle="Manage laboratory parameters, export/import full JSON database backups, and maintain system compliance"
        icon={SettingsIcon}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: System Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Laboratory Organization & Alert Parameters</h3>
              <p className="text-xs text-slate-500">Configure global alert lead times and facility details</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Facility / Laboratory Name
              </label>
              <input
                type="text"
                required
                value={labName}
                onChange={e => setLabName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Calibration Due Window (Days)
                </label>
                <input
                  type="number"
                  required
                  value={calAlertDays}
                  onChange={e => setCalAlertDays(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">Triggers "Due Soon" badge in dashboard.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Default Reorder Threshold
                </label>
                <input
                  type="number"
                  required
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default safety stock for new items.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save General Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Database Backup, Restore & Reset */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Database Backup, Restore & Reset</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px] flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SQLite Active (database.sqlite)
                </span>
              </div>
              <p className="text-xs text-slate-500">Persistent disk storage backed by SQLite engine</p>
            </div>
          </div>

          {/* Export Database Button */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" /> Export LEMS Database Backup
            </h4>
            <p className="text-xs text-slate-500">
              Downloads complete JSON dump containing equipment, calibrations, PM routines, chemical ledgers, spare parts, and audit logs.
            </p>
            <button
              onClick={exportDatabase}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Backup JSON File
            </button>
          </div>

          {/* Import / Restore Database */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" /> Import Database JSON
            </h4>
            <div className="space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <textarea
                rows={3}
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder="Or paste database JSON content directly here..."
                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
              <button
                onClick={handleImportJson}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Restore Database From JSON
              </button>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
            <h4 className="text-xs font-bold text-red-800 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Reset System to Initial Seed Data
            </h4>
            <p className="text-xs text-red-700">
              Wipes all user edits and restores pre-loaded tobacco QA laboratory demonstration data.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all LEMS data to factory seed data? This cannot be undone.')) {
                  resetToSeedData();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset To Initial Seed Data
            </button>
          </div>
        </div>
      </div>

      {/* SQLite Database Mockup & Inspector */}
      <SqliteInspector />
    </div>
  );
};
