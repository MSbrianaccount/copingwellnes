// Authentication Manager
// Handles user login, session management, and role-based access

class AuthManager {
  static DEMO_USERS = {
    admin: {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator',
      email: 'admin@rehab.local'
    },
    doctor1: {
      username: 'doctor1',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@rehab.local'
    },
    doctor2: {
      username: 'doctor2',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Michael Smith',
      email: 'michael@rehab.local'
    },
    finance1: {
      username: 'finance1',
      password: 'finance123',
      role: 'finance',
      name: 'John Finance',
      email: 'finance@rehab.local'
    },
    reception1: {
      username: 'reception1',
      password: 'reception123',
      role: 'reception',
      name: 'Emma Reception',
      email: 'reception@rehab.local'
    },
    therapist1: {
      username: 'therapist1',
      password: 'therapist123',
      role: 'therapist',
      name: 'James Therapist',
      email: 'therapist@rehab.local'
    }
  };

  static SESSION_KEY = 'rehabapp_session';

  static login(role, username, password) {
    console.log('Attempting login:', { role, username });

    // Find user matching the credentials
    for (let key in this.DEMO_USERS) {
      const user = this.DEMO_USERS[key];
      if (user.role === role && user.username === username && user.password === password) {
        // Create session
        const session = {
          userId: key,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          loginTime: new Date().toISOString(),
          permissions: this.getPermissionsForRole(user.role)
        };

        // Store session
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log('Login successful:', session);
        return { success: true, user: session };
      }
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Please check your role, username, and password.' 
    };
  }

  static logout() {
    console.log('Logging out...');
    localStorage.removeItem(this.SESSION_KEY);
    // Don't redirect - let PasswordAuth handle it
  }

  static isLoggedIn() {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session !== null;
  }

  static getCurrentUser() {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      console.error('Error parsing session:', e);
      return null;
    }
  }

  static getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  static hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  static getPermissionsForRole(role) {
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_users',
        'manage_patients',
        'manage_staff',
        'view_finance',
        'manage_finance',
        'view_reports',
        'manage_appointments',
        'view_settings',
        'manage_settings'
      ],
      doctor: [
        'view_dashboard',
        'manage_own_patients',
        'view_appointments',
        'manage_own_appointments',
        'view_own_finance'
      ],
      finance: [
        'view_dashboard',
        'view_finance',
        'manage_finance',
        'view_invoices',
        'manage_invoices'
      ],
      reception: [
        'view_dashboard',
        'view_appointments',
        'manage_appointments',
        'view_patients',
        'check_in_patients'
      ],
      therapist: [
        'view_dashboard',
        'view_assigned_patients',
        'update_patient_progress'
      ]
    };

    return permissions[role] || [];
  }

  static requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'assets/login.html';
      return false;
    }
    return true;
  }

  static requireRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user || user.role !== requiredRole) {
      alert('Access denied. Required role: ' + requiredRole);
      return false;
    }
    return true;
  }

  static requirePermission(permission) {
    if (!this.hasPermission(permission)) {
      alert('Access denied. Required permission: ' + permission);
      return false;
    }
    return true;
  }

  static getAccessiblePages() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const pages = {
      admin: ['dashboard', 'patients', 'staff', 'finance', 'reports', 'settings', 'users', 'appointments'],
      doctor: ['dashboard', 'patients', 'appointments'],
      finance: ['dashboard', 'finance', 'reports'],
      reception: ['dashboard', 'patients', 'appointments'],
      therapist: ['dashboard', 'patients']
    };

    return pages[user.role] || [];
  }
}

// PasswordAuth is now used instead - no automatic redirects

