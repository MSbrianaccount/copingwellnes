/**
 * Database Manager for RehabApp
 * Hybrid: Uses localStorage + file persistence (via Electron IPC)
 * Ready for SQLite migration with better-sqlite3
 */

class DatabaseManager {
  constructor(useSQL = false) {
    this.dbName = 'rehab_app';
    this.useSQL = useSQL; // for future SQLite backend
    this.tables = {
      patients: 'patients',
      staff: 'staff',
      appointments: 'appointments',
      medical_records: 'medical_records',
      invoices: 'invoices',
      payments: 'payments',
      progress: 'progress',
      audits: 'audits',
      departments: 'departments'
    };
    this.init();
  }

  init() {
    console.log('[DatabaseManager] Initializing...');
    
    // Initialize with localStorage first
    if (!this.getDatabase()) {
      this.createDatabase();
    }

    // Load from persistent file (Electron IPC)
    this.loadFromFile();

    // If Electron main-process SQLite is available, probe and perform one-time migration
    try {
      if (window && window.electronAPI && window.electronAPI.queryDatabase) {
        // Probe sqlite availability
        window.electronAPI.queryDatabase("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1").then((probe) => {
          if (probe && probe.success) {
            this.useSQL = true;
            console.log('[DatabaseManager] SQLite available in main process; enabling SQL mode');

            // Check if SQLite has data; if empty and localStorage has data, migrate
            window.electronAPI.queryDatabase('SELECT COUNT(*) as count FROM patients').then((countRes) => {
              try {
                const cnt = countRes && countRes.success && Array.isArray(countRes.rows) && countRes.rows[0] ? (countRes.rows[0].count || 0) : 0;
                const localDb = this.getDatabase();
                if (cnt === 0 && localDb) {
                  // import local JSON data into SQLite (non-blocking)
                  if (window.electronAPI.importDatabaseSQL) {
                    window.electronAPI.importDatabaseSQL(localDb).then((imp) => {
                      if (imp && imp.success) console.log('[DatabaseManager] Migrated local JSON DB into SQLite');
                      else console.warn('[DatabaseManager] SQLite import reported:', imp && imp.error);
                    }).catch(e => console.warn('[DatabaseManager] SQLite import failed:', e));
                  }
                }
              } catch (e) {
                console.warn('[DatabaseManager] Probe count parse error', e);
              }
            }).catch(() => {/* ignore */});
          }
        }).catch(() => {/* not available */});
      }
    } catch (e) {
      // ignore when not in electron
    }
  }

  loadFromFile() {
    try {
      if (window && window.electronAPI && window.electronAPI.loadDatabaseFile) {
        window.electronAPI.loadDatabaseFile().then((res) => {
          if (res && res.success && res.data) {
            try {
              localStorage.setItem(this.dbName, JSON.stringify(res.data));
              console.log('[DatabaseManager] Loaded from file:', res.path || 'persisted database');
            } catch (err) {
              console.error('[DatabaseManager] Failed to sync file to localStorage:', err);
            }
          }
        }).catch(err => console.warn('[DatabaseManager] File load error (non-critical):', err));
      }
    } catch (e) {
      // Not in Electron or preload unavailable
    }
  }

  createDatabase() {
    const db = {
      patients: [],
      staff: [],
      appointments: [],
      medical_records: [],
      invoices: [],
      payments: [],
      progress: [],
      audits: [],
      departments: [
        { id: 1, name: 'Rehabilitation', head: 'Dr. Johnson', active: true },
        { id: 2, name: 'Medical', head: 'Dr. Smith', active: true },
        { id: 3, name: 'Finance', head: 'John Doe', active: true },
        { id: 4, name: 'Reception', head: 'Emma Wilson', active: true }
      ]
    };

    localStorage.setItem(this.dbName, JSON.stringify(db));
    console.log('[DatabaseManager] Database created');
    return db;
  }

  getDatabase() {
    try {
      const db = localStorage.getItem(this.dbName);
      return db ? JSON.parse(db) : null;
    } catch (err) {
      console.error('[DatabaseManager] Failed to retrieve database:', err);
      return null;
    }
  }

  saveDatabase(db) {
    try {
      localStorage.setItem(this.dbName, JSON.stringify(db));
      console.log('[DatabaseManager] Saved to localStorage');
    } catch (err) {
      console.error('[DatabaseManager] localStorage save failed:', err);
      try { alert('Failed to save database to storage: ' + err.message); } catch(e){console.warn('alert blocked', e)}
      return false;
    }

    // Persist to file (async, non-blocking)
    this.persistToFile(db);
    return true;
  }

  persistToFile(db) {
    try {
      if (window && window.electronAPI && window.electronAPI.saveDatabaseFile) {
        window.electronAPI.saveDatabaseFile(db).then((res) => {
          if (res && res.success) {
            console.log('[DatabaseManager] Persisted to file:', res.path);
          } else {
            console.warn('[DatabaseManager] File persist failed:', res && res.error);
          }
        }).catch(err => console.warn('[DatabaseManager] File persist error:', err));
      }
    } catch (e) {
      // Ignore if IPC not available
    }
  }

  /**
   * AUDIT / LOGGING
   */
  addAudit(auditEvent) {
    const db = this.getDatabase();
    if (!db) return null;

    const event = {
      id: 'AUD-' + Date.now(),
      ...auditEvent,
      timestamp: new Date().toISOString()
    };
    
    if (!db.audits) db.audits = [];
    db.audits.push(event);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Audit recorded:', event);
    return event;
  }

  getAuditTrail(filters = {}) {
    const db = this.getDatabase();
    let audits = (db && db.audits) || [];
    
    if (filters.type) audits = audits.filter(a => a.type === filters.type);
    if (filters.userId) audits = audits.filter(a => a.userId === filters.userId);
    if (filters.dateFrom) audits = audits.filter(a => new Date(a.timestamp) >= new Date(filters.dateFrom));
    if (filters.dateTo) audits = audits.filter(a => new Date(a.timestamp) <= new Date(filters.dateTo));
    
    return audits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }


  /**
   * PATIENTS OPERATIONS
   */
  addPatient(patientData) {
    const db = this.getDatabase();
    if (!db) return null;

    // Generate UUID
    let id;
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id = 'PAT-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      }
    } catch (e) {
      id = 'PAT-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
    }

    const patient = Object.assign({}, patientData, {
      id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: patientData.status || 'active'
    });

    if (!db.patients) db.patients = [];
    db.patients.push(patient);
    
    try {
      this.saveDatabase(db);
      console.log('[DatabaseManager] Patient added:', patient.id);
      return patient;
    } catch (err) {
      console.error('[DatabaseManager] Failed to add patient:', err);
      try { alert('Failed to save patient: ' + err.message); } catch(e){console.warn('alert blocked', e)}
      return null;
    }
  }

  getPatients(filters = {}) {
    const db = this.getDatabase();
    let patients = (db && db.patients) || [];

    if (filters.doctorId) {
      patients = patients.filter(p => String(p.doctorId) === String(filters.doctorId));
    }
    if (filters.status) {
      patients = patients.filter(p => p.status === filters.status);
    }

    // By default exclude archived patients unless explicitly requested
    if (!filters.includeArchived) {
      patients = patients.filter(p => p.status !== 'archived');
    }

    return patients;
  }

  // Restore an archived patient back to active (admin action)
  readmitPatient(id) {
    const db = this.getDatabase();
    if (!db || !db.patients) return false;
    const patient = db.patients.find(p => String(p.id) === String(id));
    if (!patient) return false;
    patient.status = 'active';
    delete patient.archivedAt;
    delete patient.archivedReason;
    this.saveDatabase(db);
    console.log('[DatabaseManager] Patient readmitted:', id);
    return true;
  }

  getPatientById(id) {
    const db = this.getDatabase();
    if (!db || !db.patients) return null;
    
    return db.patients.find(p => String(p.id) === String(id)) || null;
  }

  updatePatient(id, updates) {
    const db = this.getDatabase();
    if (!db || !db.patients) return null;

    const patient = db.patients.find(p => String(p.id) === String(id));
    if (patient) {
      Object.assign(patient, updates, { updatedAt: new Date().toISOString() });
      this.saveDatabase(db);
      console.log('[DatabaseManager] Patient updated:', id);
      return patient;
    }
    return null;
  }

  deletePatient(id) {
    const db = this.getDatabase();
    if (!db || !db.patients) return false;

    const index = db.patients.findIndex(p => String(p.id) === String(id));
    if (index > -1) {
      db.patients.splice(index, 1);
      this.saveDatabase(db);
      console.log('[DatabaseManager] Patient deleted:', id);
      return true;
    }
    return false;
  }

  // Mark patient as archived/discharged instead of deleting
  dismissPatient(id, reason = 'discharged') {
    const db = this.getDatabase();
    if (!db || !db.patients) return false;
    const patient = db.patients.find(p => String(p.id) === String(id));
    if (!patient) return false;
    patient.status = 'archived';
    patient.archivedAt = new Date().toISOString();
    patient.archivedReason = reason;
    this.saveDatabase(db);
    console.log('[DatabaseManager] Patient archived:', id);
    return true;
  }

  getArchivedPatients() {
    const db = this.getDatabase();
    return (db && db.patients || []).filter(p => p.status === 'archived');
  }

  /**
   * APPOINTMENTS OPERATIONS
   */
  addAppointment(appointmentData) {
    const db = this.getDatabase();
    if (!db) return null;

    const appointment = {
      id: 'APT-' + Date.now(),
      ...appointmentData,
      status: appointmentData.status || 'scheduled',
      createdAt: new Date().toISOString()
    };

    if (!db.appointments) db.appointments = [];
    db.appointments.push(appointment);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Appointment added:', appointment.id);
    return appointment;
  }

  getAppointments(filters = {}) {
    const db = this.getDatabase();
    let appointments = (db && db.appointments) || [];
    
    if (filters.patientId) {
      appointments = appointments.filter(a => String(a.patientId) === String(filters.patientId));
    }
    if (filters.doctorId) {
      appointments = appointments.filter(a => String(a.doctorId) === String(filters.doctorId));
    }
    if (filters.date) {
      appointments = appointments.filter(a => a.date === filters.date);
    }
    if (filters.status) {
      appointments = appointments.filter(a => a.status === filters.status);
    }
    
    return appointments;
  }

  updateAppointment(id, updates) {
    const db = this.getDatabase();
    if (!db || !db.appointments) return null;

    const appointment = db.appointments.find(a => String(a.id) === String(id));
    if (appointment) {
      Object.assign(appointment, updates);
      this.saveDatabase(db);
      console.log('[DatabaseManager] Appointment updated:', id);
      return appointment;
    }
    return null;
  }

  cancelAppointment(id) {
    return this.updateAppointment(id, { status: 'cancelled' });
  }


/**
   * MEDICAL RECORDS OPERATIONS
   */
  addMedicalRecord(recordData) {
    const db = this.getDatabase();
    if (!db) return null;

    const record = {
      id: 'MED-' + Date.now(),
      ...recordData,
      createdAt: new Date().toISOString()
    };

    if (!db.medical_records) db.medical_records = [];
    db.medical_records.push(record);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Medical record added:', record.id);
    return record;
  }

  getPatientMedicalRecords(patientId) {
    const db = this.getDatabase();
    return (db && db.medical_records || []).filter(r => String(r.patientId) === String(patientId));
  }

  /**
   * PATIENT PROGRESS OPERATIONS
   */
  addProgressEntry(patientId, entry) {
    const db = this.getDatabase();
    if (!db) return null;

    if (!db.progress) db.progress = [];
    
    const record = {
      id: 'PROG-' + Date.now(),
      patientId: String(patientId),
      timestamp: new Date().toISOString(),
      ...entry
    };

    db.progress.push(record);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Progress entry added:', record.id);
    return record;
  }

  getProgressEntries(patientId) {
    const db = this.getDatabase();
    const entries = (db && db.progress || [])
      .filter(p => String(p.patientId) === String(patientId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return entries;
  }

  /**
   * INVOICES AND PAYMENTS OPERATIONS
   */
  addInvoice(invoiceData) {
    const db = this.getDatabase();
    if (!db) return null;

    const invoice = {
      id: 'INV-' + Date.now(),
      ...invoiceData,
      status: invoiceData.status || 'pending',
      createdAt: new Date().toISOString()
    };

    if (!db.invoices) db.invoices = [];
    db.invoices.push(invoice);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Invoice added:', invoice.id);
    return invoice;
  }

  getInvoices(filters = {}) {
    const db = this.getDatabase();
    let invoices = (db && db.invoices) || [];

    if (filters.patientId) {
      invoices = invoices.filter(i => String(i.patientId) === String(filters.patientId));
    }
    if (filters.status) {
      invoices = invoices.filter(i => i.status === filters.status);
    }

    return invoices;
  }

  recordPayment(paymentData) {
    const db = this.getDatabase();
    if (!db) return null;

    const payment = {
      id: 'PAY-' + Date.now(),
      ...paymentData,
      createdAt: new Date().toISOString()
    };

    if (!db.payments) db.payments = [];
    db.payments.push(payment);
    
    // Update invoice status if fully paid
    if (db.invoices) {
      const invoice = db.invoices.find(i => String(i.id) === String(paymentData.invoiceId));
      if (invoice) {
        invoice.paidAmount = (invoice.paidAmount || 0) + paymentData.amount;
        if (invoice.paidAmount >= invoice.totalAmount) {
          invoice.status = 'paid';
        }
      }
    }
    
    this.saveDatabase(db);
    console.log('[DatabaseManager] Payment recorded:', payment.id);
    return payment;
  }

  /**
   * STAFF OPERATIONS
   */
  addStaff(staffData) {
    const db = this.getDatabase();
    if (!db) return null;

    const staff = {
      id: 'STF-' + Date.now(),
      ...staffData,
      createdAt: new Date().toISOString()
    };

    if (!db.staff) db.staff = [];
    db.staff.push(staff);
    this.saveDatabase(db);
    console.log('[DatabaseManager] Staff added:', staff.id);
    return staff;
  }

  getStaff(filters = {}) {
    const db = this.getDatabase();
    let staff = (db && db.staff) || [];
    
    if (filters.role) {
      staff = staff.filter(s => s.role === filters.role);
    }
    if (filters.department) {
      staff = staff.filter(s => s.department === filters.department);
    }
    
    return staff;
  }

  /**
   * STATISTICS
   */
  getStatistics() {
    const db = this.getDatabase();
    if (!db) return {};

    const invoices = db.invoices || [];
    const payments = db.payments || [];
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    
    return {
      totalPatients: (db.patients || []).length,
      activeStaff: (db.staff || []).filter(s => s.active).length,
      totalRevenue: totalRevenue,
      pendingInvoices: pendingInvoices,
      paidInvoices: paidInvoices,
      totalAppointments: (db.appointments || []).length,
      scheduledAppointments: (db.appointments || []).filter(a => a.status === 'scheduled').length
    };
  }

  /**
   * EXPORT / IMPORT BACKUP
   */
  exportDatabase() {
    const db = this.getDatabase();
    if (!db) {
      console.warn('[DatabaseManager] No database to export');
      return null;
    }

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: db
    };

    return backup;
  }

  importDatabase(backup) {
    try {
      if (!backup || !backup.data) {
        throw new Error('Invalid backup format');
      }

      localStorage.setItem(this.dbName, JSON.stringify(backup.data));
      this.persistToFile(backup.data);
      console.log('[DatabaseManager] Database imported successfully');
      return true;
    } catch (err) {
      console.error('[DatabaseManager] Import failed:', err);
      try { alert('Failed to import database: ' + err.message); } catch(e){console.warn('alert blocked', e)}
      return false;
    }
  }

  /**
   * DATABASE STATS
   */
  getDatabaseStats() {
    const db = this.getDatabase();
    if (!db) return {};

    return {
      patients: (db.patients || []).length,
      appointments: (db.appointments || []).length,
      staff: (db.staff || []).length,
      invoices: (db.invoices || []).length,
      payments: (db.payments || []).length,
      progress: (db.progress || []).length,
      audits: (db.audits || []).length,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * GENERIC HELPERS
   */
  save(key, data) {
    const db = this.getDatabase() || this.createDatabase();
    db[key] = data;
    this.saveDatabase(db);
  }

  load(key) {
    const db = this.getDatabase();
    return db ? db[key] : null;
  }

  getAll(key) {
    return this.load(key) || [];
  }

  /**
   * CLEAR DATABASE (for development/testing)
   */
  clearDatabase() {
    if (confirm('Clear all data? This cannot be undone.')) {
      localStorage.removeItem(this.dbName);
      this.createDatabase();
      console.log('[DatabaseManager] Database cleared');
      return true;
    }
    return false;
  }
}

// Global instance
let DB = new DatabaseManager();
