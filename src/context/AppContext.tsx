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

// Helper to execute SQL statement on backend SQLite database
const syncSql = (sql: string, params: any[] = []) => {
  fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params })
  }).catch(err => {
    console.error('[SQLite Sync Error]:', err);
  });
};

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

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Clear session on mount to guarantee login screen on fresh open
  useEffect(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    } catch {
      // ignore
    }
  }, []);

  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => loadStored('companyProfile', initialCompanyProfile));
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

  // Fetch SQLite database data on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data && data.users) {
          if (Array.isArray(data.users)) setUsers(data.users);
          if (data.companyProfile) setCompanyProfile(data.companyProfile);
          if (Array.isArray(data.systemSettings)) setSystemSettings(data.systemSettings);
          if (Array.isArray(data.categories)) setCategories(data.categories);
          if (Array.isArray(data.manufacturers)) setManufacturers(data.manufacturers);
          if (Array.isArray(data.locations)) setLocations(data.locations);
          if (Array.isArray(data.equipment)) setEquipment(data.equipment);
          if (Array.isArray(data.calibrationRecords)) setCalibrationRecords(data.calibrationRecords);
          if (Array.isArray(data.pmTasks)) setPmTasks(data.pmTasks);
          if (Array.isArray(data.pmTaskLogs)) setPmTaskLogs(data.pmTaskLogs);
          if (Array.isArray(data.chemicals)) setChemicals(data.chemicals);
          if (Array.isArray(data.chemicalTransactions)) setChemicalTransactions(data.chemicalTransactions);
          if (Array.isArray(data.spareParts)) setSpareParts(data.spareParts);
          if (Array.isArray(data.sparePartTransactions)) setSparePartTransactions(data.sparePartTransactions);
          if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        }
      })
      .catch(err => {
        console.warn('Falling back to local storage cache:', err);
      });
  }, []);

  // Sync to LocalStorage as secondary cache
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
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
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

    // SQLite Sync
    syncSql(
      `INSERT INTO audit_logs (id, userId, username, userRole, module, action, entityType, entityId, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLog.id, newLog.userId || '', newLog.username, newLog.userRole, newLog.module, newLog.action, newLog.entityType, newLog.entityId || '', newLog.details, newLog.timestamp]
    );
  };

  // Auth methods
  const login = (inputUsername: string, inputPassword?: string): boolean => {
    const trimmedUser = inputUsername.trim().toLowerCase();
    const found = users.find(u => u.username.toLowerCase() === trimmedUser);

    if (!found) {
      addToast('error', 'Authentication Failed', 'Username not registered in system.');
      return false;
    }

    if (!found.active) {
      addToast('error', 'Account Suspended', `Account "${found.username}" is currently inactive. Contact QA Administrator.`);
      return false;
    }

    // Verify Password if set
    if (found.password && found.password.trim() !== '') {
      if (!inputPassword || inputPassword !== found.password) {
        addToast('error', 'Authentication Failed', 'Incorrect password. Please verify your credentials.');
        return false;
      }
    }

    // Update last login timestamp
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedUser = { ...found, lastLogin: nowStr };

    setUsers(prev => prev.map(u => u.id === found.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    addAuditEntry('Authentication', 'login', 'User', found.id, `User ${found.username} (${found.role}) signed in successfully`);
    addToast('success', 'Authentication Successful', `Welcome back, ${found.fullName}`);
    return true;
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
      else if (t.type === 'adjustment') stock += t.quantity;
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

      syncSql(
        `UPDATE equipment SET lastCalibrationDate=?, nextCalibrationDate=? WHERE id=?`,
        [latest.calibrationDate, latest.nextDueDate, eqId]
      );
    }
  };

  // Company Profile & Settings
  const updateCompanyProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    syncSql(
      `UPDATE company_profile SET companyName=?, labName=?, labCode=?, address=?, phone=?, email=?, isoStandard=? WHERE id=1`,
      [profile.companyName, profile.labName, profile.labCode, profile.address, profile.phone, profile.email, profile.isoStandard]
    );
    addAuditEntry('Company Settings', 'update', 'CompanyProfile', 'PROFILE-01', `Updated company laboratory profile: ${profile.companyName}`);
    addToast('success', 'Profile Saved', 'Company profile updated in SQLite database.');
  };

  const updateSystemSetting = (id: string, value: string) => {
    setSystemSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    syncSql(`UPDATE system_settings SET value=? WHERE id=?`, [value, id]);
    addAuditEntry('System Settings', 'update', 'SystemSetting', id, `Updated setting value to: ${value}`);
    addToast('success', 'Setting Saved', 'System configuration updated successfully.');
  };

  // Users
  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = { ...newUser, id: `usr-${Date.now()}` };
    setUsers(prev => [...prev, user]);
    syncSql(
      `INSERT INTO users (id, username, password, fullName, email, role, department, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.username, user.password || 'password123', user.fullName, user.email, user.role, user.department || '', user.active ? 1 : 0]
    );
    addAuditEntry('User Management', 'create', 'User', user.id, `Created new user account: ${user.username} (${user.role})`);
    addToast('success', 'User Created', `Account for ${user.username} saved to database.`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncSql(
      `UPDATE users SET username=?, password=?, fullName=?, email=?, role=?, department=?, active=? WHERE id=?`,
      [updatedUser.username, updatedUser.password || 'password123', updatedUser.fullName, updatedUser.email, updatedUser.role, updatedUser.department || '', updatedUser.active ? 1 : 0, updatedUser.id]
    );
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
    syncSql(`DELETE FROM users WHERE id=?`, [id]);
    if (target) {
      addAuditEntry('User Management', 'delete', 'User', id, `Deleted user account: ${target.username}`);
      addToast('success', 'User Deleted', `Account ${target.username} has been removed.`);
    }
  };

  // Master Data
  const addCategory = (cat: Omit<EquipmentCategory, 'id'>) => {
    const newCat = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    syncSql(`INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`, [newCat.id, newCat.name, newCat.description || '']);
    addAuditEntry('Master Data', 'create', 'EquipmentCategory', newCat.id, `Created category: ${newCat.name}`);
    addToast('success', 'Category Created', newCat.name);
  };

  const updateCategory = (cat: EquipmentCategory) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    syncSql(`UPDATE categories SET name=?, description=? WHERE id=?`, [cat.name, cat.description || '', cat.id]);
    addAuditEntry('Master Data', 'update', 'EquipmentCategory', cat.id, `Updated category: ${cat.name}`);
    addToast('success', 'Category Updated', cat.name);
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    syncSql(`DELETE FROM categories WHERE id=?`, [id]);
    addAuditEntry('Master Data', 'delete', 'EquipmentCategory', id, `Deleted category: ${cat?.name || id}`);
    addToast('success', 'Category Deleted');
  };

  const addManufacturer = (mfr: Omit<Manufacturer, 'id'>) => {
    const newMfr = { ...mfr, id: `mfr-${Date.now()}` };
    setManufacturers(prev => [...prev, newMfr]);
    syncSql(
      `INSERT INTO manufacturers (id, name, contactPerson, email, phone, address, website) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newMfr.id, newMfr.name, newMfr.contactPerson || '', newMfr.email || '', newMfr.phone || '', newMfr.address || '', newMfr.website || '']
    );
    addAuditEntry('Master Data', 'create', 'Manufacturer', newMfr.id, `Added manufacturer: ${newMfr.name}`);
    addToast('success', 'Manufacturer Added', newMfr.name);
  };

  const updateManufacturer = (mfr: Manufacturer) => {
    setManufacturers(prev => prev.map(m => m.id === mfr.id ? mfr : m));
    syncSql(
      `UPDATE manufacturers SET name=?, contactPerson=?, email=?, phone=?, address=?, website=? WHERE id=?`,
      [mfr.name, mfr.contactPerson || '', mfr.email || '', mfr.phone || '', mfr.address || '', mfr.website || '', mfr.id]
    );
    addAuditEntry('Master Data', 'update', 'Manufacturer', mfr.id, `Updated manufacturer: ${mfr.name}`);
    addToast('success', 'Manufacturer Updated', mfr.name);
  };

  const deleteManufacturer = (id: string) => {
    const mfr = manufacturers.find(m => m.id === id);
    setManufacturers(prev => prev.filter(m => m.id !== id));
    syncSql(`DELETE FROM manufacturers WHERE id=?`, [id]);
    addAuditEntry('Master Data', 'delete', 'Manufacturer', id, `Deleted manufacturer: ${mfr?.name || id}`);
    addToast('success', 'Manufacturer Removed');
  };

  const addLocation = (loc: Omit<Location, 'id'>) => {
    const newLoc = { ...loc, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
    syncSql(
      `INSERT INTO locations (id, name, building, room, description) VALUES (?, ?, ?, ?, ?)`,
      [newLoc.id, newLoc.name, newLoc.building || '', newLoc.room || '', newLoc.description || '']
    );
    addAuditEntry('Master Data', 'create', 'Location', newLoc.id, `Added location: ${newLoc.name}`);
    addToast('success', 'Location Created', newLoc.name);
  };

  const updateLocation = (loc: Location) => {
    setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    syncSql(
      `UPDATE locations SET name=?, building=?, room=?, description=? WHERE id=?`,
      [loc.name, loc.building || '', loc.room || '', loc.description || '', loc.id]
    );
    addAuditEntry('Master Data', 'update', 'Location', loc.id, `Updated location: ${loc.name}`);
    addToast('success', 'Location Updated', loc.name);
  };

  const deleteLocation = (id: string) => {
    const loc = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    syncSql(`DELETE FROM locations WHERE id=?`, [id]);
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
    syncSql(
      `INSERT INTO equipment (id, sapCode, name, categoryId, manufacturerId, model, serialNumber, tagNumber, locationId, department, status, purchaseDate, commissionDate, calibrationFrequencyDays, pmFrequencyDays, measurementSpecs, notes, photoUrl, lastCalibrationDate, nextCalibrationDate, lastPmDate, nextPmDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eq.id, eq.sapCode || '', eq.name, eq.categoryId, eq.manufacturerId, eq.model || '',
        eq.serialNumber || '', eq.tagNumber || '', eq.locationId, eq.department || '', eq.status,
        eq.purchaseDate || '', eq.commissionDate || '', eq.calibrationFrequencyDays || 0, eq.pmFrequencyDays || 0,
        eq.measurementSpecs || '', eq.notes || '', eq.photoUrl || '', eq.lastCalibrationDate || '',
        eq.nextCalibrationDate || '', eq.lastPmDate || '', eq.nextPmDate || ''
      ]
    );
    addAuditEntry('Equipment', 'create', 'Equipment', eq.id, `Registered new equipment: ${eq.name} (${eq.id})`);
    addToast('success', 'Equipment Added', `${eq.name} registered to SQLite database.`);
    return true;
  };

  const updateEquipment = (eq: Equipment) => {
    setEquipment(prev => prev.map(e => e.id === eq.id ? eq : e));
    syncSql(
      `UPDATE equipment SET sapCode=?, name=?, categoryId=?, manufacturerId=?, model=?, serialNumber=?, tagNumber=?, locationId=?, department=?, status=?, purchaseDate=?, commissionDate=?, calibrationFrequencyDays=?, pmFrequencyDays=?, measurementSpecs=?, notes=?, photoUrl=?, lastCalibrationDate=?, nextCalibrationDate=?, lastPmDate=?, nextPmDate=? WHERE id=?`,
      [
        eq.sapCode || '', eq.name, eq.categoryId, eq.manufacturerId, eq.model || '',
        eq.serialNumber || '', eq.tagNumber || '', eq.locationId, eq.department || '', eq.status,
        eq.purchaseDate || '', eq.commissionDate || '', eq.calibrationFrequencyDays || 0, eq.pmFrequencyDays || 0,
        eq.measurementSpecs || '', eq.notes || '', eq.photoUrl || '', eq.lastCalibrationDate || '',
        eq.nextCalibrationDate || '', eq.lastPmDate || '', eq.nextPmDate || '', eq.id
      ]
    );
    addAuditEntry('Equipment', 'update', 'Equipment', eq.id, `Updated equipment specs/status for ${eq.name} (${eq.id})`);
    addToast('success', 'Equipment Saved', `${eq.name} details updated in database.`);
  };

  const deleteEquipment = (id: string) => {
    const target = equipment.find(e => e.id === id);
    setEquipment(prev => prev.filter(e => e.id !== id));
    syncSql(`DELETE FROM equipment WHERE id=?`, [id]);
    addAuditEntry('Equipment', 'delete', 'Equipment', id, `Decommissioned & deleted equipment asset: ${target?.name || id}`);
    addToast('success', 'Equipment Removed', `${target?.name || id} deleted.`);
  };

  // Calibration Records
  const addCalibrationRecord = (cal: Omit<CalibrationRecord, 'id'>) => {
    const newCal: CalibrationRecord = { ...cal, id: `CAL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` };
    const updatedRecords = [newCal, ...calibrationRecords];
    setCalibrationRecords(updatedRecords);
    syncSql(
      `INSERT INTO calibration_records (id, equipmentId, calibrationType, vendorName, technician, calibrationDate, nextDueDate, certificateNumber, result, certificateFileName, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCal.id, newCal.equipmentId, newCal.calibrationType, newCal.vendorName || '', newCal.technician || '',
        newCal.calibrationDate, newCal.nextDueDate, newCal.certificateNumber || '', newCal.result,
        newCal.certificateFileName || '', newCal.notes || ''
      ]
    );
    recalculateEquipmentCalDates(newCal.equipmentId, updatedRecords);
    addAuditEntry('Calibration', 'create', 'CalibrationRecord', newCal.id, `Added calibration record ${newCal.certificateNumber} for ${newCal.equipmentId} with result: ${newCal.result.toUpperCase()}`);
    addToast('success', 'Calibration Record Saved', `Certificate ${newCal.certificateNumber} logged in SQLite.`);
  };

  const updateCalibrationRecord = (cal: CalibrationRecord) => {
    const updatedRecords = calibrationRecords.map(c => c.id === cal.id ? cal : c);
    setCalibrationRecords(updatedRecords);
    syncSql(
      `UPDATE calibration_records SET equipmentId=?, calibrationType=?, vendorName=?, technician=?, calibrationDate=?, nextDueDate=?, certificateNumber=?, result=?, certificateFileName=?, notes=? WHERE id=?`,
      [
        cal.equipmentId, cal.calibrationType, cal.vendorName || '', cal.technician || '',
        cal.calibrationDate, cal.nextDueDate, cal.certificateNumber || '', cal.result,
        cal.certificateFileName || '', cal.notes || '', cal.id
      ]
    );
    recalculateEquipmentCalDates(cal.equipmentId, updatedRecords);
    addAuditEntry('Calibration', 'update', 'CalibrationRecord', cal.id, `Updated calibration details for ${cal.certificateNumber}`);
    addToast('success', 'Calibration Updated', `Record ${cal.certificateNumber} saved.`);
  };

  const deleteCalibrationRecord = (id: string) => {
    const target = calibrationRecords.find(c => c.id === id);
    const updatedRecords = calibrationRecords.filter(c => c.id !== id);
    setCalibrationRecords(updatedRecords);
    syncSql(`DELETE FROM calibration_records WHERE id=?`, [id]);
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
    syncSql(
      `INSERT INTO pm_tasks (id, equipmentId, taskName, frequency, active) VALUES (?, ?, ?, ?, ?)`,
      [newTask.id, newTask.equipmentId, newTask.taskName, newTask.frequency, newTask.active ? 1 : 0]
    );
    addAuditEntry('PM Setup', 'create', 'PMTask', newTask.id, `Added PM Task "${newTask.taskName}" for ${newTask.equipmentId}`);
    addToast('success', 'PM Task Added', newTask.taskName);
  };

  const updatePMTask = (task: PMTask) => {
    setPmTasks(prev => prev.map(t => t.id === task.id ? task : t));
    syncSql(
      `UPDATE pm_tasks SET equipmentId=?, taskName=?, frequency=?, active=? WHERE id=?`,
      [task.equipmentId, task.taskName, task.frequency, task.active ? 1 : 0, task.id]
    );
    addAuditEntry('PM Setup', 'update', 'PMTask', task.id, `Updated PM Task "${task.taskName}"`);
    addToast('success', 'PM Task Updated', task.taskName);
  };

  const deletePMTask = (id: string) => {
    const task = pmTasks.find(t => t.id === id);
    setPmTasks(prev => prev.filter(t => t.id !== id));
    syncSql(`DELETE FROM pm_tasks WHERE id=?`, [id]);
    addAuditEntry('PM Setup', 'delete', 'PMTask', id, `Deleted PM task: ${task?.taskName || id}`);
    addToast('success', 'PM Task Removed');
  };

  const togglePMTaskLog = (taskId: string, equipmentId: string, date: string, periodKey: string, status: 'done' | 'not_done' | 'na', notes?: string) => {
    const existingIndex = pmTaskLogs.findIndex(l => l.taskId === taskId && l.periodKey === periodKey);
    let newLogs = [...pmTaskLogs];
    let logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    let performedBy = currentUser?.username || 'user';

    if (existingIndex >= 0) {
      logId = newLogs[existingIndex].id;
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        status,
        performedBy,
        notes: notes !== undefined ? notes : newLogs[existingIndex].notes
      };
    } else {
      newLogs.push({
        id: logId,
        taskId,
        equipmentId,
        date,
        periodKey,
        status,
        performedBy,
        notes
      });
    }
    setPmTaskLogs(newLogs);

    syncSql(
      `INSERT INTO pm_task_logs (id, taskId, equipmentId, date, periodKey, status, performedBy, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status=excluded.status, performedBy=excluded.performedBy, notes=excluded.notes`,
      [logId, taskId, equipmentId, date, periodKey, status, performedBy, notes || '']
    );

    addAuditEntry('PM Checklist', 'update', 'PMTaskLog', taskId, `Updated PM checklist status to ${status.toUpperCase()} for period ${periodKey}`);
  };

  // Chemicals
  const addChemical = (chem: Omit<ChemicalInventory, 'id'>) => {
    const newChem: ChemicalInventory = { ...chem, id: `CHEM-${chem.name.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}` };
    setChemicals(prev => [...prev, newChem]);
    syncSql(
      `INSERT INTO chemicals (id, name, casNumber, supplier, batchNumber, unit, initialStock, minimumStock, expiryDate, locationId, storageConditions, hazardClass, coaFileName, msdsFileName, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newChem.id, newChem.name, newChem.casNumber || '', newChem.supplier || '', newChem.batchNumber || '', newChem.unit,
        newChem.initialStock, newChem.minimumStock, newChem.expiryDate || '', newChem.locationId, newChem.storageConditions || '',
        newChem.hazardClass || '', newChem.coaFileName || '', newChem.msdsFileName || '', newChem.notes || ''
      ]
    );
    addAuditEntry('Chemical Inventory', 'create', 'ChemicalInventory', newChem.id, `Registered chemical standard: ${newChem.name} (CAS ${newChem.casNumber})`);
    addToast('success', 'Chemical Registered', newChem.name);
  };

  const updateChemical = (chem: ChemicalInventory) => {
    setChemicals(prev => prev.map(c => c.id === chem.id ? chem : c));
    syncSql(
      `UPDATE chemicals SET name=?, casNumber=?, supplier=?, batchNumber=?, unit=?, initialStock=?, minimumStock=?, expiryDate=?, locationId=?, storageConditions=?, hazardClass=?, coaFileName=?, msdsFileName=?, notes=? WHERE id=?`,
      [
        chem.name, chem.casNumber || '', chem.supplier || '', chem.batchNumber || '', chem.unit,
        chem.initialStock, chem.minimumStock, chem.expiryDate || '', chem.locationId, chem.storageConditions || '',
        chem.hazardClass || '', chem.coaFileName || '', chem.msdsFileName || '', chem.notes || '', chem.id
      ]
    );
    addAuditEntry('Chemical Inventory', 'update', 'ChemicalInventory', chem.id, `Updated details for chemical: ${chem.name}`);
    addToast('success', 'Chemical Saved', chem.name);
  };

  const deleteChemical = (id: string) => {
    const chem = chemicals.find(c => c.id === id);
    setChemicals(prev => prev.filter(c => c.id !== id));
    syncSql(`DELETE FROM chemicals WHERE id=?`, [id]);
    addAuditEntry('Chemical Inventory', 'delete', 'ChemicalInventory', id, `Removed chemical entry: ${chem?.name || id}`);
    addToast('success', 'Chemical Removed');
  };

  const addChemicalTransaction = (tx: Omit<ChemicalTransaction, 'id'>) => {
    const newTx: ChemicalTransaction = { ...tx, id: `TX-CHEM-${Date.now()}` };
    setChemicalTransactions(prev => [newTx, ...prev]);
    syncSql(
      `INSERT INTO chemical_transactions (id, chemicalId, type, quantity, date, performedBy, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTx.id, newTx.chemicalId, newTx.type, newTx.quantity, newTx.date, newTx.performedBy || '', newTx.reason || '', newTx.notes || '']
    );
    const chem = chemicals.find(c => c.id === tx.chemicalId);
    addAuditEntry('Chemical Transactions', 'create', 'ChemicalTransaction', newTx.id, `Logged ${tx.type.toUpperCase()} of ${tx.quantity} ${chem?.unit || ''} for ${chem?.name || tx.chemicalId}`);
    addToast('success', 'Transaction Recorded', `${tx.type.replace('_', ' ').toUpperCase()}: ${tx.quantity} ${chem?.unit || ''}`);
  };

  // Spare Parts
  const addSparePart = (sp: Omit<SparePartInventory, 'id'>) => {
    const newSp: SparePartInventory = { ...sp, id: `SP-${sp.partNumber.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}` };
    setSpareParts(prev => [...prev, newSp]);
    syncSql(
      `INSERT INTO spare_parts (id, partNumber, name, supplier, category, unit, initialStock, minimumStock, maximumStock, locationId, unitCost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newSp.id, newSp.partNumber || '', newSp.name, newSp.supplier || '', newSp.category || '', newSp.unit,
        newSp.initialStock, newSp.minimumStock, newSp.maximumStock, newSp.locationId, newSp.unitCost || 0, newSp.notes || ''
      ]
    );
    addAuditEntry('Spare Parts Inventory', 'create', 'SparePartInventory', newSp.id, `Added spare part: ${newSp.name} (P/N ${newSp.partNumber})`);
    addToast('success', 'Spare Part Registered', newSp.name);
  };

  const updateSparePart = (sp: SparePartInventory) => {
    setSpareParts(prev => prev.map(s => s.id === sp.id ? sp : s));
    syncSql(
      `UPDATE spare_parts SET partNumber=?, name=?, supplier=?, category=?, unit=?, initialStock=?, minimumStock=?, maximumStock=?, locationId=?, unitCost=?, notes=? WHERE id=?`,
      [
        sp.partNumber || '', sp.name, sp.supplier || '', sp.category || '', sp.unit,
        sp.initialStock, sp.minimumStock, sp.maximumStock, sp.locationId, sp.unitCost || 0, sp.notes || '', sp.id
      ]
    );
    addAuditEntry('Spare Parts Inventory', 'update', 'SparePartInventory', sp.id, `Updated spare part: ${sp.name}`);
    addToast('success', 'Spare Part Saved', sp.name);
  };

  const deleteSparePart = (id: string) => {
    const sp = spareParts.find(s => s.id === id);
    setSpareParts(prev => prev.filter(s => s.id !== id));
    syncSql(`DELETE FROM spare_parts WHERE id=?`, [id]);
    addAuditEntry('Spare Parts Inventory', 'delete', 'SparePartInventory', id, `Deleted spare part: ${sp?.name || id}`);
    addToast('success', 'Spare Part Removed');
  };

  const addSparePartTransaction = (tx: Omit<SparePartTransaction, 'id'>) => {
    const newTx: SparePartTransaction = { ...tx, id: `TX-SP-${Date.now()}` };
    setSparePartTransactions(prev => [newTx, ...prev]);
    syncSql(
      `INSERT INTO spare_part_transactions (id, sparePartId, type, quantity, date, performedBy, linkedEquipmentId, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTx.id, newTx.sparePartId, newTx.type, newTx.quantity, newTx.date, newTx.performedBy || '', newTx.linkedEquipmentId || '', newTx.reason || '', newTx.notes || '']
    );
    const sp = spareParts.find(s => s.id === tx.sparePartId);
    addAuditEntry('Spare Parts Transactions', 'create', 'SparePartTransaction', newTx.id, `Logged ${tx.type.toUpperCase()} of ${tx.quantity} units for ${sp?.name || tx.sparePartId}`);
    addToast('success', 'Transaction Recorded', `${tx.type.replace('_', ' ').toUpperCase()}: ${tx.quantity} ${sp?.unit || ''}`);
  };

  // Reset Factory Data in SQLite
  const resetToInitialData = () => {
    fetch('/api/reset-db', { method: 'POST' })
      .then(res => res.json())
      .then(resData => {
        if (resData?.data) {
          const d = resData.data;
          setUsers(d.users);
          setCompanyProfile(d.companyProfile);
          setSystemSettings(d.systemSettings);
          setCategories(d.categories);
          setManufacturers(d.manufacturers);
          setLocations(d.locations);
          setEquipment(d.equipment);
          setCalibrationRecords(d.calibrationRecords);
          setPmTasks(d.pmTasks);
          setPmTaskLogs(d.pmTaskLogs);
          setChemicals(d.chemicals);
          setChemicalTransactions(d.chemicalTransactions);
          setSpareParts(d.spareParts);
          setSparePartTransactions(d.sparePartTransactions);
          setAuditLogs(d.auditLogs);
        }
        localStorage.clear();
        addToast('info', 'SQLite Database Reset', 'SQLite database re-seeded and reset to clean factory state.');
      })
      .catch(err => {
        console.error('Reset error:', err);
        addToast('error', 'Reset Failed', 'Could not reset SQLite database.');
      });
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
