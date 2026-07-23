import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { AuditLog } from '../../types';
import { History, ShieldCheck, Filter, User, Clock } from 'lucide-react';

interface AuditLogViewProps {
  onOpenMobileMenu: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onOpenMobileMenu }) => {
  const { auditLogs } = useApp();

  const [filterModule, setFilterModule] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  // Unique modules & users for filter dropdowns
  const modules = Array.from(new Set(auditLogs.map(a => a.module)));
  const usernames = Array.from(new Set(auditLogs.map(a => a.username)));

  const filteredLogs = auditLogs.filter(a => {
    if (filterModule !== 'all' && a.module !== filterModule) return false;
    if (filterUser !== 'all' && a.username !== filterUser) return false;
    if (filterAction !== 'all' && a.action !== filterAction) return false;
    return true;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: a => (
        <span className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {a.timestamp}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action',
      accessor: a => {
        let badgeClass = 'bg-slate-100 text-slate-700';
        if (a.action === 'create') badgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
        if (a.action === 'update') badgeClass = 'bg-amber-100 text-amber-800 font-bold';
        if (a.action === 'delete') badgeClass = 'bg-red-100 text-red-800 font-bold';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border border-slate-200 ${badgeClass}`}>
            {a.action}
          </span>
        );
      }
    },
    {
      key: 'module',
      header: 'Module & Entity',
      accessor: a => (
        <div>
          <span className="font-bold text-slate-900 block">{a.module}</span>
          <span className="text-[10px] font-mono text-slate-500">{a.entityType} ({a.entityId})</span>
        </div>
      )
    },
    {
      key: 'username',
      header: 'User Account',
      accessor: a => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-800 text-xs">{a.username}</span>
          <span className="text-[10px] text-slate-400 uppercase">({a.userRole})</span>
        </div>
      )
    },
    {
      key: 'details',
      header: 'Audit Trace Details',
      accessor: a => <span className="text-slate-700 text-xs">{a.details}</span>,
      searchValue: a => `${a.details} ${a.entityId} ${a.username} ${a.module}`
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="System Compliance Audit Trail"
        subtitle="Immutable ISO/GMP automated audit log tracking every user action, record creation, modification, and deletion"
        icon={History}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      {/* Compliance Information Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">21 CFR Part 11 & ISO 17025 Audit Logging</h4>
            <p className="text-xs text-slate-300">
              Audit log entries are generated automatically by the core database context upon every transaction.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
          7-Year Retention Active
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold uppercase text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" /> Filter Logs:
        </div>

        {/* Module Filter */}
        <select
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">All System Modules ({modules.length})</option>
          {modules.map(m => (
            <option key={m} value={m}>
              Module: {m}
            </option>
          ))}
        </select>

        {/* User Filter */}
        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">All Users ({usernames.length})</option>
          {usernames.map(u => (
            <option key={u} value={u}>
              User: {u}
            </option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">All Actions (Create / Update / Delete)</option>
          <option value="create">CREATE Only</option>
          <option value="update">UPDATE Only</option>
          <option value="delete">DELETE Only</option>
        </select>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={a => a.id}
        title="Audit Trail Records"
        subtitle="Chronological compliance timeline"
        exportFileName="LEMS_System_Audit_Trail.csv"
      />
    </div>
  );
};
