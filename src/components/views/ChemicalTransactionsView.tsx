import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { ChemicalTransaction, TransactionType } from '../../types';
import { ArrowRightLeft, Plus, Save, Filter, TestTube2, AlertCircle } from 'lucide-react';

interface ChemicalTransactionsViewProps {
  onOpenMobileMenu: () => void;
}

export const ChemicalTransactionsView: React.FC<ChemicalTransactionsViewProps> = ({ onOpenMobileMenu }) => {
  const {
    chemicalTransactions,
    chemicals,
    addChemicalTransaction,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const [filterChemId, setFilterChemId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [chemicalId, setChemicalId] = useState(chemicals[0]?.id || '');
  const [type, setType] = useState<TransactionType>(isAdmin ? 'stock_in' : 'stock_out');
  const [quantity, setQuantity] = useState<number>(5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [performedBy, setPerformedBy] = useState(currentUser?.fullName || 'Sarah Jenkins');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setChemicalId(chemicals[0]?.id || '');
    setType(isAdmin ? 'stock_in' : 'stock_out');
    setQuantity(5);
    setDate(new Date().toISOString().split('T')[0]);
    setPerformedBy(currentUser?.fullName || 'Sarah Jenkins');
    setReason('Routine analytical lab usage');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    // Non-admin users are strictly restricted to stock_out (Pemakaian / Item Taking)
    const effectiveType = isAdmin ? type : 'stock_out';

    addChemicalTransaction({
      chemicalId,
      type: effectiveType,
      quantity: Number(quantity),
      date,
      performedBy: currentUser?.fullName || performedBy,
      reason,
      notes
    });
    setIsModalOpen(false);
  };

  const filteredTx = chemicalTransactions.filter(t => {
    if (filterChemId === 'all') return true;
    return t.chemicalId === filterChemId;
  });

  const columns: Column<ChemicalTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      accessor: t => <span className="font-semibold text-slate-900">{t.date}</span>
    },
    {
      key: 'chemicalId',
      header: 'Chemical Standard',
      accessor: t => {
        const chem = chemicals.find(c => c.id === t.chemicalId);
        return (
          <div>
            <span className="font-bold text-slate-900 block">{chem?.name || t.chemicalId}</span>
            <span className="text-[10px] font-mono text-slate-500">Batch: {chem?.batchNumber || 'N/A'}</span>
          </div>
        );
      }
    },
    {
      key: 'type',
      header: 'Transaction Type',
      accessor: t => <StatusBadge status={t.type} />
    },
    {
      key: 'quantity',
      header: 'Quantity',
      accessor: t => {
        const chem = chemicals.find(c => c.id === t.chemicalId);
        const prefix = t.type === 'stock_in' ? '+' : t.type === 'stock_out' ? '-' : '';
        return (
          <span className={`font-mono font-extrabold text-xs ${t.type === 'stock_in' ? 'text-emerald-600' : t.type === 'stock_out' ? 'text-blue-600' : 'text-amber-600'}`}>
            {prefix}{t.quantity} {chem?.unit || ''}
          </span>
        );
      }
    },
    {
      key: 'reason',
      header: 'Purpose / Reason',
      accessor: t => <span className="text-slate-700">{t.reason}</span>
    },
    {
      key: 'performedBy',
      header: 'Logged By',
      accessor: t => <span className="text-slate-600 font-medium">{t.performedBy}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Chemical Transaction Ledger"
        subtitle="Auditable log of chemical receipts (Stock In), lab usage (Stock Out), and physical audit corrections (Adjustment)"
        icon={ArrowRightLeft}
        actions={
          !isGuest ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Chemical Transaction
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Filter Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Filter Ledger By Chemical Compound:
          </span>
        </div>
        <select
          value={filterChemId}
          onChange={e => setFilterChemId(e.target.value)}
          className="w-full sm:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">Show All Chemical Transactions ({chemicalTransactions.length})</option>
          {chemicals.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.batchNumber})
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredTx}
        columns={columns}
        keyExtractor={t => t.id}
        title="Chemical Inventory Ledger"
        subtitle="Chronological transaction records"
        exportFileName="LEMS_Chemical_Transactions.csv"
      />

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Chemical Inventory Transaction"
        subtitle="Record Stock In, Stock Out, or Audit Adjustment"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Chemical Compound *
            </label>
            <select
              required
              value={chemicalId}
              onChange={e => setChemicalId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
            >
              {chemicals.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Batch: {c.batchNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Transaction Type *
              </label>
              {isAdmin ? (
                <select
                  required
                  value={type}
                  onChange={e => setType(e.target.value as TransactionType)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                >
                  <option value="stock_in">Stock In (Receipt / Store replenishment)</option>
                  <option value="stock_out">Stock Out (Lab Usage / Pemakaian Barang)</option>
                  <option value="adjustment">Stock Adjustment (Audit Correction)</option>
                </select>
              ) : (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold flex items-center justify-between">
                  <span>Stock Out (Usage / Pemakaian Barang)</span>
                  <span className="text-[10px] bg-blue-200 px-2 py-0.5 rounded text-blue-800 uppercase font-mono">User Restricted</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          {type === 'adjustment' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Stock Adjustment Note:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Enter positive quantity to add stock, or negative quantity (e.g. <code className="font-mono font-bold">-2</code>) to reduce stock for physical audit corrections/spills.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Performed / Logged By *
              </label>
              <input
                type="text"
                required
                value={performedBy}
                onChange={e => setPerformedBy(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Purpose / Reason *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Prepared 500 mL LC calibration working solutions"
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Usage recorded in LC logbook..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900"
            />
          </div>

          {!isGuest && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Submit Transaction
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
