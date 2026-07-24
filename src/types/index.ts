export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  active: boolean;
  lastLogin?: string;
}

export type EquipmentStatus = 'active' | 'inactive' | 'under_maintenance' | 'decommissioned';

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

export interface Location {
  id: string;
  name: string;
  building: string;
  room: string;
  description: string;
}

export interface Equipment {
  id: string; // Equipment ID / Asset Tag (e.g. LEMS-EQ-101)
  sapCode: string;
  name: string;
  categoryId: string;
  manufacturerId: string;
  model: string;
  serialNumber: string;
  tagNumber: string;
  locationId: string;
  department: string;
  status: EquipmentStatus;
  purchaseDate: string;
  commissionDate: string;
  calibrationFrequencyDays: number;
  pmFrequencyDays: number;
  measurementSpecs: string;
  notes: string;
  photoUrl?: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  lastPmDate?: string;
  nextPmDate?: string;
}

export type CalibrationResult = 'pass' | 'fail' | 'conditional';
export type CalibrationType = 'internal' | 'external';

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  calibrationType: CalibrationType;
  calibrationDate: string;
  nextDueDate: string;
  certificateNumber: string;
  technician?: string;
  vendorName?: string;
  result: CalibrationResult;
  certificateFileName?: string;
  certificateFileData?: string;
  notes: string;
}

export type PMFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface PMTask {
  id: string;
  equipmentId: string;
  taskName: string;
  frequency: PMFrequency;
  active: boolean;
}

export type PMTaskLogStatus = 'done' | 'not_done' | 'na';

export interface PMTaskLog {
  id: string;
  taskId: string;
  equipmentId: string;
  date: string; // YYYY-MM-DD
  periodKey: string; // e.g., "2026-07-22" or "2026-W30" or "2026-07"
  status: PMTaskLogStatus;
  performedBy: string;
  notes?: string;
}

export interface ChemicalInventory {
  id: string;
  name: string;
  casNumber: string;
  supplier: string;
  batchNumber: string;
  unit: string;
  initialStock: number;
  minimumStock: number;
  expiryDate: string;
  locationId: string;
  storageConditions: string;
  hazardClass: string;
  coaFileName?: string;
  coaFileData?: string;
  msdsFileName?: string;
  msdsFileData?: string;
  notes: string;
}

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export interface ChemicalTransaction {
  id: string;
  chemicalId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  performedBy: string;
  reason: string;
  notes: string;
}

export interface SparePartInventory {
  id: string;
  partNumber: string;
  name: string;
  supplier: string;
  category: string;
  unit: string;
  initialStock: number;
  minimumStock: number;
  maximumStock: number;
  locationId: string;
  unitCost: number;
  notes: string;
}

export interface SparePartTransaction {
  id: string;
  sparePartId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  performedBy: string;
  linkedEquipmentId?: string;
  reason: string;
  notes: string;
}

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRole: UserRole;
  module: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface CompanyProfile {
  companyName: string;
  labName: string;
  labCode: string;
  address: string;
  phone: string;
  email: string;
  isoStandard: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
