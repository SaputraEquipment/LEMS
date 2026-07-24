import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { SparePartInventory } from '../../types';
import { Package, Plus, Save, Trash2, DollarSign } from 'lucide-react';

interface SparePartsInventoryViewProps {
  onOpenMobileMenu: () => void;
}

export const SparePartsInventoryView: React.FC<SparePartsInventoryViewProps> = ({ onOpenMobileMenu }) => {
  const {
    spareParts,
    locations,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    getSparePartCurrentStock,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSp, setEditingSp] = useState<SparePartInventory | null>(null);

  // Form Fields
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('GC Consumables');
  const [unit, setUnit] = useState('Packs');
  const [initialStock, setInitialStock] = useState<number>(5);
  const [minimumStock, setMinimumStock] = useState<number>(2);
  const [maximumStock, setMaximumStock] = useState<number>(10);
  const [locationId, setLocationId] = useState('');
  const [unitCost, setUnitCost] = useState<number>(50.0);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingSp(null);
    setPartNumber(`PN-${Math.floor(10000 + Math.random() * 90000)}`);
    setName('');
    setSupplier('Agilent Technologies Inc.');
    setCategory('GC Consumables');
    setUnit('Packs');
    setInitialStock(5);
    setMinimumStock(2);
    setMaximumStock(10);
    setLocationId(locations[0]?.id || '');
    setUnitCost(75.0);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sp: SparePartInventory) => {
    setEditingSp(sp);
    setPartNumber(sp.partNumber);
    setName(sp.name);
    setSupplier(sp.supplier);
    setCategory(sp.category);
    setUnit(sp.unit);
    setInitialStock(sp.initialStock);
    setMinimumStock(sp.minimumStock);
    setMaximumStock(sp.maximumStock);
    setLocationId(sp.locationId);
    setUnitCost(sp.unitCost);
    setNotes(sp.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    if (editingSp) {
      updateSparePart({
        ...editingSp,
        partNumber,
        name,
        supplier,
        category,
        unit,
        minimumStock,
        maximumStock,
        locationId,
        unitCost: Number(unitCost),
        notes
      });
    } else {
      addSparePart({
        partNumber,
        name,
        supplier,
        category,
        unit,
        initialStock,
        minimumStock,
        maximumStock,
        locationId,
        unitCost: Number(unitCost),
        notes
      });
    }
    setIsModalOpen(false);
  };

  const columns: Column<SparePartInventory>[] = [
    {
      key: 'partNumber',
      header: 'Part Number / Name',
      accessor: sp => (
        <div>
          <span className="font-bold text-slate-900 block">{sp.name}</span>
          <span className="text-[10px] font-mono text-slate-500">P/N: {sp.partNumber}</span>
        </div>
      ),
      searchValue: sp => `${sp.name} ${sp.partNumber} ${sp.supplier}`
    },
    {
      key: 'category',
      header: 'Category / Supplier',
      accessor: sp => (
        <div>
          <span className="font-semibold text-slate-800 block">{sp.category}</span>
          <span className="text-[11px] text-slate-500">{sp.supplier}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      header: 'Current Stock Level',
      accessor: sp => {
        const stock = getSparePartCurrentStock(sp.id);
        const isLow = stock <= sp.minimumStock;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-extrabold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
              {stock} {sp.unit}
            </span>
            {isLow && <StatusBadge status="low_stock" label="CRITICAL LOW" size="sm" />}
          </div>
        );
      }
    },
    {
      key: 'minMax',
      header: 'Min / Max Stock',
      accessor: sp => (
        <span className="text-slate-600 font-mono text-xs">
          Min: <strong>{sp.minimumStock}</strong> / Max: <strong>{sp.maximumStock}</strong>
        </span>
      )
    },
    {
      key: 'unitCost',
      header: 'Unit Cost ($)',
      accessor: sp => (
        <span className="font-bold text-slate-900 font-mono">
          ${sp.unitCost.toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Spare Parts & Consumables Catalog"
        subtitle="Instrumentation maintenance spares, consumables catalog, safety stock, and unit costing"
        icon={Package}
        actions={
          isAdmin ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Spare Part
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      <DataTable
        data={spareParts}
        columns={columns}
        keyExtractor={sp => sp.id}
        title="Spare Parts Catalog"
        subtitle="Click any spare part to view details or modify stock thresholds"
        onRowClick={openEditModal}
        exportFileName="LEMS_Spare_Parts_Catalog.csv"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSp ? `Edit Spare Part: ${editingSp.name}` : 'Register New Spare Part'}
        subtitle="Equipment Consumable & Component Master"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Part Number / OEM P/N *
              </label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={e => setPartNumber(e.target.value)}
                placeholder="e.g. 5183-4759"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Spare Part Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. GC Septa Non-Stick (11mm)"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="e.g. Agilent Technologies Inc."
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. GC Consumables"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Unit of Measure *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. Packs (50 pcs)"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Unit Cost ($ USD) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={unitCost}
                onChange={e => setUnitCost(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                {editingSp ? 'Computed Current Stock (Read-Only)' : 'Initial Starting Stock *'}
              </label>
              <input
                type="number"
                disabled={!!editingSp}
                value={editingSp ? getSparePartCurrentStock(editingSp.id) : initialStock}
                onChange={e => setInitialStock(Number(e.target.value))}
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 disabled:opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                required
                value={minimumStock}
                onChange={e => setMinimumStock(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Maximum Target Stock *
              </label>
              <input
                type="number"
                required
                value={maximumStock}
                onChange={e => setMaximumStock(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Storage Location *
              </label>
              <select
                required
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Used for 8890 GC inlet injector ports..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900"
            />
          </div>

          {isAdmin ? (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {editingSp ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteSparePart(editingSp.id);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Part
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
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
                  <Save className="w-3.5 h-3.5" /> Save Part
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 italic">View-only mode (Admin role required to manage spare parts catalog)</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
