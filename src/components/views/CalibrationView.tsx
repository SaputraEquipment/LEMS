import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { CalibrationRecord, CalibrationResult, CalibrationType } from '../../types';
import { Ruler, Plus, Save, Trash2, FileCheck2, Award, Upload, Eye, Download, Building2, User } from 'lucide-react';

interface CalibrationViewProps {
  onOpenMobileMenu: () => void;
}

export const CalibrationView: React.FC<CalibrationViewProps> = ({ onOpenMobileMenu }) => {
  const {
    calibrationRecords,
    equipment,
    addCalibrationRecord,
    updateCalibrationRecord,
    deleteCalibrationRecord,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [filterEquipmentId, setFilterEquipmentId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCal, setEditingCal] = useState<CalibrationRecord | null>(null);
  const [viewCert, setViewCert] = useState<CalibrationRecord | null>(null);

  // Form Fields
  const [equipmentId, setEquipmentId] = useState('');
  const [calibrationType, setCalibrationType] = useState<CalibrationType>('internal');
  const [calibrationDate, setCalibrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [technician, setTechnician] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [result, setResult] = useState<CalibrationResult>('pass');
  const [certificateFileName, setCertificateFileName] = useState('');
  const [certificateFileData, setCertificateFileData] = useState('');
  const [notes, setNotes] = useState('');

  // Handle Equipment selection to auto-suggest next due date
  const handleEquipmentChange = (eqId: string, calDate: string) => {
    setEquipmentId(eqId);
    const selectedEq = equipment.find(e => e.id === eqId);
    if (selectedEq && calDate) {
      const d = new Date(calDate);
      d.setDate(d.getDate() + (selectedEq.calibrationFrequencyDays || 180));
      setNextDueDate(d.toISOString().split('T')[0]);
    }
  };

  const handleCalDateChange = (calDate: string) => {
    setCalibrationDate(calDate);
    const selectedEq = equipment.find(e => e.id === equipmentId);
    if (selectedEq && calDate) {
      const d = new Date(calDate);
      d.setDate(d.getDate() + (selectedEq.calibrationFrequencyDays || 180));
      setNextDueDate(d.toISOString().split('T')[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertificateFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCertificateFileData(base64);
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingCal(null);
    const defaultEq = equipment[0]?.id || '';
    const todayStr = new Date().toISOString().split('T')[0];
    setEquipmentId(defaultEq);
    setCalibrationType('internal');
    setCalibrationDate(todayStr);
    handleEquipmentChange(defaultEq, todayStr);
    setCertificateNumber(`CERT-${Math.floor(10000 + Math.random() * 90000)}`);
    setTechnician(currentUser?.fullName || 'Ahmed Hassan');
    setVendorName('');
    setResult('pass');
    setCertificateFileName('');
    setCertificateFileData('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cal: CalibrationRecord) => {
    setEditingCal(cal);
    setEquipmentId(cal.equipmentId);
    setCalibrationType(cal.calibrationType || 'internal');
    setCalibrationDate(cal.calibrationDate);
    setNextDueDate(cal.nextDueDate);
    setCertificateNumber(cal.certificateNumber);
    setTechnician(cal.technician || '');
    setVendorName(cal.vendorName || '');
    setResult(cal.result);
    setCertificateFileName(cal.certificateFileName || '');
    setCertificateFileData(cal.certificateFileData || '');
    setNotes(cal.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    const data: Omit<CalibrationRecord, 'id'> = {
      equipmentId,
      calibrationType,
      calibrationDate,
      nextDueDate,
      certificateNumber,
      technician: calibrationType === 'internal' ? technician.trim() : undefined,
      vendorName: calibrationType === 'external' ? vendorName.trim() : undefined,
      result,
      certificateFileName: certificateFileName || `Certificate_${certificateNumber}.pdf`,
      certificateFileData,
      notes
    };

    if (editingCal) {
      updateCalibrationRecord({ ...data, id: editingCal.id });
    } else {
      addCalibrationRecord(data);
    }
    setIsModalOpen(false);
  };

  const filteredRecords = calibrationRecords.filter(r => {
    if (filterEquipmentId === 'all') return true;
    return r.equipmentId === filterEquipmentId;
  });

  const columns: Column<CalibrationRecord>[] = [
    {
      key: 'equipmentId',
      header: 'Equipment Asset',
      accessor: r => {
        const eq = equipment.find(e => e.id === r.equipmentId);
        return (
          <div>
            <span className="font-bold text-slate-900 block">{eq?.name || r.equipmentId}</span>
            <span className="text-[10px] font-mono text-slate-500">{r.equipmentId}</span>
          </div>
        );
      }
    },
    {
      key: 'calibrationType',
      header: 'Type & Executor',
      accessor: r => {
        const isExt = r.calibrationType === 'external';
        return (
          <div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isExt ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {isExt ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isExt ? 'External' : 'Internal'}
            </span>
            <div className="text-xs font-semibold text-slate-800 mt-1">
              {isExt ? r.vendorName || '—' : r.technician || '—'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'calibrationDate',
      header: 'Calibration Date',
      accessor: r => <span className="font-medium text-slate-800">{r.calibrationDate}</span>
    },
    {
      key: 'nextDueDate',
      header: 'Next Due Date',
      accessor: r => {
        const isOverdue = new Date(r.nextDueDate) < new Date();
        return (
          <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
            {r.nextDueDate}
          </span>
        );
      }
    },
    {
      key: 'result',
      header: 'Result',
      accessor: r => <StatusBadge status={r.result} />
    },
    {
      key: 'certificateNumber',
      header: 'Certificate & Attachment',
      accessor: r => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-slate-800 text-[11px]">{r.certificateNumber}</span>
          {r.certificateFileName && (
            <button
              onClick={e => {
                e.stopPropagation();
                setViewCert(r);
              }}
              title="View / Download Certificate Attachment"
              className="p-1 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer text-[10px] font-bold border border-blue-200"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> View File
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Calibration Log & Certificates"
        subtitle="Traceable internal & external calibration records, vendor tracking, and due date management"
        icon={Ruler}
        actions={
          !isGuest ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Calibration Record
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Equipment Filter Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Filter Calibration History By Asset:
          </span>
        </div>
        <select
          value={filterEquipmentId}
          onChange={e => setFilterEquipmentId(e.target.value)}
          className="w-full sm:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
        >
          <option value="all">Show All Equipment Calibration Records ({calibrationRecords.length})</option>
          {equipment.map(e => (
            <option key={e.id} value={e.id}>
              {e.id} — {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredRecords}
        columns={columns}
        keyExtractor={r => r.id}
        title="Calibration Execution Logs"
        subtitle="Click any row to view full details or edit record"
        onRowClick={openEditModal}
        exportFileName="LEMS_Calibration_Records.csv"
      />

      {/* Add / Edit Calibration Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCal ? `Edit Calibration Record: ${editingCal.certificateNumber}` : 'Log New Equipment Calibration'}
        subtitle="Quality Assurance Measurement & Certificate Verification"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Calibration Type Toggle (Internal vs External) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Calibration Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCalibrationType('internal')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  calibrationType === 'internal'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" /> Internal Calibration
              </button>
              <button
                type="button"
                onClick={() => setCalibrationType('external')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  calibrationType === 'external'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" /> External Calibration (Vendor)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Equipment *
              </label>
              <select
                required
                value={equipmentId}
                onChange={e => handleEquipmentChange(e.target.value, calibrationDate)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                {equipment.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.id} - {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Certificate Number *
              </label>
              <input
                type="text"
                required
                value={certificateNumber}
                onChange={e => setCertificateNumber(e.target.value)}
                placeholder="e.g. CERT-AGILENT-8890"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Calibration Date *
              </label>
              <input
                type="date"
                required
                value={calibrationDate}
                onChange={e => handleCalDateChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Next Due Date (Auto-Calculated) *
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={e => setNextDueDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            {/* Conditional Executor Field */}
            {calibrationType === 'internal' ? (
              <div>
                <label className="block text-xs font-bold uppercase text-blue-800 mb-1">
                  Calibration Technician (Internal) *
                </label>
                <input
                  type="text"
                  required
                  value={technician}
                  onChange={e => setTechnician(e.target.value)}
                  placeholder="e.g. Ahmed Hassan / Sarah Jenkins"
                  className="w-full text-xs bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-purple-800 mb-1">
                  Calibration Vendor Name (External) *
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  placeholder="e.g. PT Agilent Technologies Indonesia / PT Sysmex"
                  className="w-full text-xs bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Result Status *
              </label>
              <select
                required
                value={result}
                onChange={e => setResult(e.target.value as CalibrationResult)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="pass">PASS (Compliant)</option>
                <option value="conditional">CONDITIONAL (Minor offset)</option>
                <option value="fail">FAIL (Out of Tolerance)</option>
              </select>
            </div>
          </div>

          {/* Certificate Document Upload Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" /> Certificate Document Attachment File
              </span>
              {certificateFileName && (
                <span className="text-[11px] text-emerald-600 font-bold">
                  ✓ File Selected: {certificateFileName}
                </span>
              )}
            </label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf,image/*,.doc,.docx"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {certificateFileName && (
                <button
                  type="button"
                  onClick={() => {
                    setCertificateFileName('');
                    setCertificateFileData('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-xl border border-red-200 shrink-0 cursor-pointer"
                >
                  Clear File
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Upload PDF certificate or document file directly. Supported formats: PDF, Images (PNG, JPG), Word docs.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Notes & Technical Observations
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Calibration observations or certificate notes..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900"
            />
          </div>

          {!isGuest && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {editingCal ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteCalibrationRecord(editingCal.id);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Record
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
                  <Save className="w-3.5 h-3.5" /> Save Calibration Record
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Certificate Document Viewer Popup */}
      <Modal
        isOpen={!!viewCert}
        onClose={() => setViewCert(null)}
        title={`Calibration Certificate Document: ${viewCert?.certificateNumber}`}
        subtitle="Calibration Execution & Attached Document Preview"
        maxWidth="xl"
      >
        {viewCert && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cert No:</span>
                <span className="font-bold text-blue-400">{viewCert.certificateNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Equipment:</span>
                <span className="font-bold text-white">{viewCert.equipmentId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Type:</span>
                <span className="capitalize font-bold text-purple-300">{viewCert.calibrationType || 'internal'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Executor / Vendor:</span>
                <span className="font-bold text-emerald-400">
                  {viewCert.calibrationType === 'external' ? viewCert.vendorName || 'N/A' : viewCert.technician || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cal Date:</span>
                <span>{viewCert.calibrationDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Next Due:</span>
                <span className="text-amber-400 font-bold">{viewCert.nextDueDate}</span>
              </div>
            </div>

            {viewCert.certificateFileData ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-blue-900">📄 Uploaded File: {viewCert.certificateFileName}</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">Base64 document attachment stored in system memory.</p>
                </div>
                <a
                  href={viewCert.certificateFileData}
                  download={viewCert.certificateFileName || 'Calibration_Certificate.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" /> Download / View Document
                </a>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">📄 Certificate File: {viewCert.certificateFileName || 'No file attached'}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reference document record.</p>
                </div>
                {viewCert.certificateFileName && (
                  <button
                    onClick={() => alert(`Simulated Download of document: ${viewCert.certificateFileName}`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
