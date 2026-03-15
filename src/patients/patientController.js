// Patient Controller
// Manages patient records, registrations, and medical history

class PatientController {
  constructor() {
    this.patientModel = new PatientModel();
  }

  getAllPatients() {
    try {
      const patients = this.patientModel.getAll();
      console.log('Retrieved all patients:', patients.length);
      return { success: true, data: patients };
    } catch (error) {
      console.error('Error retrieving patients:', error);
      return { success: false, error: error.message };
    }
  }

  getPatientById(patientId) {
    try {
      const patient = this.patientModel.getById(patientId);
      return { success: true, data: patient };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      return { success: false, error: error.message };
    }
  }

  addPatient(patientData) {
    try {
      const result = this.patientModel.create(patientData);
      console.log('Patient added:', patientData.name);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding patient:', error);
      return { success: false, error: error.message };
    }
  }

  updatePatient(patientId, updates) {
    try {
      const result = this.patientModel.update(patientId, updates);
      console.log('Patient updated:', patientId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  }

  deletePatient(patientId) {
    try {
      const result = this.patientModel.delete(patientId);
      console.log('Patient deleted:', patientId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
  }

  getPatients() {
    return this.getAllPatients();
  }

  searchPatients(query) {
    try {
      const results = this.patientModel.search(query);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getPatientStats() {
    try {
      const stats = this.patientModel.getStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
