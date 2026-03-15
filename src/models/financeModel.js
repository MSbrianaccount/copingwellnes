// Finance Model
// Defines database operations for invoices and payments

class FinanceModel {
  constructor(database) {
    this.db = database || new DBConnector();
    this.invoiceTable = 'invoices';
    this.paymentTable = 'payments';
    this.initTables();
  }

  initTables() {
    try {
      this.db.execute(this.createInvoiceTableSQL());
      this.db.execute(this.createPaymentTableSQL());
    } catch (error) {
      console.error('Error initializing finance tables:', error);
    }
  }

  createInvoiceTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS ${this.invoiceTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNo TEXT NOT NULL UNIQUE,
        patientId INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        issueDate TEXT,
        dueDate TEXT,
        paymentDate TEXT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  createPaymentTableSQL() {
    return `
      CREATE TABLE IF NOT EXISTS ${this.paymentTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        amount REAL NOT NULL,
        paymentMethod TEXT,
        transactionId TEXT,
        paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `;
  }

  createInvoice(invoiceData) {
    try {
      const sql = `INSERT INTO ${this.invoiceTable} (invoiceNo, patientId, amount, status, issueDate, dueDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      return this.db.execute(sql, [invoiceData.invoiceNo, invoiceData.patientId, invoiceData.amount, invoiceData.status || 'pending', invoiceData.issueDate, invoiceData.dueDate, invoiceData.description]);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  recordPayment(paymentData) {
    try {
      const sql = `INSERT INTO ${this.paymentTable} (invoiceId, amount, paymentMethod, transactionId, notes) VALUES (?, ?, ?, ?, ?)`;
      this.db.execute(sql, [paymentData.invoiceId, paymentData.amount, paymentData.paymentMethod, paymentData.transactionId, paymentData.notes]);
      const updateSql = `UPDATE ${this.invoiceTable} SET status = 'paid', paymentDate = CURRENT_TIMESTAMP WHERE id = ?`;
      this.db.execute(updateSql, [paymentData.invoiceId]);
      return { success: true };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  getAllInvoices() {
    try {
      const sql = `SELECT * FROM ${this.invoiceTable} ORDER BY createdAt DESC`;
      return this.db.execute(sql) || [];
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      throw error;
    }
  }

  getInvoiceById(id) {
    try {
      const sql = `SELECT * FROM ${this.invoiceTable} WHERE id = ?`;
      const results = this.db.execute(sql, [id]);
      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      throw error;
    }
  }

  updateInvoice(id, updates) {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      const sql = `UPDATE ${this.invoiceTable} SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      values.push(id);
      return this.db.execute(sql, values);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  deleteInvoice(id) {
    try {
      const sql = `DELETE FROM ${this.invoiceTable} WHERE id = ?`;
      return this.db.execute(sql, [id]);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  getAllPayments() {
    try {
      const sql = `SELECT * FROM ${this.paymentTable} ORDER BY paymentDate DESC`;
      return this.db.execute(sql) || [];
    } catch (error) {
      console.error('Error retrieving payments:', error);
      throw error;
    }
  }

  getFinancialSummary(startDate, endDate) {
    try {
      const sql = `SELECT SUM(amount) as totalRevenue, COUNT(DISTINCT patientId) as patientCount, COUNT(*) as invoiceCount FROM ${this.invoiceTable} WHERE date(issueDate) BETWEEN ? AND ?`;
      const results = this.db.execute(sql, [startDate, endDate]);
      return results && results.length > 0 ? results[0] : {};
    } catch (error) {
      console.error('Error retrieving financial summary:', error);
      throw error;
    }
  }

  getRevenueStats() {
    try {
      const sql = `SELECT COUNT(*) as totalInvoices, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidInvoices, SUM(amount) as totalAmount FROM ${this.invoiceTable}`;
      const results = this.db.execute(sql);
      return results && results.length > 0 ? results[0] : {};
    } catch (error) {
      console.error('Error retrieving revenue stats:', error);
      throw error;
    }
  }
}
