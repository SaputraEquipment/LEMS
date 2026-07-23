import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Layers } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortableKey?: keyof T | string;
  searchValue?: (item: T) => string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  exportFileName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  actions,
  onRowClick,
  emptyMessage = 'No data records available.',
  exportFileName = 'LEMS_Export.csv'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(col => {
        if (col.searchValue) {
          return col.searchValue(item).toLowerCase().includes(term);
        }
        const val = (item as Record<string, unknown>)[col.key];
        if (val !== undefined && val !== null) {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map(item => {
      return columns
        .map(col => {
          let raw = col.searchValue ? col.searchValue(item) : String((item as Record<string, unknown>)[col.key] ?? '');
          return `"${raw.replace(/"/g, '""')}"`;
        })
        .join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleExportCSV}
            title="Export Table to CSV"
            className="p-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Export</span>
          </button>

          {actions}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
              {columns.map(col => {
                const sKey = (col.sortableKey || col.key) as string;
                const isSorted = sortKey === sKey;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(sKey)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 hover:opacity-100" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {paginatedData.length > 0 ? (
              paginatedData.map(item => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-blue-50/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3.5 align-middle ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                    {searchTerm && (
                      <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
          <span className="font-semibold text-slate-800">{sortedData.length}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            Prev
          </button>
          <span className="px-2 font-medium text-slate-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
