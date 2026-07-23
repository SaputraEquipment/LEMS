import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  EquipmentCategory,
  Manufacturer,
  Location,
  Equipment,
  CalibrationRecord,
  PMTask,
  PMTaskLog,
  ChemicalInventory,
  ChemicalTransaction,
  SparePartInventory,
  SparePartTransaction,
  AuditLog,
  CompanyProfile,
  SystemSetting,
  ToastMessage,
  AuditAction
} from '../types';
import {
  initialUsers,
  initialCompanyProfile,
  initialCategories,
  initialManufacturers,
  initialLocations,
  initialEquipment,
  initialCalibrationRecords,
  initialPMTasks,
  initialPMTaskLogs,
  initialChemicals,
  initialChemicalTransactions,
  initialSpareParts,
  initialSparePartTransactions,
  initialAuditLogs,
  initialSystemSettings
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: CompanyProfile) => void;

  systemSettings: SystemSetting[];
  updateSystemSetting: (id: string, value: string) => void;

  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  categories: EquipmentCategory[];
  addCategory: (cat: Omit<EquipmentCategory, 'id'>) => void;
  updateCategory: (cat: EquipmentCategory) => void;
  deleteCategory: (id: string) => void;

  manufacturers: Manufacturer[];
  addManufacturer: (mfr: Omit<Manufacturer, 'id'>) => void;
  updateManufacturer: (mfr: Manufacturer) => void;
  deleteManufacturer: (id: string) => void;

  locations: Location[];
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (loc: Location) => void;
  deleteLocation: (id: string) => void;

  equipment: Equipment[];
  addEquipment: (eq: Equipment) => boolean; // returns false if ID exists
  updateEquipment: (eq: Equipment) => void;
  deleteEquipment: (id: string) => void;

  calibrationRecords: CalibrationRecord[];
  addCalibrationRecord: (cal: Omit<CalibrationRecord, 'id'>) => void;
  updateCalibrationRecord: (cal: CalibrationRecord) => void;
  deleteCalibrationRecord: (id: string) => void;

  pmTasks: PMTask[];
  addPMTask: (task: Omit<PMTask, 'id'>) => void;
  updatePMTask: (task: PMTask) => void;
  deletePMTask: (id: string) => void;

  pmTaskLogs: PMTaskLog[];
  togglePMTaskLog: (taskId: string, equipmentId: string, date: string, periodKey: string, status: 'done' | 'not_done' | 'na', notes?: string) => void;

  chemicals: ChemicalInventory[];
  addChemical: (chem: Omit<ChemicalInventory, 'id'>) => void;
  updateChemical: (chem: ChemicalInventory) => void;
  deleteChemical: (id: string) => void;
  getChemicalCurrentStock: (chemId: string) => number;

  chemicalTransactions: ChemicalTransaction[];
  addChemicalTransaction: (tx: Omit<ChemicalTransaction, 'id'>) => void;

  spareParts: SparePartInventory[];
  addSparePart: (sp: Omit<SparePartInventory, 'id'>) => void;
  updateSparePart: (sp: SparePartInventory) => void;
  deleteSparePart: (id: string) => void;
  getSparePartCurrentStock: (spId: string) => number;

  sparePartTransactions: SparePartTransaction[];
  addSparePartTransaction: (tx: Omit<SparePartTransaction, 'id'>) => void;

  auditLogs: AuditLog[];
  addAuditEntry: (module: string, action: AuditAction, entityType: string, entityId: string, details: string) => void;

  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'LEMS_APP_STATE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStored('currentUser', initialUsers[0]));
  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const loaded = loadStored('companyProfile', initialCompanyProfile);
    if (!loaded || !loaded.labName || loaded.labName.includes('Central Physical') || loaded.labName.includes('Quality Assurance Analytical')) {
      return { ...initialCompanyProfile, labName: 'Quality Department' };
    }
    return loaded;
  });
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>(() => loadStored('systemSettings', initialSystemSettings));
  const [categories, setCategories] = useState<EquipmentCategory[]>(() => loadStored('categories', initialCategories));
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() => loadStored('manufacturers', initialManufacturers));
  const [locations, setLocations] = useState<Location[]>(() => loadStored('locations', initialLocations));
  const [equipment, setEquipment] = useState<Equipment[]>(() => loadStored('equipment', initialEquipment));
  const [calibrationRecords, setCalibrationRecords] = useState<CalibrationRecord[]>(() => loadStored('calibrationRecords', initialCalibrationRecords));
  const [pmTasks, setPmTasks] = useState<PMTask[]>(() => loadStored('pmTasks', initialPMTasks));
  const [pmTaskLogs, setPmTaskLogs] = useState<PMTaskLog[]>(() => loadStored('pmTaskLogs', initialPMTaskLogs));
  const [chemicals, setChemicals] = useState<ChemicalInventory[]>(() => loadStored('chemicals', initialChemicals));
  const [chemicalTransactions, setChemicalTransactions] = useState<ChemicalTransaction[]>(() => loadStored('chemicalTransactions', initialChemicalTransactions));
  const [spareParts, setSpareParts] = useState<SparePartInventory[]>(() => loadStored('spareParts', initialSpareParts));
  const [sparePartTransactions, setSparePartTransactions] = useState<SparePartTransaction[]>(() => loadStored('sparePartTransactions', initialSparePartTransactions));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('auditLogs', initialAuditLogs));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage persist effects
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_companyProfile`, JSON.stringify(companyProfile)); }, [companyProfile]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_systemSettings`, JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_manufacturers`, JSON.stringify(manufacturers)); }, [manufacturers]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_locations`, JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_equipment`, JSON.stringify(equipment)); }, [equipment]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_calibrationRecords`, JSON.stringify(calibrationRecords)); }, [calibrationRecords]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_pmTasks`, JSON.stringify(pmTasks)); }, [pmTasks]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_pmTaskLogs`, JSON.stringify(pmTaskLogs)); }, [pmTaskLogs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_chemicals`, JSON.stringify(chemicals)); }, [chemicals]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_chemicalTransactions`, JSON.stringify(chemicalTransactions)); }, [chemicalTransactions]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_spareParts`, JSON.stringify(spareParts)); }, [spareParts]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_sparePartTransactions`, JSON.stringify(sparePartTransactions)); }, [sparePartTransactions]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Audit Log recording
  const addAuditEntry = (module: string, action: AuditAction, entityType: string, entityId: string, details: string) => {
    if (!currentUser) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      module,
      action,
      entityType,
      entityId,
      details,
      timestamp: formattedDate
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth methods
  const login = (username: string): boolean => {
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.active);
    if (found) {
      setCurrentUser(found);
      addToast('success', 'Welcome back!', `Logged in as ${found.fullName} (${found.role.toUpperCase()})`);
      return true;
    }
    // Fallback if entering "admin"
    if (username.toLowerCase() === 'admin') {
      const adminUser = users.find(u => u.role === 'admin') || initialUsers[0];
      setCurrentUser(adminUser);
      addToast('success', 'Welcome back!', `Logged in as Admin`);
      return true;
    }
    addToast('error', 'Authentication Failed', 'Invalid username or user account is inactive.');
    return false;
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'usr-guest-00',
      username: 'guest',
      fullName: 'Guest Observer',
      email: 'guest@tobacco-quality.com',
      role: 'guest',
      active: true,
    };
    setCurrentUser(guestUser);
    addToast('info', 'Guest Access Mode Enabled', 'You have read-only access to all operational modules.');
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('info', 'Logged Out', 'You have been signed out of LEMS.');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'guest') {
      loginAsGuest();
      return;
    }
    const matching = users.find(u => u.role === role && u.active) || {
      id: `usr-${role}-demo`,
      username: role === 'admin' ? 'admin' : 'tech_sarah',
      fullName: role === 'admin' ? 'Dr. Marcus Vance (Admin)' : 'Sarah Jenkins (Technician)',
      email: `${role}@tobacco-quality.com`,
      role,
      active: true
    };
    setCurrentUser(matching);
    addToast('info', 'Role Switched', `Now operating under ${role.toUpperCase()} profile.`);
  };

  // Calculated Stock helper functions
  const getChemicalCurrentStock = (chemId: string): number => {
    const chem = chemicals.find(c => c.id === chemId);
    if (!chem) return 0;
    const txs = chemicalTransactions.filter(t => t.chemicalId === chemId);
    let stock = chem.initialStock;
    txs.forEach(t => {
      if (t.type === 'stock_in') stock += t.quantity;
      else if (t.type === 'stock_out') stock -= t.quantity;
      else if (t.type === 'adjustment') stock += t.quantity; // adjustment can be positive or negative
    });
    return Math.max(0, stock);
  };

  const getSparePartCurrentStock = (spId: string): number => {
    const sp = spareParts.find(s => s.id === spId);
    if (!sp) return 0;
    const txs = sparePartTransactions.filter(t => t.sparePartId === spId);
    let stock = sp.initialStock;
    txs.forEach(t => {
      if (t.type === 'stock_in') stock += t.quantity;
      else if (t.type === 'stock_out') stock -= t.quantity;
      else if (t.type === 'adjustment') stock += t.quantity;
    });
    return Math.max(0, stock);
  };

  // Automatic Equipment Calibration Dates recalculation
  const recalculateEquipmentCalDates = (eqId: string, records: CalibrationRecord[]) => {
    const eq = equipment.find(e => e.id === eqId);
    if (!eq) return;
    const eqRecords = records.filter(r => r.equipmentId === eqId).sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate));
    if (eqRecords.length > 0) {
      const latest = eqRecords[0];
      setEquipment(prev => prev.map(e => e.id === eqId ? {
        ...e,
        lastCalibrationDate: latest.calibrationDate,
        nextCalibrationDate: latest.nextDueDate
      } : e));
    }
  };

  // Company Profile & Settings
  const updateCompanyProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    addAuditEntry('Company Settings', 'update', 'CompanyProfile', 'PROFILE-01', `Updated company laboratory profile: ${profile.companyName}`);
    addToast('success', 'Profile Saved', 'Company profile has been updated.');
  };

  const updateSystemSetting = (id: string, value: string) => {
    setSystemSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    addAuditEntry('System Settings', 'update', 'SystemSetting', id, `Updated setting value to: ${value}`);
    addToast('success', 'Setting Saved', 'System configuration updated successfully.');
  };

  // Users
  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = { ...newUser, id: `usr-${Date.now()}` };
    setUsers(prev => [...prev, user]);
    addAuditEntry('User Management', 'create', 'User', user.id, `Created new user account: ${user.username} (${user.role})`);
    addToast('success', 'User Created', `Account for ${user.username} has been added.`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addAuditEntry('User Management', 'update', 'User', updatedUser.id, `Updated user details for: ${updatedUser.username}`);
    addToast('success', 'User Updated', `Account ${updatedUser.username} saved.`);
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      addToast('error', 'Self-Delete Protection', 'You cannot delete your own active user session.');
      return;
    }
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (target) {
      addAuditEntry('User Management', 'delete', 'User', id, `Deleted user account: ${target.username}`);
      addToast('success', 'User Deleted', `Account ${target.username} has been removed.`);
    }
  };

  // Master Data
  const addCategory = (cat: Omit<EquipmentCategory, 'id'>) => {
    const newCat = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    addAuditEntry('Master Data', 'create', 'EquipmentCategory', newCat.id, `Created category: ${newCat.name}`);
    addToast('success', 'Category Created', newCat.name);
  };

  const updateCategory = (cat: EquipmentCategory) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    addAuditEntry('Master Data', 'update', 'EquipmentCategory', cat.id, `Updated category: ${cat.name}`);
    addToast('success', 'Category Updated', cat.name);
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    addAuditEntry('Master Data', 'delete', 'EquipmentCategory', id, `Deleted category: ${cat?.name || id}`);
    addToast('success', 'Category Deleted');
  };

  const addManufacturer = (mfr: Omit<Manufacturer, 'id'>) => {
    const newMfr = { ...mfr, id: `mfr-${Date.now()}` };
    setManufacturers(prev => [...prev, newMfr]);
    addAuditEntry('Master Data', 'create', 'Manufacturer', newMfr.id, `Added manufacturer: ${newMfr.name}`);
    addToast('success', 'Manufacturer Added', newMfr.name);
  };

  const updateManufacturer = (mfr: Manufacturer) => {
    setManufacturers(prev => prev.map(m => m.id === mfr.id ? mfr : m));
    addAuditEntry('Master Data', 'update', 'Manufacturer', mfr.id, `Updated manufacturer: ${mfr.name}`);
    addToast('success', 'Manufacturer Updated', mfr.name);
  };

  const deleteManufacturer = (id: string) => {
    const mfr = manufacturers.find(m => m.id === id);
    setManufacturers(prev => prev.filter(m => m.id !== id));
    addAuditEntry('Master Data', 'delete', 'Manufacturer', id, `Deleted manufacturer: ${mfr?.name || id}`);
    addToast('success', 'Manufacturer Removed');
  };

  const addLocation = (loc: Omit<Location, 'id'>) => {
    const newLoc = { ...loc, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
    addAuditEntry('Master Data', 'create', 'Location', newLoc.id, `Added location: ${newLoc.name}`);
    addToast('success', 'Location Created', newLoc.name);
  };

  const updateLocation = (loc: Location) => {
    setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    addAuditEntry('Master Data', 'update', 'Location', loc.id, `Updated location: ${loc.name}`);
    addToast('success', 'Location Updated', loc.name);
  };

  const deleteLocation = (id: string) => {
    const loc = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    addAuditEntry('Master Data', 'delete', 'Location', id, `Deleted location: ${loc?.name || id}`);
    addToast('success', 'Location Removed');
  };

  // Equipment
  const addEquipment = (eq: Equipment): boolean => {
    const exists = equipment.some(e => e.id.toLowerCase() === eq.id.toLowerCase());
    if (exists) {
      addToast('error', 'Duplicate Equipment ID', `An equipment item with ID "${eq.id}" already exists.`);
      return false;
    }
    setEquipment(prev => [...prev, eq]);
    addAuditEntry('Equipment', 'create', 'Equipment', eq.id, `Registered new equipment: ${eq.name} (${eq.id})`);
    addToast('success', 'Equipment Added', `${eq.name} registered successfully.`);
    return true;
  };

  const updateEquipment = (eq: Equipment) => {
    setEquipment(prev => prev.map(e => e.id === eq.id ? eq : e));
    addAuditEntry('Equipment', 'update', 'Equipment', eq.id, `Updated equipment specs/status for ${eq.name} (${eq.id})`);
    addToast('success', 'Equipment Saved', `${eq.name} details updated.`);
  };

  const deleteEquipment = (id: string) => {
    const target = equipment.find(e => e.id === id);
    setEquipment(prev => prev.filter(e => e.id !== id));
    addAuditEntry('Equipment', 'delete', 'Equipment', id, `Decommissioned & deleted equipment asset: ${target?.name || id}`);
    addToast('success', 'Equipment Removed', `${target?.name || id} deleted.`);
  };

  // Calibration Records
  const addCalibrationRecord = (cal: Omit<CalibrationRecord, 'id'>) => {
    const newCal: CalibrationRecord = { ...cal, id: `CAL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` };
    const updatedRecords = [newCal, ...calibrationRecords];
    setCalibrationRecords(updatedRecords);
    recalculateEquipmentCalDates(newCal.equipmentId, updatedRecords);
    addAuditEntry('Calibration', 'create', 'CalibrationRecord', newCal.id, `Added calibration record ${newCal.certificateNumber} for ${newCal.equipmentId} with result: ${newCal.result.toUpperCase()}`);
    addToast('success', 'Calibration Record Saved', `Certificate ${newCal.certificateNumber} logged.`);
  };

  const updateCalibrationRecord = (cal: CalibrationRecord) => {
    const updatedRecords = calibrationRecords.map(c => c.id === cal.id ? cal : c);
    setCalibrationRecords(updatedRecords);
    recalculateEquipmentCalDates(cal.equipmentId, updatedRecords);
    addAuditEntry('Calibration', 'update', 'CalibrationRecord', cal.id, `Updated calibration details for ${cal.certificateNumber}`);
    addToast('success', 'Calibration Updated', `Record ${cal.certificateNumber} saved.`);
  };

  const deleteCalibrationRecord = (id: string) => {
    const target = calibrationRecords.find(c => c.id === id);
    const updatedRecords = calibrationRecords.filter(c => c.id !== id);
    setCalibrationRecords(updatedRecords);
    if (target) {
      recalculateEquipmentCalDates(target.equipmentId, updatedRecords);
      addAuditEntry('Calibration', 'delete', 'CalibrationRecord', id, `Deleted calibration certificate ${target.certificateNumber}`);
    }
    addToast('success', 'Record Deleted');
  };

  // PM Tasks
  const addPMTask = (task: Omit<PMTask, 'id'>) => {
    const newTask: PMTask = { ...task, id: `task-${Date.now()}` };
    setPmTasks(prev => [...prev, newTask]);
    addAuditEntry('PM Setup', 'create', 'PMTask', newTask.id, `Added PM Task "${newTask.taskName}" for ${newTask.equipmentId}`);
    addToast('success', 'PM Task Added', newTask.taskName);
  };

  const updatePMTask = (task: PMTask) => {
    setPmTasks(prev => prev.map(t => t.id === task.id ? task : t));
    addAuditEntry('PM Setup', 'update', 'PMTask', task.id, `Updated PM Task "${task.taskName}"`);
    addToast('success', 'PM Task Updated', task.taskName);
  };

  const deletePMTask = (id: string) => {
    const task = pmTasks.find(t => t.id === id);
    setPmTasks(prev => prev.filter(t => t.id !== id));
    addAuditEntry('PM Setup', 'delete', 'PMTask', id, `Deleted PM task: ${task?.taskName || id}`);
    addToast('success', 'PM Task Removed');
  };

  const togglePMTaskLog = (taskId: string, equipmentId: string, date: string, periodKey: string, status: 'done' | 'not_done' | 'na', notes?: string) => {
    const existingIndex = pmTaskLogs.findIndex(l => l.taskId === taskId && l.periodKey === periodKey);
    let newLogs = [...pmTaskLogs];
    if (existingIndex >= 0) {
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        status,
        performedBy: currentUser?.username || 'user',
        notes: notes !== undefined ? notes : newLogs[existingIndex].notes
      };
    } else {
      newLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        taskId,
        equipmentId,
        date,
        periodKey,
        status,
        performedBy: currentUser?.username || 'user',
        notes
      });
    }
    setPmTaskLogs(newLogs);
    addAuditEntry('PM Checklist', 'update', 'PMTaskLog', taskId, `Updated PM checklist status to ${status.toUpperCase()} for period ${periodKey}`);
  };

  // Chemicals
  const addChemical = (chem: Omit<ChemicalInventory, 'id'>) => {
    const newChem: ChemicalInventory = { ...chem, id: `CHEM-${chem.name.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}` };
    setChemicals(prev => [...prev, newChem]);
    addAuditEntry('Chemical Inventory', 'create', 'ChemicalInventory', newChem.id, `Registered chemical standard: ${newChem.name} (CAS ${newChem.casNumber})`);
    addToast('success', 'Chemical Registered', newChem.name);
  };

  const updateChemical = (chem: ChemicalInventory) => {
    setChemicals(prev => prev.map(c => c.id === chem.id ? chem : c));
    addAuditEntry('Chemical Inventory', 'update', 'ChemicalInventory', chem.id, `Updated details for chemical: ${chem.name}`);
    addToast('success', 'Chemical Saved', chem.name);
  };

  const deleteChemical = (id: string) => {
    const chem = chemicals.find(c => c.id === id);
    setChemicals(prev => prev.filter(c => c.id !== id));
    addAuditEntry('Chemical Inventory', 'delete', 'ChemicalInventory', id, `Removed chemical entry: ${chem?.name || id}`);
    addToast('success', 'Chemical Removed');
  };

  const addChemicalTransaction = (tx: Omit<ChemicalTransaction, 'id'>) => {
    const newTx: ChemicalTransaction = { ...tx, id: `TX-CHEM-${Date.now()}` };
    setChemicalTransactions(prev => [newTx, ...prev]);
    const chem = chemicals.find(c => c.id === tx.chemicalId);
    addAuditEntry('Chemical Transactions', 'create', 'ChemicalTransaction', newTx.id, `Logged ${tx.type.toUpperCase()} of ${tx.quantity} ${chem?.unit || ''} for ${chem?.name || tx.chemicalId}`);
    addToast('success', 'Transaction Recorded', `${tx.type.replace('_', ' ').toUpperCase()}: ${tx.quantity} ${chem?.unit || ''}`);
  };

  // Spare Parts
  const addSparePart = (sp: Omit<SparePartInventory, 'id'>) => {
    const newSp: SparePartInventory = { ...sp, id: `SP-${sp.partNumber.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}` };
    setSpareParts(prev => [...prev, newSp]);
    addAuditEntry('Spare Parts Inventory', 'create', 'SparePartInventory', newSp.id, `Added spare part: ${newSp.name} (P/N ${newSp.partNumber})`);
    addToast('success', 'Spare Part Registered', newSp.name);
  };

  const updateSparePart = (sp: SparePartInventory) => {
    setSpareParts(prev => prev.map(s => s.id === sp.id ? sp : s));
    addAuditEntry('Spare Parts Inventory', 'update', 'SparePartInventory', sp.id, `Updated spare part: ${sp.name}`);
    addToast('success', 'Spare Part Saved', sp.name);
  };

  const deleteSparePart = (id: string) => {
    const sp = spareParts.find(s => s.id === id);
    setSpareParts(prev => prev.filter(s => s.id !== id));
    addAuditEntry('Spare Parts Inventory', 'delete', 'SparePartInventory', id, `Deleted spare part: ${sp?.name || id}`);
    addToast('success', 'Spare Part Removed');
  };

  const addSparePartTransaction = (tx: Omit<SparePartTransaction, 'id'>) => {
    const newTx: SparePartTransaction = { ...tx, id: `TX-SP-${Date.now()}` };
    setSparePartTransactions(prev => [newTx, ...prev]);
    const sp = spareParts.find(s => s.id === tx.sparePartId);
    addAuditEntry('Spare Parts Transactions', 'create', 'SparePartTransaction', newTx.id, `Logged ${tx.type.toUpperCase()} of ${tx.quantity} units for ${sp?.name || tx.sparePartId}`);
    addToast('success', 'Transaction Recorded', `${tx.type.replace('_', ' ').toUpperCase()}: ${tx.quantity} ${sp?.unit || ''}`);
  };

  // Reset Factory Data
  const resetToInitialData = () => {
    setCurrentUser(initialUsers[0]);
    setUsers(initialUsers);
    setCompanyProfile(initialCompanyProfile);
    setSystemSettings(initialSystemSettings);
    setCategories(initialCategories);
    setManufacturers(initialManufacturers);
    setLocations(initialLocations);
    setEquipment(initialEquipment);
    setCalibrationRecords(initialCalibrationRecords);
    setPmTasks(initialPMTasks);
    setPmTaskLogs(initialPMTaskLogs);
    setChemicals(initialChemicals);
    setChemicalTransactions(initialChemicalTransactions);
    setSpareParts(initialSpareParts);
    setSparePartTransactions(initialSparePartTransactions);
    setAuditLogs(initialAuditLogs);
    localStorage.clear();
    addToast('info', 'System Reset', 'All data has been reset to default factory seed state.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        loginAsGuest,
        logout,
        switchRole,
        companyProfile,
        updateCompanyProfile,
        systemSettings,
        updateSystemSetting,
        users,
        addUser,
        updateUser,
        deleteUser,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        manufacturers,
        addManufacturer,
        updateManufacturer,
        deleteManufacturer,
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        equipment,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        calibrationRecords,
        addCalibrationRecord,
        updateCalibrationRecord,
        deleteCalibrationRecord,
        pmTasks,
        addPMTask,
        updatePMTask,
        deletePMTask,
        pmTaskLogs,
        togglePMTaskLog,
        chemicals,
        addChemical,
        updateChemical,
        deleteChemical,
        getChemicalCurrentStock,
        chemicalTransactions,
        addChemicalTransaction,
        spareParts,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        getSparePartCurrentStock,
        sparePartTransactions,
        addSparePartTransaction,
        auditLogs,
        addAuditEntry,
        toasts,
        addToast,
        removeToast,
        resetToInitialData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
