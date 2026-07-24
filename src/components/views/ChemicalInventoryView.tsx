import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { ChemicalInventory } from '../../types';
import { TestTube2, Plus, Save, Trash2, FileText, Upload, Download, ShieldAlert, FileCheck2, ExternalLink } from 'lucide-react';

interface ChemicalInventoryViewProps {
  onOpenMobileMenu: () => void;
}

export const ChemicalInventoryView: React.FC<ChemicalInventoryViewProps> = ({ onOpenMobileMenu }) => {
  const {
    chemicals,
    locations,
    addChemical,
    updateChemical,
    deleteChemical,
    getChemicalCurrentStock,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChem, setEditingChem] = useState<ChemicalInventory | null>(null);
  const [viewDocModal, setViewDocModal] = useState<{ chem: ChemicalInventory; type: 'coa' | 'msds' } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [unit, setUnit] = useState('Liters');
  const [initialStock, setInitialStock] = useState<number>(10);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [locationId, setLocationId] = useState('');
  const [storageConditions, setStorageConditions] = useState('');
  const [hazardClass, setHazardClass] = useState('');
  const [coaFileName, setCoaFileName] = useState('');
  const [coaFileData, setCoaFileData] = useState('');
  const [msdsFileName, setMsdsFileName] = useState('');
  const [msdsFileData, setMsdsFileData] = useState('');
  const [notes, setNotes] = useState('');

  const handleCoaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoaFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoaFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMsdsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsdsFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMsdsFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingChem(null);
    setName('');
    setCasNumber('');
    setSupplier('Sigma-Aldrich');
    setBatchNumber(`B-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setUnit('Liters');
    setInitialStock(10);
    setMinimumStock(5);
    setExpiryDate('2027-12-31');
    setLocationId(locations[0]?.id || '');
    setStorageConditions('Cool, dry, light-protected storage (15-25°C)');
    setHazardClass('Class 3 Flammable Liquid');
    setCoaFileName('');
    setCoaFileData('');
    setMsdsFileName('');
    setMsdsFileData('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (chem: ChemicalInventory) => {
    setEditingChem(chem);
    setName(chem.name);
    setCasNumber(chem.casNumber);
    setSupplier(chem.supplier);
    setBatchNumber(chem.batchNumber);
    setUnit(chem.unit);
    setInitialStock(chem.initialStock);
    setMinimumStock(chem.minimumStock);
    setExpiryDate(chem.expiryDate);
    setLocationId(chem.locationId);
    setStorageConditions(chem.storageConditions);
    setHazardClass(chem.hazardClass);
    setCoaFileName(chem.coaFileName || '');
    setCoaFileData(chem.coaFileData || '');
    setMsdsFileName(chem.msdsFileName || '');
    setMsdsFileData(chem.msdsFileData || '');
    setNotes(chem.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    if (editingChem) {
      updateChemical({
        ...editingChem,
        name,
        casNumber,
        supplier,
        batchNumber,
        unit,
        minimumStock,
        expiryDate,
        locationId,
        storageConditions,
        hazardClass,
        coaFileName,
        coaFileData,
        msdsFileName,
        msdsFileData,
        notes
      });
    } else {
      addChemical({
        name,
        casNumber,
        supplier,
        batchNumber,
        unit,
        initialStock,
        minimumStock,
        expiryDate,
        locationId,
        storageConditions,
        hazardClass,
        coaFileName,
        coaFileData,
        msdsFileName,
        msdsFileData,
        notes
      });
    }
    setIsModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const columns: Column<ChemicalInventory>[] = [
    {
      key: 'name',
      header: 'Chemical Standard & CAS',
      accessor: c => (
        <div>
          <span className="font-bold text-slate-900 block">{c.name}</span>
          <span className="text-[10px] font-mono text-slate-500">CAS: {c.casNumber || 'N/A'}</span>
        </div>
      ),
      searchValue: c => `${c.name} ${c.casNumber} ${c.batchNumber}`
    },
    {
      key: 'batchNumber',
      header: 'Batch / Supplier',
      accessor: c => (
        <div className="text-xs">
          <span className="font-mono font-semibold text-slate-800 block">{c.batchNumber}</span>
          <span className="text-[11px] text-slate-500">{c.supplier}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      header: 'Computed Stock Level',
      accessor: c => {
        const stock = getChemicalCurrentStock(c.id);
        const isLow = stock <= c.minimumStock;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-extrabold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
              {stock} {c.unit}
            </span>
            {isLow && <StatusBadge status="low_stock" label="LOW STOCK" size="sm" />}
          </div>
        );
      }
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      accessor: c => {
        const isExpired = c.expiryDate <= todayStr;
        const isExpiringSoon = c.expiryDate <= in30Days && !isExpired;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-800'}`}>
              {c.expiryDate}
            </span>
            {isExpired && <StatusBadge status="expired" label="EXPIRED" size="sm" />}
            {isExpiringSoon && <StatusBadge status="due_soon" label="EXPIRING" size="sm" />}
          </div>
        );
      }
    },
    {
      key: 'hazardClass',
      header: 'Hazard Class',
      accessor: c => (
        <span className="text-[11px] font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {c.hazardClass}
        </span>
      )
    },
    {
      key: 'documents',
      header: 'COA & MSDS Documents',
      accessor: c => (
        <div className="flex items-center gap-1.5">
          {c.coaFileName ? (
            <button
              onClick={e => {
                e.stopPropagation();
                setViewDocModal({ chem: c, type: 'coa' });
              }}
              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold cursor-pointer border border-blue-200 flex items-center gap-1"
            >
              <FileCheck2 className="w-3 h-3" /> COA File
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No COA</span>
          )}

          {c.msdsFileName ? (
            <button
              onClick={e => {
                e.stopPropagation();
                setViewDocModal({ chem: c, type: 'msds' });
              }}
              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold cursor-pointer border border-amber-200 flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-amber-600" /> MSDS File
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No MSDS</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Chemical & Reagents Inventory"
        subtitle="CAS registry, COA & MSDS document attachments, hazard classifications, and stock ledgers"
        icon={TestTube2}
        actions={
          isAdmin ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Chemical Standard
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      <DataTable
        data={chemicals}
        columns={columns}
        keyExtractor={c => c.id}
        title="Chemical Catalog & Safety Stock"
        subtitle="Click any row to edit details or manage COA / MSDS document attachments"
        onRowClick={openEditModal}
        exportFileName="LEMS_Chemical_Inventory.csv"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingChem ? `Edit Chemical: ${editingChem.name}` : 'Register New Chemical Standard'}
        subtitle="Chemical Safety & Document Management Record"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Chemical / Compound Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Methanol HPLC Grade 99.9%"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                CAS Registry Number *
              </label>
              <input
                type="text"
                required
                value={casNumber}
                onChange={e => setCasNumber(e.target.value)}
                placeholder="e.g. 67-56-1"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
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
                placeholder="e.g. Sigma-Aldrich / Merck"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Batch / Lot Number *
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                placeholder="e.g. B-2025-8812"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Unit of Measure *
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="Liters">Liters</option>
                <option value="Milliliters">Milliliters</option>
                <option value="Grams">Grams</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Bottles">Bottles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                {editingChem ? 'Computed Current Stock' : 'Initial Starting Stock *'}
              </label>
              <input
                type="number"
                disabled={!!editingChem}
                value={editingChem ? getChemicalCurrentStock(editingChem.id) : initialStock}
                onChange={e => setInitialStock(Number(e.target.value))}
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 disabled:opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Minimum Stock Level (Alert) *
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
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Hazard Classification
              </label>
              <input
                type="text"
                value={hazardClass}
                onChange={e => setHazardClass(e.target.value)}
                placeholder="e.g. Class 3 Flammable Liquid & Toxic"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Storage & Environmental Conditions
              </label>
              <input
                type="text"
                value={storageConditions}
                onChange={e => setStorageConditions(e.target.value)}
                placeholder="e.g. Flammable cabinet (15-25°C)"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {/* Real COA & MSDS Document File Upload Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* COA Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-blue-800 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Upload COA (Certificate of Analysis)
                </span>
                {coaFileName && <span className="text-[10px] text-emerald-600 font-bold">✓ Attached</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx"
                  onChange={handleCoaUpload}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {coaFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoaFileName('');
                      setCoaFileData('');
                    }}
                    className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {coaFileName && <p className="text-[10px] text-slate-500 font-mono truncate">File: {coaFileName}</p>}
            </div>

            {/* MSDS Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Upload MSDS (Safety Data Sheet)
                </span>
                {msdsFileName && <span className="text-[10px] text-emerald-600 font-bold">✓ Attached</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx"
                  onChange={handleMsdsUpload}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                />
                {msdsFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setMsdsFileName('');
                      setMsdsFileData('');
                    }}
                    className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {msdsFileName && <p className="text-[10px] text-slate-500 font-mono truncate">File: {msdsFileName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Notes & Handling Precautions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Handling notes or storage precautions..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900"
            />
          </div>

          {isAdmin ? (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {editingChem ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteChemical(editingChem.id);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Chemical
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
                  <Save className="w-3.5 h-3.5" /> Save Chemical Record
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 italic">View-only mode (Admin role required to manage chemical inventory)</span>
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

      {/* Document Preview / Download Modal */}
      <Modal
        isOpen={!!viewDocModal}
        onClose={() => setViewDocModal(null)}
        title={viewDocModal?.type === 'coa' ? `COA Document: ${viewDocModal.chem.name}` : `MSDS Document: ${viewDocModal?.chem.name}`}
        subtitle="Chemical Safety & Regulatory Compliance Attachment"
        maxWidth="lg"
      >
        {viewDocModal && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Compound:</span>
                <span className="font-bold text-white">{viewDocModal.chem.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">CAS Registry:</span>
                <span className="text-blue-400 font-bold">{viewDocModal.chem.casNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Batch Number:</span>
                <span>{viewDocModal.chem.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Type:</span>
                <span className="font-bold text-amber-400 uppercase">{viewDocModal.type}</span>
              </div>
            </div>

            {viewDocModal.type === 'coa' ? (
              viewDocModal.chem.coaFileData ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">📄 File: {viewDocModal.chem.coaFileName}</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">Base64 file attachment stored in LEMS database.</p>
                  </div>
                  <a
                    href={viewDocModal.chem.coaFileData}
                    download={viewDocModal.chem.coaFileName || 'COA_Document.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download COA
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">📄 File: {viewDocModal.chem.coaFileName || 'COA_Document.pdf'}</span>
                  <button
                    onClick={() => alert(`Simulated Download of COA document: ${viewDocModal.chem.coaFileName}`)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              )
            ) : (
              viewDocModal.chem.msdsFileData ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">📄 File: {viewDocModal.chem.msdsFileName}</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">Base64 file attachment stored in LEMS database.</p>
                  </div>
                  <a
                    href={viewDocModal.chem.msdsFileData}
                    download={viewDocModal.chem.msdsFileName || 'MSDS_Document.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download MSDS
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">📄 File: {viewDocModal.chem.msdsFileName || 'MSDS_Document.pdf'}</span>
                  <button
                    onClick={() => alert(`Simulated Download of MSDS document: ${viewDocModal.chem.msdsFileName}`)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
