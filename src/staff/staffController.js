// Staff Controller
// Manages staff members, roles, schedules, and assignments

class StaffController {
  constructor() {
    this.staffModel = new StaffModel();
  }

  getAllStaff() {
    try {
      const staff = this.staffModel.getAll();
      console.log('Retrieved all staff:', staff.length);
      return { success: true, data: staff };
    } catch (error) {
      console.error('Error retrieving staff:', error);
      return { success: false, error: error.message };
    }
  }

  getStaffById(staffId) {
    try {
      const staff = this.staffModel.getById(staffId);
      return { success: true, data: staff };
    } catch (error) {
      console.error('Error retrieving staff:', error);
      return { success: false, error: error.message };
    }
  }

  addStaff(staffData) {
    try {
      const result = this.staffModel.create(staffData);
      console.log('Staff added:', staffData.name);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, error: error.message };
    }
  }

  updateStaff(staffId, updates) {
    try {
      const result = this.staffModel.update(staffId, updates);
      console.log('Staff updated:', staffId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  }

  deleteStaff(staffId) {
    try {
      const result = this.staffModel.delete(staffId);
      console.log('Staff deleted:', staffId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting staff:', error);
      return { success: false, error: error.message };
    }
  }

  getStaff() {
    return this.getAllStaff();
  }

  getStaffByRole(role) {
    try {
      const staff = this.staffModel.getByRole(role);
      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getStaffStats() {
    try {
      const stats = this.staffModel.getStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
