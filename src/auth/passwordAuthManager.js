/**
 * Password-Based Authentication Manager
 * Allows menu access via password
 * Admin can authorize new staff members
 */

class PasswordAuthManager {
  constructor() {
    this.ADMIN_PASSWORD_KEY = 'rehab_admin_password';
    this.ADMIN_PASSWORD = localStorage.getItem(this.ADMIN_PASSWORD_KEY) || 'admin123';
    this.STAFF_PASSWORDS_KEY = 'rehab_staff_passwords';
    this.AUTHORIZED_STAFF_KEY = 'rehab_authorized_staff';
    this.CURRENT_USER_KEY = 'rehab_current_user';
    
    // Initialize with default staff passwords
    this.initializeStaffPasswords();
    // Run daily check on staff photo deadlines when auth manager is created
    this.checkPhotoDeadlines();
  }

  /**
   * Initialize default staff passwords
   */
  initializeStaffPasswords() {
    let passwords = this.getStaffPasswords();
    
    if (!passwords || Object.keys(passwords).length === 0) {
      passwords = {
        'doctor1': 'doctor123',
        'nurse1': 'nurse123',
        'finance1': 'finance123',
        'reception1': 'reception123',
        'therapist1': 'therapist123'
      };
      this.saveStaffPasswords(passwords);
    }
  }

  /**
   * Authenticate with password
   * @param {string} password - Password entered
   * @param {string} selectedRole - Selected role (optional, for validation)
   * @returns {object} - {success: bool, role: string, message: string}
   */
  authenticate(password, selectedRole = null) {
    // Check if admin password
    if (password === this.ADMIN_PASSWORD) {
      // Admin can be any selected role, but we treat them as admin
      const user = {
        id: 'admin',
        username: 'admin',
        role: 'admin',
        name: 'Administrator',
        isAdmin: true
      };
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return {
        success: true,
        role: 'admin',
        message: 'Admin access granted'
      };
    }

    // Check if staff password
    const staffPasswords = this.getStaffPasswords();
    const authorizedStaff = this.getAuthorizedStaff();
    
    for (const [username, staffPassword] of Object.entries(staffPasswords)) {
      if (password === staffPassword) {
        // Get role from authorized staff list (more reliable for newly added staff)
        let role = null;
        let displayName = null;
        
        if (authorizedStaff[username]) {
          role = authorizedStaff[username].role;
          displayName = authorizedStaff[username].name;
        } else {
          // Fallback for default staff
          role = username.replace(/\d+$/, '');
          displayName = username.charAt(0).toUpperCase() + username.slice(1);
        }
        
        // If selectedRole is provided, verify it matches the staff member's role
        if (selectedRole && selectedRole !== 'admin' && selectedRole !== role) {
          return {
            success: false,
            role: null,
            message: `Incorrect role selected. This account has role: ${role.toUpperCase()}`
          };
        }
        
        const user = {
          id: username,
          username: username,
          role: role,
          name: displayName,
          isAdmin: false
        };
        // Before finalizing login, ensure staff is not paused (photo requirement)
        const staff = this.getAuthorizedStaff();
        const meta = staff[username] || {};
        if (meta.status === 'paused') {
          return { success: false, role: null, message: 'Account paused: profile photo required' };
        }

        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        // On successful login, run a deadline check/update for this user
        this._updateStatusForUser(username);
        return { success: true, role: username, message: `Welcome ${user.name}` };
      }
    }

    return {
      success: false,
      role: null,
      message: 'Invalid password or user not found'
    };
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Admin: Add new staff member with password
   * @param {string} username - Username for staff
   * @param {string} password - Password for staff
   * @param {string} role - Role (doctor, finance, reception, therapist)
   * @param {string} fullName - Full name of staff
   */
  addStaffMember(username, password, role, fullName) {
    // Check if current user is admin
    const user = this.getCurrentUser();
    if (!user || !user.isAdmin) {
      return {
        success: false,
        message: 'Only admin can add staff members'
      };
    }

    // Check if username already exists
    const passwords = this.getStaffPasswords();
    if (passwords[username]) {
      return {
        success: false,
        message: 'Username already exists'
      };
    }

    // Add new staff member
    passwords[username] = password;
    this.saveStaffPasswords(passwords);

    // Store staff metadata; photo optional
    const staff = this.getAuthorizedStaff();
    staff[username] = {
      username: username,
      role: role,
      name: fullName,
      createdAt: new Date().toISOString(),
      authorizedBy: 'admin',
      photo: null,
      photoUploadedAt: null,
      photoMissingSince: new Date().toISOString(),
      status: 'active'
    };
    this.saveAuthorizedStaff(staff);

    return {
      success: true,
      message: `Staff member "${fullName}" added successfully`
    };
  }

  /**
   * Admin: Remove staff member
   */
  removeStaffMember(username) {
    const user = this.getCurrentUser();
    if (!user || !user.isAdmin) {
      return {
        success: false,
        message: 'Only admin can remove staff members'
      };
    }

    const passwords = this.getStaffPasswords();
    delete passwords[username];
    this.saveStaffPasswords(passwords);

    const staff = this.getAuthorizedStaff();
    delete staff[username];
    this.saveAuthorizedStaff(staff);

    return {
      success: true,
      message: 'Staff member removed'
    };
  }

  /**
   * Update staff metadata (name/role/photo)
   */
  updateStaffMember(username, updates = {}) {
    const user = this.getCurrentUser();
    if (!user || !user.isAdmin) {
      return { success: false, message: 'Only admin can update staff' };
    }
    const staff = this.getAuthorizedStaff();
    if (!staff[username]) return { success: false, message: 'Staff not found' };
    const target = staff[username];
    if (updates.name) target.name = updates.name;
    if (updates.role) target.role = updates.role;
    if (updates.photo) {
      target.photo = updates.photo;
      target.photoUploadedAt = new Date().toISOString();
      target.photoMissingSince = null;
      target.status = 'active';
    }
    this.saveAuthorizedStaff(staff);
    return { success: true, message: 'Staff updated' };
  }

  /**
   * Internal: check and update photo deadlines for all staff
   */
  checkPhotoDeadlines() {
    try {
      const staff = this.getAuthorizedStaff();
      const now = Date.now();
      let modified = false;
      for (const [username, meta] of Object.entries(staff)) {
        if (!meta) continue;
        if (meta.photo) continue; // has photo
        // compute missingSince
        const missingSince = meta.photoMissingSince ? new Date(meta.photoMissingSince).getTime() : (meta.createdAt ? new Date(meta.createdAt).getTime() : now);
        const hours = (now - missingSince) / (1000 * 60 * 60);
        if (hours >= 120 && meta.status !== 'paused') {
          meta.status = 'paused';
          modified = true;
        }
      }
      if (modified) this.saveAuthorizedStaff(staff);
    } catch (e) {
      console.warn('checkPhotoDeadlines error', e);
    }
  }

  /**
   * Internal: update status for a single user when they login or at checks
   */
  _updateStatusForUser(username) {
    try {
      const staff = this.getAuthorizedStaff();
      const meta = staff[username];
      if (!meta) return;
      if (meta.photo) {
        meta.status = 'active';
        meta.photoMissingSince = null;
      } else {
        const now = Date.now();
        const missingSince = meta.photoMissingSince ? new Date(meta.photoMissingSince).getTime() : (meta.createdAt ? new Date(meta.createdAt).getTime() : now);
        const hours = (now - missingSince) / (1000 * 60 * 60);
        if (hours >= 120) meta.status = 'paused';
      }
      this.saveAuthorizedStaff(staff);
    } catch (e) {
      console.warn('_updateStatusForUser error', e);
    }
  }

  /**
   * Admin: Change staff password
   */
  changeStaffPassword(username, newPassword) {
    const user = this.getCurrentUser();
    if (!user || !user.isAdmin) {
      return {
        success: false,
        message: 'Only admin can change passwords'
      };
    }

    const passwords = this.getStaffPasswords();
    if (!passwords[username]) {
      return {
        success: false,
        message: 'Staff member not found'
      };
    }

    passwords[username] = newPassword;
    this.saveStaffPasswords(passwords);

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Get all staff members
   */
  getAllStaff() {
    return this.getAuthorizedStaff();
  }

  /**
   * Get role for username
   */
  getRoleForUsername(username) {
    const staff = this.getAuthorizedStaff();
    if (staff[username]) {
      return staff[username].role;
    }
    // Extract role from username (e.g., 'doctor1' -> 'doctor')
    return username.replace(/\d+$/, '');
  }

  /**
   * Get display name for username
   */
  getDisplayNameForUsername(username) {
    const staff = this.getAuthorizedStaff();
    if (staff[username]) {
      return staff[username].name;
    }
    // Generate from username
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  /**
   * Get staff passwords from storage
   */
  getStaffPasswords() {
    const str = localStorage.getItem(this.STAFF_PASSWORDS_KEY);
    return str ? JSON.parse(str) : {};
  }

  /**
   * Save staff passwords to storage
   */
  saveStaffPasswords(passwords) {
    localStorage.setItem(this.STAFF_PASSWORDS_KEY, JSON.stringify(passwords));
  }

  /**
   * Get authorized staff list
   */
  getAuthorizedStaff() {
    const str = localStorage.getItem(this.AUTHORIZED_STAFF_KEY);
    return str ? JSON.parse(str) : {};
  }

  /**
   * Save authorized staff
   */
  saveAuthorizedStaff(staff) {
    localStorage.setItem(this.AUTHORIZED_STAFF_KEY, JSON.stringify(staff));
  }

  /**
   * Verify admin password without changing session
   * @param {string} password
   */
  verifyAdminPassword(password) {
    return password === this.ADMIN_PASSWORD;
  }

  /**
   * Change the admin password (requires current admin password)
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changeAdminPassword(currentPassword, newPassword) {
    if (!this.verifyAdminPassword(currentPassword)) {
      return { success: false, message: 'Current admin password incorrect' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }
    this.ADMIN_PASSWORD = newPassword;
    try {
      localStorage.setItem(this.ADMIN_PASSWORD_KEY, newPassword);
    } catch (e) {
      console.warn('Failed to persist admin password to localStorage', e);
    }
    return { success: true, message: 'Admin password changed' };
  }
}

// Create global instance
const PasswordAuth = new PasswordAuthManager();
