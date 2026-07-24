import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { SparePartTransaction, TransactionType } from '../../types';
import { Settings2, Plus, Save, Filter, Package } from 'lucide-react';

interface SparePartsTransactionsViewProps {
  onOpenMobileMenu: () => void;
}

export const SparePartsTransactionsView: React.FC<SparePartsTransactionsViewProps> = ({ onOpenMobileMenu }) => {
  const {
    sparePartTransactions,
    spareParts,
    equipment,
    addSparePartTransaction,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const [filterPartId, setFilterPartId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [sparePartId, setSparePartId] = useState(spareParts[0]?.id || '');
  const [type, setType] = useState<TransactionType>('stock_out');
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [performedBy, setPerformedBy] = useState(currentUser?.fullName || 'Sarah Jenkins');
  const [linkedEquipmentId, setLinkedEquipmentId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setSparePartId(spareParts[0]?.id || '');
    setType(isAdmin ? 'stock_out' : 'stock_out');
    setQuantity(1);
    setDate(new Date().toISOString().split('T')[0]);
    setPerformedBy(currentUser?.fullName || 'Sarah Jenkins');
    setLinkedEquipmentId(equipment[0]?.id || '');
    setReason('Routine instrument part replacement');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    const effectiveType = isAdmin ? type : 'stock_out';

    addSparePartTransaction({
      sparePartId,
      type: effectiveType,
      quantity: Number(quantity),
      date,
      performedBy: currentUser?.fullName || performedBy,
      linkedEquipmentId: effectiveType === 'stock_out' ? linkedEquipmentId : undefined,
      reason,
      notes
    });
    setIsModalOpen(false);
  };

  const filteredTx = sparePartTransactions.filter(t => {
    if (filterPartId === 'all') return true;
    return t.sparePartId === filterPartId;
  });

  const columns: Column<SparePartTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      accessor: t => <span className="font-semibold text-slate-900">{t.date}</span>
    },
    {
      key: 'sparePartId',
      header: 'Spare Part Item',
      accessor: t => {
        const sp = spareParts.find(s => s.id === t.sparePartId);
        return (
          <div>
            <span className="font-bold text-slate-900 block">{sp?.name || t.sparePartId}</span>
            <span className="text-[10px] font-mono text-slate-500">P/N: {sp?.partNumber || 'N/A'}</span>
          </div>
        );
      }
    },
    {
      key: 'type',
      header: 'Type',
      accessor: t => <StatusBadge status={t.type} />
    },
    {
      key: 'quantity',
      header: 'Quantity',
      accessor: t => {
        const sp = spareParts.find(s => s.id === t.sparePartId);
        const prefix = t.type === 'stock_in' ? '+' : t.type === 'stock_out' ? '-' : '';
        return (
          <span className={`font-mono font-extrabold text-xs ${t.type === 'stock_in' ? 'text-emerald-600' : 'text-blue-600'}`}>
            {prefix}{t.quantity} {sp?.unit || ''}
          </span>
        );
      }
    },
    {
      key: 'linkedEquipmentId',
      header: 'Used For Equipment',
      accessor: t => {
        if (!t.linkedEquipmentId) return <span className="text-slate-400">—</span>;
        const eq = equipment.find(e => e.id === t.linkedEquipmentId);
        return (
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {eq ? `${eq.id} (${eq.name.substring(0, 20)}...)` : t.linkedEquipmentId}
          </span>
        );
      }
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
        title="Spare Parts Transaction Ledger"
        subtitle="Tracking inventory issues, work orders, and parts consumption per equipment asset"
        icon={Settings2}
        actions={
          !isGuest ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Parts Issue / Receipt
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
            Filter Ledger By Spare Part:
          </span>
        </div>
        <select
          value={filterPartId}
          onChange={e => setFilterPartId(e.target.value)}
          className="w-full sm:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">Show All Spare Parts Transactions ({sparePartTransactions.length})</option>
          {spareParts.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (P/N: {s.partNumber})
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredTx}
        columns={columns}
        keyExtractor={t => t.id}
        title="Spare Parts Consumption Ledger"
        subtitle="Auditable stock changes"
        exportFileName="LEMS_Spare_Parts_Transactions.csv"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Spare Part Issue / Receipt"
        subtitle="Record Consumables Usage or Restock"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Spare Part Item *
            </label>
            <select
              required
              value={sparePartId}
              onChange={e => setSparePartId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
            >
              {spareParts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (P/N: {s.partNumber})
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
                  <option value="stock_out">Stock Out (Issued for Maintenance / Usage)</option>
                  <option value="stock_in">Stock In (Purchased Restock / Receipt)</option>
                  <option value="adjustment">Stock Adjustment (Audit Correction)</option>
                </select>
              ) : (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold flex items-center justify-between">
                  <span>Stock Out (Usage / Pengambilan Sparepart)</span>
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
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Linked Equipment Picker for Stock Out */}
          {type === 'stock_out' && (
            <div>
              <label className="block text-xs font-bold uppercase text-blue-700 mb-1">
                Used For Equipment Asset (Optional)
              </label>
              <select
                value={linkedEquipmentId}
                onChange={e => setLinkedEquipmentId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                <option value="">-- None / General Maintenance --</option>
                {equipment.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.id} - {e.name}
                  </option>
                ))}
              </select>
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
                Performed By *
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
              Reason / Work Order *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Routine GC injector liner replacement after 500 injections"
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Verified baseline noise..."
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
                <Save className="w-3.5 h-3.5" /> Submit Parts Issue
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
