// Staff Model
// Defines database operations for staff records

class StaffModel {
  constructor(database) {
    this.db = database || new DBConnector();
    this.tableName = 'staff';
    this.initTable();
  }

  initTable() {
    try {
      this.db.execute(this.createTableSQL());
    } catch (error) {
      console.error('Error initializing staff table:', error);
    }
  }

  createTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT NOT NULL,
        department TEXT,
        hireDate TEXT,
        salary REAL,
        status TEXT DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  create(staffData) {
    try {
      const sql = `INSERT INTO ${this.tableName} (firstName, lastName, email, phone, role, department, hireDate, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      return this.db.execute(sql, [staffData.firstName, staffData.lastName, staffData.email, staffData.phone, staffData.role, staffData.department, staffData.hireDate, staffData.salary, staffData.status || 'active']);
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  getAll() {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE status = 'active' ORDER BY createdAt DESC`;
      return this.db.execute(sql) || [];
    } catch (error) {
      console.error('Error retrieving staff:', error);
      throw error;
    }
  }

  getById(id) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const results = this.db.execute(sql, [id]);
      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error retrieving staff:', error);
      throw error;
    }
  }

  getByRole(role) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE role = ? AND status = 'active'`;
      return this.db.execute(sql, [role]) || [];
    } catch (error) {
      console.error('Error retrieving staff by role:', error);
      throw error;
    }
  }

  update(id, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      const sql = `UPDATE ${this.tableName} SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      values.push(id);
      return this.db.execute(sql, values);
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  delete(id) {
    try {
      const sql = `UPDATE ${this.tableName} SET status = 'deleted' WHERE id = ?`;
      return this.db.execute(sql, [id]);
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }

  getStats() {
    try {
      const sql = `SELECT COUNT(*) as totalStaff FROM ${this.tableName} WHERE status = 'active'`;
      const results = this.db.execute(sql);
      return results && results.length > 0 ? results[0] : { totalStaff: 0 };
    } catch (error) {
      console.error('Error retrieving staff stats:', error);
      throw error;
    }
  }
}
