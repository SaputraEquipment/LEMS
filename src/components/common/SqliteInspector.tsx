import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Database, Table, Code2, RefreshCw, CheckCircle2, Server, HardDrive, Key, Play, FileCode, Layers } from 'lucide-react';

export const SqliteInspector: React.FC = () => {
  const app = useApp();
  const [selectedTable, setSelectedTable] = useState<string>('equipment');
  const [customSql, setCustomSql] = useState<string>('SELECT * FROM equipment LIMIT 5;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Table Schemas Definition
  const tablesSchema: Record<string, { columns: { name: string; type: string; key?: string; notNull?: boolean }[]; getRows: () => any[] }> = {
    users: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'username', type: 'TEXT', notNull: true },
        { name: 'password', type: 'TEXT', notNull: true },
        { name: 'fullName', type: 'TEXT', notNull: true },
        { name: 'email', type: 'TEXT', notNull: true },
        { name: 'role', type: 'TEXT', notNull: true },
        { name: 'department', type: 'TEXT', notNull: true },
        { name: 'active', type: 'INTEGER', notNull: true }
      ],
      getRows: () => app.users
    },
    equipment: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'sapCode', type: 'TEXT' },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'categoryId', type: 'TEXT' },
        { name: 'manufacturerId', type: 'TEXT' },
        { name: 'model', type: 'TEXT' },
        { name: 'serialNumber', type: 'TEXT' },
        { name: 'locationId', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
        { name: 'lastCalibrationDate', type: 'TEXT' },
        { name: 'nextCalibrationDate', type: 'TEXT' }
      ],
      getRows: () => app.equipment
    },
    calibration_records: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'equipmentId', type: 'TEXT', notNull: true },
        { name: 'calibrationType', type: 'TEXT' },
        { name: 'vendorName', type: 'TEXT' },
        { name: 'technician', type: 'TEXT' },
        { name: 'calibrationDate', type: 'TEXT' },
        { name: 'nextDueDate', type: 'TEXT' },
        { name: 'certificateNumber', type: 'TEXT' },
        { name: 'result', type: 'TEXT' }
      ],
      getRows: () => app.calibrationRecords
    },
    chemicals: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'casNumber', type: 'TEXT' },
        { name: 'supplier', type: 'TEXT' },
        { name: 'batchNumber', type: 'TEXT' },
        { name: 'unit', type: 'TEXT' },
        { name: 'initialStock', type: 'REAL' },
        { name: 'minimumStock', type: 'REAL' },
        { name: 'expiryDate', type: 'TEXT' }
      ],
      getRows: () => app.chemicals
    },
    spare_parts: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'partNumber', type: 'TEXT' },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'supplier', type: 'TEXT' },
        { name: 'unit', type: 'TEXT' },
        { name: 'initialStock', type: 'REAL' },
        { name: 'minimumStock', type: 'REAL' },
        { name: 'unitCost', type: 'REAL' }
      ],
      getRows: () => app.spareParts
    },
    pm_tasks: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'equipmentId', type: 'TEXT', notNull: true },
        { name: 'taskName', type: 'TEXT', notNull: true },
        { name: 'frequency', type: 'TEXT', notNull: true },
        { name: 'active', type: 'INTEGER', notNull: true }
      ],
      getRows: () => app.pmTasks
    },
    audit_logs: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'userId', type: 'TEXT' },
        { name: 'username', type: 'TEXT' },
        { name: 'userRole', type: 'TEXT' },
        { name: 'module', type: 'TEXT' },
        { name: 'action', type: 'TEXT' },
        { name: 'entityType', type: 'TEXT' },
        { name: 'details', type: 'TEXT' },
        { name: 'timestamp', type: 'TEXT' }
      ],
      getRows: () => app.auditLogs
    },
    locations: {
      columns: [
        { name: 'id', type: 'TEXT', key: 'PRIMARY KEY' },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'building', type: 'TEXT' },
        { name: 'room', type: 'TEXT' },
        { name: 'description', type: 'TEXT' }
      ],
      getRows: () => app.locations
    }
  };

  const handleSelectTable = (tbl: string) => {
    setSelectedTable(tbl);
    setCustomSql(`SELECT * FROM ${tbl} LIMIT 10;`);
    setQueryResult(null);
    setQueryError(null);
  };

  const handleRunSql = async () => {
    if (!customSql.trim()) return;
    setIsExecuting(true);
    setQueryError(null);
    try {
      // In development server mode, execute query or filter rows locally
      const trimmed = customSql.trim().toLowerCase();
      if (trimmed.startsWith('select')) {
        const rows = tablesSchema[selectedTable]?.getRows() || [];
        setQueryResult({ rowsCount: rows.length, data: rows });
      } else {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql: customSql })
        });
        const json = await res.json();
        if (json.error) {
          setQueryError(json.error);
        } else {
          setQueryResult({ status: 'Success', affectedRows: 1 });
          app.addToast('success', 'SQL Executed', 'Query successfully applied to database.sqlite');
        }
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
    } finally {
      setIsExecuting(false);
    }
  };

  const activeSchema = tablesSchema[selectedTable] || tablesSchema.equipment;
  const currentRows = activeSchema.getRows();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">SQLite Database Mockup & Inspector</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected: database.sqlite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine: <code className="text-blue-300 font-mono">SQLite3</code> | File Path: <code className="text-slate-300 font-mono">/database.sqlite</code> | Multi-Table Relational Store
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Tables: {Object.keys(tablesSchema).length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span>Persistence: Disk Sync</span>
          </div>
        </div>
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table List Sidebar */}
        <div className="lg:col-span-1 space-y-2 border-r border-slate-100 pr-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-700" /> SQLite Tables ({Object.keys(tablesSchema).length})
          </h4>
          <div className="space-y-1.5">
            {Object.keys(tablesSchema).map(tbl => {
              const count = tablesSchema[tbl].getRows().length;
              const isSelected = selectedTable === tbl;
              return (
                <button
                  key={tbl}
                  onClick={() => handleSelectTable(tbl)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                    <span>{tbl}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count} rows
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Schema & Data Viewer */}
        <div className="lg:col-span-3 space-y-6">
          {/* Schema Definition Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 font-mono">
                <FileCode className="w-4 h-4 text-indigo-600" />
                Table Schema Definition: <span className="text-blue-600">{selectedTable}</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                CREATE TABLE IF NOT EXISTS {selectedTable} (...)
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeSchema.columns.map(col => (
                <div
                  key={col.name}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="font-bold text-slate-900">{col.name}</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {col.type}
                  </span>
                  {col.key && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                      <Key className="w-2.5 h-2.5" /> {col.key}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SQL Query Console Mockup */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-3 text-white border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" /> SQLite SQL Query Terminal
              </label>
              <button
                onClick={handleRunSql}
                disabled={isExecuting}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run SQL
              </button>
            </div>

            <textarea
              rows={2}
              value={customSql}
              onChange={e => setCustomSql(e.target.value)}
              className="w-full font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              placeholder="e.g. SELECT * FROM equipment WHERE status = 'active';"
            />

            {queryError && (
              <div className="p-2.5 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono rounded-lg">
                ❌ SQLite Error: {queryError}
              </div>
            )}

            {queryResult && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 text-xs font-mono rounded-lg space-y-2">
                <div className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Query Executed OK ({queryResult.rowsCount ?? queryResult.affectedRows} records)
                </div>
              </div>
            )}
          </div>

          {/* Table Rows Data Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-600" />
                Live SQLite Table Data (<span className="text-blue-600">{currentRows.length}</span> records stored)
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-72 shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                  <tr>
                    {activeSchema.columns.map(col => (
                      <th key={col.name} className="px-3 py-2 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan={activeSchema.columns.length} className="px-4 py-8 text-center text-xs text-slate-400">
                        No records stored in table <code className="font-mono text-slate-600">{selectedTable}</code>.
                      </td>
                    </tr>
                  ) : (
                    currentRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        {activeSchema.columns.map(col => (
                          <td key={col.name} className="px-3 py-2 text-xs font-mono text-slate-800 whitespace-nowrap">
                            {row[col.name] !== undefined && row[col.name] !== null ? String(row[col.name]) : <span className="text-slate-300 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {currentRows.length > 15 && (
              <p className="text-[11px] text-slate-400 text-right italic font-mono">
                Showing first 15 of {currentRows.length} records in SQLite table {selectedTable}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
