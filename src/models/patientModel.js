// Patient Model
// Defines database operations for patient records

class PatientModel {
  constructor(database) {
    this.db = database || new DBConnector();
    this.tableName = 'patients';
  }

  create(patientData) {
    try {
      const patient = this.db.addPatient(patientData);
      console.log('Patient created:', patient);
      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  getAll() {
    try {
      return this.db.getPatients();
    } catch (error) {
      console.error('Error retrieving patients:', error);
      throw error;
    }
  }

  getById(id) {
    try {
      const patients = this.db.getPatients();
      return patients.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  update(id, updates) {
    try {
      const patients = this.db.getPatients();
      const index = patients.findIndex(p => p.id === id);
      if (index !== -1) {
        patients[index] = { ...patients[index], ...updates };
        return patients[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  delete(id) {
    try {
      const patients = this.db.getPatients();
      const index = patients.findIndex(p => p.id === id);
      if (index !== -1) {
        patients.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  search(query) {
    try {
      const patients = this.db.getPatients();
      const searchTerm = query.toLowerCase();
      return patients.filter(p => 
        p.firstName.toLowerCase().includes(searchTerm) || 
        p.lastName.toLowerCase().includes(searchTerm) || 
        (p.email && p.email.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  getStats() {
    try {
      const patients = this.db.getPatients();
      return { totalPatients: patients.length };
    } catch (error) {
      console.error('Error retrieving patient stats:', error);
      throw error;
    }
  }
}
