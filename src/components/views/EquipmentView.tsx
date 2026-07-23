import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { Equipment, EquipmentStatus } from '../../types';
import { Wrench, Plus, Save, Trash2, Info, Calendar, FileText, AlertCircle } from 'lucide-react';

interface EquipmentViewProps {
  onOpenMobileMenu: () => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ onOpenMobileMenu }) => {
  const {
    equipment,
    categories,
    manufacturers,
    locations,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [duplicateError, setDuplicateError] = useState('');

  // Form Fields
  const [eqId, setEqId] = useState('');
  const [sapCode, setSapCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [locationId, setLocationId] = useState('');
  const [department, setDepartment] = useState('Analytical Quality Assurance');
  const [status, setStatus] = useState<EquipmentStatus>('active');
  const [purchaseDate, setPurchaseDate] = useState('2024-01-01');
  const [commissionDate, setCommissionDate] = useState('2024-01-15');
  const [calibrationFrequencyDays, setCalibrationFrequencyDays] = useState(180);
  const [pmFrequencyDays, setPmFrequencyDays] = useState(90);
  const [measurementSpecs, setMeasurementSpecs] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingEq(null);
    setDuplicateError('');
    setEqId(`EQ-QC-${Math.floor(100 + Math.random() * 900)}`);
    setSapCode(`SAP-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setManufacturerId(manufacturers[0]?.id || '');
    setModel('');
    setSerialNumber('');
    setTagNumber('');
    setLocationId(locations[0]?.id || '');
    setDepartment('Analytical Quality Assurance');
    setStatus('active');
    setPurchaseDate('2025-01-01');
    setCommissionDate('2025-01-15');
    setCalibrationFrequencyDays(180);
    setPmFrequencyDays(90);
    setMeasurementSpecs('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEq(eq);
    setDuplicateError('');
    setEqId(eq.id);
    setSapCode(eq.sapCode || '');
    setName(eq.name);
    setCategoryId(eq.categoryId);
    setManufacturerId(eq.manufacturerId);
    setModel(eq.model);
    setSerialNumber(eq.serialNumber);
    setTagNumber(eq.tagNumber);
    setLocationId(eq.locationId);
    setDepartment(eq.department);
    setStatus(eq.status);
    setPurchaseDate(eq.purchaseDate);
    setCommissionDate(eq.commissionDate);
    setCalibrationFrequencyDays(eq.calibrationFrequencyDays);
    setPmFrequencyDays(eq.pmFrequencyDays);
    setMeasurementSpecs(eq.measurementSpecs);
    setNotes(eq.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    setDuplicateError('');

    const newEqData: Equipment = {
      id: eqId.trim(),
      sapCode: sapCode.trim(),
      name: name.trim(),
      categoryId,
      manufacturerId,
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      tagNumber: tagNumber.trim(),
      locationId,
      department: department.trim(),
      status,
      purchaseDate,
      commissionDate,
      calibrationFrequencyDays: Number(calibrationFrequencyDays),
      pmFrequencyDays: Number(pmFrequencyDays),
      measurementSpecs: measurementSpecs.trim(),
      notes: notes.trim(),
      lastCalibrationDate: editingEq ? editingEq.lastCalibrationDate : undefined,
      nextCalibrationDate: editingEq ? editingEq.nextCalibrationDate : undefined,
      lastPmDate: editingEq ? editingEq.lastPmDate : undefined,
      nextPmDate: editingEq ? editingEq.nextPmDate : undefined
    };

    if (editingEq) {
      updateEquipment(newEqData);
      setIsModalOpen(false);
    } else {
      const success = addEquipment(newEqData);
      if (!success) {
        setDuplicateError(`Equipment ID "${eqId}" already exists. Please assign a unique ID.`);
      } else {
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = () => {
    if (!editingEq || isGuest) return;
    if (window.confirm(`Are you sure you want to delete equipment "${editingEq.name}"?`)) {
      deleteEquipment(editingEq.id);
      setIsModalOpen(false);
    }
  };

  // Columns definition
  const columns: Column<Equipment>[] = [
    {
      key: 'id',
      header: 'Equipment ID / Asset Code',
      accessor: eq => (
        <div>
          <span className="font-bold text-slate-900 block">{eq.id}</span>
          <span className="text-[10px] text-slate-500">{eq.sapCode}</span>
        </div>
      ),
      searchValue: eq => `${eq.id} ${eq.sapCode} ${eq.serialNumber}`
    },
    {
      key: 'name',
      header: 'Equipment Name & Model',
      accessor: eq => (
        <div>
          <span className="font-bold text-slate-900 block">{eq.name}</span>
          <span className="text-[11px] text-slate-500">Model: {eq.model}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: eq => <StatusBadge status={eq.status} />
    },
    {
      key: 'categoryId',
      header: 'Category',
      accessor: eq => {
        const cat = categories.find(c => c.id === eq.categoryId);
        return <span className="text-slate-700 font-medium">{cat?.name || '—'}</span>;
      }
    },
    {
      key: 'manufacturerId',
      header: 'Manufacturer',
      accessor: eq => {
        const mfr = manufacturers.find(m => m.id === eq.manufacturerId);
        return <span className="text-slate-700 font-medium">{mfr?.name || '—'}</span>;
      }
    },
    {
      key: 'locationId',
      header: 'Location',
      accessor: eq => {
        const loc = locations.find(l => l.id === eq.locationId);
        return <span className="text-slate-700 font-medium">{loc?.name || '—'}</span>;
      }
    },
    {
      key: 'calibrationDate',
      header: 'Next Cal / PM',
      accessor: eq => (
        <div className="text-[11px]">
          <div>Cal: <strong className="text-slate-800">{eq.nextCalibrationDate || 'Pending'}</strong></div>
          <div>PM: <strong className="text-slate-800">{eq.nextPmDate || 'Pending'}</strong></div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Laboratory Equipment Register"
        subtitle="Master asset registry, status tracking, measurement specs, and maintenance schedules"
        icon={Wrench}
        actions={
          !isGuest ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Equipment
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Status Legend Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
          Status Legend:
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status="active" label="Active" size="sm" />
          <span className="text-[11px] text-slate-500">Fully operational</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="under_maintenance" label="Under Maintenance" size="sm" />
          <span className="text-[11px] text-slate-500">Service in progress</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="inactive" label="Inactive" size="sm" />
          <span className="text-[11px] text-slate-500">Temporarily idle</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="decommissioned" label="Decommissioned" size="sm" />
          <span className="text-[11px] text-slate-500">Retired asset</span>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={equipment}
        columns={columns}
        keyExtractor={eq => eq.id}
        title="Equipment Inventory List"
        subtitle="Click any equipment record to view full specifications or edit"
        onRowClick={openEditModal}
        exportFileName="LEMS_Equipment_Master.csv"
      />

      {/* Add / Edit Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEq ? `Edit Equipment: ${editingEq.name}` : 'Register New Laboratory Equipment'}
        subtitle="Enterprise Quality Management ISO 17025 Asset Record"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {duplicateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{duplicateError}</span>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Identification */}
            <div className="space-y-4 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 1. Asset Identification
              </h4>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Equipment ID *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingEq} // ID immutable on edit
                  value={eqId}
                  onChange={e => setEqId(e.target.value)}
                  placeholder="e.g. LEMS-EQ-101"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Asset Code
                </label>
                <input
                  type="text"
                  value={sapCode}
                  onChange={e => setSapCode(e.target.value)}
                  placeholder="e.g. AST-1009823"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Equipment Description / Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Agilent 8890 GC-MS System"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="8890 GC"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={e => setSerialNumber(e.target.value)}
                    placeholder="US21493012"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Physical Tag Number
                </label>
                <input
                  type="text"
                  value={tagNumber}
                  onChange={e => setTagNumber(e.target.value)}
                  placeholder="TAG-QC-01"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            {/* Right Column: Classification & Frequency */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 2. Classification & Maintenance
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Manufacturer *
                  </label>
                  <select
                    required
                    value={manufacturerId}
                    onChange={e => setManufacturerId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {manufacturers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Lab Location *
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

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={status}
                    onChange={e => setStatus(e.target.value as EquipmentStatus)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="active">Active (Operational)</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Calibration Frequency (Days)
                </label>
                <input
                  type="number"
                  value={calibrationFrequencyDays}
                  onChange={e => setCalibrationFrequencyDays(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Measurement Range / Specs
                </label>
                <input
                  type="text"
                  value={measurementSpecs}
                  onChange={e => setMeasurementSpecs(e.target.value)}
                  placeholder="e.g. Nicotine: 0.1-10.0 mg/stick ±0.02 mg"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Full-width Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              General Operating Notes & History
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Used primarily for aerosol humectant ratio testing..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          {!isGuest && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {editingEq ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Decommission & Delete
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> {editingEq ? 'Update Record' : 'Register Asset'}
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
