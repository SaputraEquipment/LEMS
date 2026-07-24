import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
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
} from '../src/data/initialData.ts';

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
let db: Database;

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_FILE)) {
    console.log('[SQLite] Loading existing database from disk:', DB_FILE);
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    console.log('[SQLite] Creating new SQLite database file:', DB_FILE);
    db = new SQL.Database();
  }

  // Create tables if they do not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS company_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      companyName TEXT NOT NULL,
      labName TEXT NOT NULL,
      labCode TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      isoStandard TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS manufacturers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contactPerson TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      website TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      building TEXT,
      room TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      sapCode TEXT,
      name TEXT NOT NULL,
      categoryId TEXT,
      manufacturerId TEXT,
      model TEXT,
      serialNumber TEXT,
      tagNumber TEXT,
      locationId TEXT,
      department TEXT,
      status TEXT,
      purchaseDate TEXT,
      commissionDate TEXT,
      calibrationFrequencyDays INTEGER,
      pmFrequencyDays INTEGER,
      measurementSpecs TEXT,
      notes TEXT,
      photoUrl TEXT,
      lastCalibrationDate TEXT,
      nextCalibrationDate TEXT,
      lastPmDate TEXT,
      nextPmDate TEXT
    );

    CREATE TABLE IF NOT EXISTS calibration_records (
      id TEXT PRIMARY KEY,
      equipmentId TEXT NOT NULL,
      calibrationType TEXT,
      vendorName TEXT,
      technician TEXT,
      calibrationDate TEXT,
      nextDueDate TEXT,
      certificateNumber TEXT,
      result TEXT,
      certificateFileName TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS pm_tasks (
      id TEXT PRIMARY KEY,
      equipmentId TEXT NOT NULL,
      taskName TEXT NOT NULL,
      frequency TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pm_task_logs (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      equipmentId TEXT NOT NULL,
      date TEXT NOT NULL,
      periodKey TEXT NOT NULL,
      status TEXT NOT NULL,
      performedBy TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS chemicals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      casNumber TEXT,
      supplier TEXT,
      batchNumber TEXT,
      unit TEXT,
      initialStock REAL,
      minimumStock REAL,
      expiryDate TEXT,
      locationId TEXT,
      storageConditions TEXT,
      hazardClass TEXT,
      coaFileName TEXT,
      msdsFileName TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS chemical_transactions (
      id TEXT PRIMARY KEY,
      chemicalId TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      performedBy TEXT,
      reason TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS spare_parts (
      id TEXT PRIMARY KEY,
      partNumber TEXT,
      name TEXT NOT NULL,
      supplier TEXT,
      category TEXT,
      unit TEXT,
      initialStock REAL,
      minimumStock REAL,
      maximumStock REAL,
      locationId TEXT,
      unitCost REAL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS spare_part_transactions (
      id TEXT PRIMARY KEY,
      sparePartId TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      performedBy TEXT,
      linkedEquipmentId TEXT,
      reason TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      userRole TEXT,
      module TEXT,
      action TEXT,
      entityType TEXT,
      entityId TEXT,
      details TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT,
      description TEXT
    );
  `);

  // Check if users table is empty to determine if initial seed is needed
  const userCheck = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = userCheck[0]?.values[0]?.[0] || 0;

  if (userCount === 0) {
    console.log('[SQLite] Seeding initial data into SQLite database...');
    
    // Seed Users
    for (const u of initialUsers) {
      db.run(
        `INSERT INTO users (id, username, password, fullName, email, role, department, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.username, u.password, u.fullName, u.email, u.role, u.department, u.active ? 1 : 0]
      );
    }

    // Seed Company Profile
    const p = initialCompanyProfile;
    db.run(
      `INSERT INTO company_profile (id, companyName, labName, labCode, address, phone, email, isoStandard) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [p.companyName, p.labName, p.labCode, p.address, p.phone, p.email, p.isoStandard]
    );

    // Seed Categories
    for (const c of initialCategories) {
      db.run(`INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`, [c.id, c.name, c.description || '']);
    }

    // Seed Manufacturers
    for (const m of initialManufacturers) {
      db.run(
        `INSERT INTO manufacturers (id, name, contactPerson, email, phone, address, website) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.name, m.contactPerson || '', m.email || '', m.phone || '', m.address || '', m.website || '']
      );
    }

    // Seed Locations
    for (const l of initialLocations) {
      db.run(
        `INSERT INTO locations (id, name, building, room, description) VALUES (?, ?, ?, ?, ?)`,
        [l.id, l.name, l.building || '', l.room || '', l.description || '']
      );
    }

    // Seed Equipment
    for (const eq of initialEquipment) {
      db.run(
        `INSERT INTO equipment (id, sapCode, name, categoryId, manufacturerId, model, serialNumber, tagNumber, locationId, department, status, purchaseDate, commissionDate, calibrationFrequencyDays, pmFrequencyDays, measurementSpecs, notes, photoUrl, lastCalibrationDate, nextCalibrationDate, lastPmDate, nextPmDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eq.id, eq.sapCode || '', eq.name, eq.categoryId, eq.manufacturerId, eq.model || '',
          eq.serialNumber || '', eq.tagNumber || '', eq.locationId, eq.department || '', eq.status,
          eq.purchaseDate || '', eq.commissionDate || '', eq.calibrationFrequencyDays || 0, eq.pmFrequencyDays || 0,
          eq.measurementSpecs || '', eq.notes || '', eq.photoUrl || '', eq.lastCalibrationDate || '',
          eq.nextCalibrationDate || '', eq.lastPmDate || '', eq.nextPmDate || ''
        ]
      );
    }

    // Seed Calibration Records
    for (const cal of initialCalibrationRecords) {
      db.run(
        `INSERT INTO calibration_records (id, equipmentId, calibrationType, vendorName, technician, calibrationDate, nextDueDate, certificateNumber, result, certificateFileName, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cal.id, cal.equipmentId, cal.calibrationType, cal.vendorName || '', cal.technician || '',
          cal.calibrationDate, cal.nextDueDate, cal.certificateNumber || '', cal.result,
          cal.certificateFileName || '', cal.notes || ''
        ]
      );
    }

    // Seed PM Tasks
    for (const task of initialPMTasks) {
      db.run(
        `INSERT INTO pm_tasks (id, equipmentId, taskName, frequency, active) VALUES (?, ?, ?, ?, ?)`,
        [task.id, task.equipmentId, task.taskName, task.frequency, task.active ? 1 : 0]
      );
    }

    // Seed PM Task Logs
    for (const log of initialPMTaskLogs) {
      db.run(
        `INSERT INTO pm_task_logs (id, taskId, equipmentId, date, periodKey, status, performedBy, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [log.id, log.taskId, log.equipmentId, log.date, log.periodKey, log.status, log.performedBy || '', log.notes || '']
      );
    }

    // Seed Chemicals
    for (const chem of initialChemicals) {
      db.run(
        `INSERT INTO chemicals (id, name, casNumber, supplier, batchNumber, unit, initialStock, minimumStock, expiryDate, locationId, storageConditions, hazardClass, coaFileName, msdsFileName, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chem.id, chem.name, chem.casNumber || '', chem.supplier || '', chem.batchNumber || '', chem.unit,
          chem.initialStock, chem.minimumStock, chem.expiryDate || '', chem.locationId, chem.storageConditions || '',
          chem.hazardClass || '', chem.coaFileName || '', chem.msdsFileName || '', chem.notes || ''
        ]
      );
    }

    // Seed Chemical Transactions
    for (const ctx of initialChemicalTransactions) {
      db.run(
        `INSERT INTO chemical_transactions (id, chemicalId, type, quantity, date, performedBy, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ctx.id, ctx.chemicalId, ctx.type, ctx.quantity, ctx.date, ctx.performedBy || '', ctx.reason || '', ctx.notes || '']
      );
    }

    // Seed Spare Parts
    for (const sp of initialSpareParts) {
      db.run(
        `INSERT INTO spare_parts (id, partNumber, name, supplier, category, unit, initialStock, minimumStock, maximumStock, locationId, unitCost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sp.id, sp.partNumber || '', sp.name, sp.supplier || '', sp.category || '', sp.unit,
          sp.initialStock, sp.minimumStock, sp.maximumStock, sp.locationId, sp.unitCost || 0, sp.notes || ''
        ]
      );
    }

    // Seed Spare Part Transactions
    for (const stx of initialSparePartTransactions) {
      db.run(
        `INSERT INTO spare_part_transactions (id, sparePartId, type, quantity, date, performedBy, linkedEquipmentId, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [stx.id, stx.sparePartId, stx.type, stx.quantity, stx.date, stx.performedBy || '', stx.linkedEquipmentId || '', stx.reason || '', stx.notes || '']
      );
    }

    // Seed Audit Logs
    for (const audit of initialAuditLogs) {
      db.run(
        `INSERT INTO audit_logs (id, userId, username, userRole, module, action, entityType, entityId, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [audit.id, audit.userId || '', audit.username, audit.userRole, audit.module, audit.action, audit.entityType, audit.entityId || '', audit.details, audit.timestamp]
      );
    }

    // Seed System Settings
    for (const sys of initialSystemSettings) {
      db.run(
        `INSERT INTO system_settings (id, key, value, category, description) VALUES (?, ?, ?, ?, ?)`,
        [sys.id, sys.key, sys.value, sys.category || '', sys.description || '']
      );
    }

    saveDatabase();
  }
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
    console.log('[SQLite] Database changes persisted to', DB_FILE);
  }
}

// Helper to convert SQL result rows to JS objects
function rowsToObjects<T = any>(result: any[]): T[] {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}

// Query all collections from SQLite
export function getAllData() {
  const users = rowsToObjects(db.exec('SELECT * FROM users')).map((u: any) => ({
    ...u,
    active: Boolean(u.active)
  }));

  const companyProfileRows = rowsToObjects(db.exec('SELECT * FROM company_profile LIMIT 1'));
  const companyProfile = companyProfileRows[0] || initialCompanyProfile;

  const categories = rowsToObjects(db.exec('SELECT * FROM categories'));
  const manufacturers = rowsToObjects(db.exec('SELECT * FROM manufacturers'));
  const locations = rowsToObjects(db.exec('SELECT * FROM locations'));
  
  const equipment = rowsToObjects(db.exec('SELECT * FROM equipment'));
  const calibrationRecords = rowsToObjects(db.exec('SELECT * FROM calibration_records'));
  
  const pmTasks = rowsToObjects(db.exec('SELECT * FROM pm_tasks')).map((t: any) => ({
    ...t,
    active: Boolean(t.active)
  }));
  const pmTaskLogs = rowsToObjects(db.exec('SELECT * FROM pm_task_logs'));

  const chemicals = rowsToObjects(db.exec('SELECT * FROM chemicals'));
  const chemicalTransactions = rowsToObjects(db.exec('SELECT * FROM chemical_transactions'));

  const spareParts = rowsToObjects(db.exec('SELECT * FROM spare_parts'));
  const sparePartTransactions = rowsToObjects(db.exec('SELECT * FROM spare_part_transactions'));

  const auditLogs = rowsToObjects(db.exec('SELECT * FROM audit_logs ORDER BY timestamp DESC'));
  const systemSettings = rowsToObjects(db.exec('SELECT * FROM system_settings'));

  return {
    users,
    companyProfile,
    categories,
    manufacturers,
    locations,
    equipment,
    calibrationRecords,
    pmTasks,
    pmTaskLogs,
    chemicals,
    chemicalTransactions,
    spareParts,
    sparePartTransactions,
    auditLogs,
    systemSettings
  };
}

// CRUD execution functions with disk persistence
export function executeRun(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDatabase();
}

export function resetToSeedData() {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  return initDatabase();
}
