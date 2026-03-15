// Database Connector Utility
// Handles database operations via mock data (for browser/Electron compatibility)

class DBConnector {
  constructor(dbPath) {
    this.dbPath = dbPath || './database/rehab_data.sqlite';
    this.mockData = {
      patients: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890', status: 'active' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '234-567-8901', status: 'active' }
      ],
      staff: [
        { id: 1, firstName: 'Dr.', lastName: 'Johnson', role: 'Therapist', department: 'Rehabilitation', status: 'active' },
        { id: 2, firstName: 'Sarah', lastName: 'Williams', role: 'Nurse', department: 'Medical', status: 'active' }
      ],
      invoices: [
        { id: 1, invoiceNo: 'INV-001', patientId: 1, amount: 500, status: 'pending' },
        { id: 2, invoiceNo: 'INV-002', patientId: 2, amount: 750, status: 'paid' }
      ],
      payments: []
    };
    this.connect();
  }

  connect() {
    try {
      console.log('Database initialized in mock mode');
      return true;
    } catch (error) {
      console.error('Error connecting to database:', error);
      return false;
    }
  }

  disconnect() {
    console.log('Database connection closed');
  }

  execute(query, params = []) {
    try {
      console.log('Executing query:', query);
      if (query.toLowerCase().includes('select')) {
        return this.mockData.patients || [];
      }
      return [];
    } catch (error) {
      console.error('Error executing query:', error);
      return [];
    }
  }

  run(query, params = []) {
    try {
      console.log('Running query:', query);
      return { success: true };
    } catch (error) {
      console.error('Error running query:', error);
      return { success: false, error };
    }
  }

  prepare(query) {
    try {
      return {
        run: (params, callback) => {
          if (callback) callback(null);
        },
        all: (params, callback) => {
          if (callback) callback(null, this.mockData.patients || []);
        }
      };
    } catch (error) {
      console.error('Error preparing statement:', error);
      return null;
    }
  }

  getPatients() {
    return this.mockData.patients;
  }

  getStaff() {
    return this.mockData.staff;
  }

  getInvoices() {
    return this.mockData.invoices;
  }

  addPatient(data) {
    const patient = { id: this.mockData.patients.length + 1, ...data };
    this.mockData.patients.push(patient);
    return patient;
  }

  addStaff(data) {
    const staff = { id: this.mockData.staff.length + 1, ...data };
    this.mockData.staff.push(staff);
    return staff;
  }

  addInvoice(data) {
    const invoice = { id: this.mockData.invoices.length + 1, ...data };
    this.mockData.invoices.push(invoice);
    return invoice;
  }
}
