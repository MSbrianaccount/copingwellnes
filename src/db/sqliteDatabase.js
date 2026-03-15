/**
 * SQLite Database Wrapper for RehabApp
 * Uses better-sqlite3 for embedded, synchronous database operations
 */

let Database;
const path = require('path');
const fs = require('fs');

// Attempt to load native better-sqlite3; export null if unavailable so
// the main process can fall back to JSON/localStorage persistence.
try {
  Database = require('better-sqlite3');
} catch (err) {
  console.warn('[SQLite] Optional dependency better-sqlite3 not found; falling back to JSON persistence');
  // Export null to signal unavailability
  module.exports = null;
  return;
}

class SQLiteDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize database connection and create schema if needed
   */
  init() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Open database (creates if doesn't exist)
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      console.log(`[SQLite] Opened database at ${this.dbPath}`);

      // Create schema if first run
      if (!this.tableExists('patients')) {
        this._createSchema();
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error(`[SQLite] Initialization failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Create database schema
   */
  _createSchema() {
    try {
      const schema = `
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER,
          gender TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          diagnosis TEXT,
          status TEXT DEFAULT 'active',
          doctorId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS progress (
          id TEXT PRIMARY KEY,
          patientId TEXT NOT NULL,
          entryDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          vitals TEXT,
          notes TEXT,
          treatmentDone TEXT,
          practitioner TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          patientId TEXT NOT NULL,
          date DATETIME NOT NULL,
          time TEXT,
          type TEXT,
          status TEXT DEFAULT 'scheduled',
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS staff (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          name TEXT,
          email TEXT,
          phone TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          entity TEXT,
          entityId TEXT,
          userId TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          details TEXT
        );

        CREATE TABLE IF NOT EXISTS finances (
          id TEXT PRIMARY KEY,
          patientId TEXT,
          type TEXT,
          amount REAL,
          description TEXT,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctorId);
        CREATE INDEX IF NOT EXISTS idx_progress_patient ON progress(patientId);
        CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patientId);
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit(timestamp);
        CREATE INDEX IF NOT EXISTS idx_finances_patient ON finances(patientId);
      `;

      const statements = schema.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          this.db.exec(statement);
        }
      }

      console.log('[SQLite] Schema created successfully');
    } catch (error) {
      console.error(`[SQLite] Schema creation failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Check if table exists
   */
  tableExists(tableName) {
    try {
      const result = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(tableName);
      return !!result;
    } catch (error) {
      console.error(`[SQLite] Table existence check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute raw SQL query
   */
  run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error(`[SQLite] Query execution failed: ${error.message}`, { sql, params });
      throw error;
    }
  }

  /**
   * Get single row
   */
  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(...params);
    } catch (error) {
      console.error(`[SQLite] Query execution failed: ${error.message}`, { sql, params });
      throw error;
    }
  }

  /**
   * Get all rows
   */
  all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error(`[SQLite] Query execution failed: ${error.message}`, { sql, params });
      throw error;
    }
  }

  /**
   * Begin transaction
   */
  beginTransaction() {
    try {
      this.db.exec('BEGIN TRANSACTION');
    } catch (error) {
      console.error(`[SQLite] Begin transaction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Commit transaction
   */
  commit() {
    try {
      this.db.exec('COMMIT');
    } catch (error) {
      console.error(`[SQLite] Commit failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rollback transaction
   */
  rollback() {
    try {
      this.db.exec('ROLLBACK');
    } catch (error) {
      console.error(`[SQLite] Rollback failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
        this.initialized = false;
        console.log('[SQLite] Database closed');
      }
    } catch (error) {
      console.error(`[SQLite] Close failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export database to JSON (for backup)
   */
  exportToJSON() {
    try {
      const tables = ['patients', 'progress', 'appointments', 'staff', 'audit', 'finances'];
      const data = {};

      for (const table of tables) {
        try {
          data[table] = this.all(`SELECT * FROM ${table}`);
        } catch (e) {
          console.warn(`[SQLite] Could not export ${table}: ${e.message}`);
          data[table] = [];
        }
      }

      return data;
    } catch (error) {
      console.error(`[SQLite] Export failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Import data from JSON
   */
  importFromJSON(data) {
    try {
      this.beginTransaction();

      for (const table of Object.keys(data)) {
        if (!this.tableExists(table)) continue;

        // Clear existing data
        this.run(`DELETE FROM ${table}`);

        // Insert new data
        const rows = data[table];
        if (rows && rows.length > 0) {
          const cols = Object.keys(rows[0]);
          const placeholders = cols.map(() => '?').join(',');
          const stmt = this.db.prepare(
            `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`
          );

          for (const row of rows) {
            stmt.run(...cols.map(c => row[c]));
          }
        }
      }

      this.commit();
      console.log('[SQLite] Data imported successfully');
    } catch (error) {
      this.rollback();
      console.error(`[SQLite] Import failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    try {
      const stats = {};
      const tables = ['patients', 'progress', 'appointments', 'staff', 'audit', 'finances'];

      for (const table of tables) {
        try {
          const result = this.get(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = result?.count || 0;
        } catch (e) {
          stats[table] = 0;
        }
      }

      return stats;
    } catch (error) {
      console.error(`[SQLite] Stats retrieval failed: ${error.message}`);
      return {};
    }
  }
}

module.exports = SQLiteDatabase;
