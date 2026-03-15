// Application Initialization and Main Logic
// Initializes all controllers and sets up event listeners

class RehabApp {
  constructor() {
    this.authController = new AuthController();
    this.patientController = new PatientController();
    this.staffController = new StaffController();
    this.financeController = new FinanceController();
    this.reportController = new ReportController();
    this.themeLoader = new ThemeLoader('./config/theme.json');
    this.billingService = new BillingService();
    this.reportService = new ReportService();
    this.navbar = new Navbar();
    this.sidebar = new Sidebar();
    this.dashboard = new Dashboard();
  }

  init() {
    console.log('RehabApp initializing...');
    // Show splash screen briefly, then initialize UI and auth
    const splashScreen = document.getElementById('splash-screen');
    const mainApp = document.getElementById('main-app');
    if (splashScreen) {
      splashScreen.classList.remove('hidden');
      splashScreen.style.display = 'flex';
    }
    if (mainApp) {
      mainApp.style.display = 'none';
    }

    // Initialize password-based authentication system and listeners early
    this.initPasswordAuth();
    this.setupEventListeners();

    // Wait a short moment to show splash then continue initialization
    setTimeout(() => {
      try {
        const currentUser = PasswordAuth.getCurrentUser();
        if (!currentUser) {
          // Hide main app, show password prompt after splash
          if (splashScreen) {
            splashScreen.classList.add('hidden');
            splashScreen.style.display = 'none';
          }
          console.log('No user authenticated, showing password prompt');
          this.showPasswordPrompt();
          return;
        }

        // Display current user info
        this.displayUserInfo();

        // Hide splash and show main app
        if (splashScreen) {
          splashScreen.classList.add('hidden');
          splashScreen.style.display = 'none';
        }
        if (mainApp) {
          mainApp.style.display = 'flex';
        }

        // Load theme and components
        this.themeLoader.loadTheme();
        this.themeLoader.applyTheme();

        this.navbar.init();
        this.sidebar.init();

        // Load initial dashboard
        this.loadDashboard();

        console.log('RehabApp initialized successfully');
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }, 800);

    // Load theme
    this.themeLoader.loadTheme();
    this.themeLoader.applyTheme();

    // Initialize components
    this.navbar.init();
    this.sidebar.init();

    // Load initial dashboard
    this.loadDashboard();

    console.log('RehabApp initialized successfully');
  }

  displayUserInfo() {
    const user = PasswordAuth.getCurrentUser();
    if (user) {
      const roleDisplay = document.getElementById('user-role-display');
      const nameDisplay = document.getElementById('user-name-display');
      
      if (roleDisplay) {
        roleDisplay.textContent = user.role.toUpperCase();
      }
      if (nameDisplay) {
        nameDisplay.textContent = user.name;
      }
    }

    // Filter menu items based on role
    this.filterMenuByRole();
  }

  filterMenuByRole() {
    const user = PasswordAuth.getCurrentUser();
    if (!user) return;

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      const allowedRoles = item.getAttribute('data-role');
      if (allowedRoles && allowedRoles !== 'all') {
        const roles = allowedRoles.split(',');
        if (roles.includes(user.role)) {
          item.parentElement.style.display = 'block';
        } else {
          item.parentElement.style.display = 'none';
        }
      }
    });
  }

  setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const menuItems = document.querySelectorAll('.menu-item');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    menuItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Coping Wellness Button - Shows password prompt if not logged in, or menu if logged in
    const copingBtn = document.getElementById('coping-wellness-btn');
    if (copingBtn) {
      copingBtn.addEventListener('click', () => {
        const user = PasswordAuth.getCurrentUser();
        if (user) {
          // Already logged in - show menu
          this.openCopingModal();
        } else {
          // Not logged in - ask for password
          this.showPasswordPrompt();
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          PasswordAuth.logout();
          // Clear UI
          const roleDisplay = document.getElementById('user-role-display');
          const nameDisplay = document.getElementById('user-name-display');
          if (roleDisplay) roleDisplay.textContent = '';
          if (nameDisplay) nameDisplay.textContent = '';
          // Close modal
          this.closeCopingModal();
          logoutBtn.style.display = 'none';
        }
      });
    }

    // Modal Close Functionality
    const modal = document.getElementById('coping-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCopingModal());
    }

    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeCopingModal();
        }
      });
    }

    // Option card navigation
    const optionCards = document.querySelectorAll('.option-card');
    console.log('Found option cards:', optionCards.length);
    optionCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        console.log('Option card clicked, target:', target);
        if (target) {
          window.location.hash = '#' + target;
          console.log('Hash set to:', '#' + target);
        }
        // Close modal after a brief delay to allow hash change
        setTimeout(() => {
          this.closeCopingModal();
        }, 50);
      });
    });

    // Global navigate event
    window.addEventListener('navigate', (e) => {
      this.loadContent(e.detail.target);
    });

    // Hash change navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash || '#dashboard';
      console.log('Hash changed to:', hash);
      this.loadContent(hash);
    });
  }

  openCopingModal() {
    const modal = document.getElementById('coping-modal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closeCopingModal() {
    const modal = document.getElementById('coping-modal');
    console.log('closeCopingModal called, modal:', modal);
    if (modal) {
      console.log('Current classes:', modal.className);
      modal.classList.remove('show');
      console.log('New classes:', modal.className);
      document.body.style.overflow = 'auto';
    }
  }

  // ===== PASSWORD AUTHENTICATION METHODS =====

  initPasswordAuth() {
    // Setup password authentication UI
    this.setupPasswordAuthListeners();
  }

  setupPasswordAuthListeners() {
    const passwordSubmit = document.getElementById('password-submit-btn');
    const passwordInput = document.getElementById('password-input');
    const closePasswordModal = document.getElementById('close-password-modal');
    const adminBtn = document.getElementById('password-admin-btn');

    if (passwordSubmit) {
      passwordSubmit.addEventListener('click', () => this.submitPassword());
    }

    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitPassword();
        }
      });
    }

    if (closePasswordModal) {
      closePasswordModal.addEventListener('click', () => this.closePasswordModal());
    }

    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.showAdminStaffModal());
    }

    // Admin Staff Modal Listeners
    const closeAdminModal = document.getElementById('close-admin-modal');
    const staffSubmit = document.getElementById('staff-submit-btn');
    const staffListBtn = document.getElementById('staff-list-btn');

    if (closeAdminModal) {
      closeAdminModal.addEventListener('click', () => this.closeAdminModal());
    }

    if (staffSubmit) {
      staffSubmit.addEventListener('click', () => this.submitAddStaff());
    }

    if (staffListBtn) {
      staffListBtn.addEventListener('click', () => this.displayStaffList());
    }
  }

  showPasswordPrompt() {
    // Clear previous input
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }

    // Hide error message
    const errorMsg = document.getElementById('password-error');
    if (errorMsg) {
      errorMsg.style.display = 'none';
    }

    // Show password modal
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  }

  submitPassword() {
    const passwordInput = document.getElementById('password-input');
    const errorMsg = document.getElementById('password-error');
    
    if (!passwordInput) return;

    const password = passwordInput.value.trim();
    
    if (!password) {
      if (errorMsg) {
        errorMsg.textContent = 'Please enter a password';
        errorMsg.style.display = 'block';
      }
      return;
    }

    // Authenticate with password
    const result = PasswordAuth.authenticate(password);

    if (result.success) {
      // Password correct - show navigation modal
      this.closePasswordModal();
      this.openCopingModal();
      this.updateUIForUser();
    } else {
      // Password incorrect
      if (errorMsg) {
        errorMsg.textContent = result.message;
        errorMsg.style.display = 'block';
      }
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }

  updateUIForUser() {
    const user = PasswordAuth.getCurrentUser();
    if (user) {
      const roleDisplay = document.getElementById('user-role-display');
      const nameDisplay = document.getElementById('user-name-display');

      if (roleDisplay) {
        roleDisplay.textContent = user.role.toUpperCase();
      }
      if (nameDisplay) {
        nameDisplay.textContent = user.name;
      }

      // Update logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
      }
    }
  }

  showAdminStaffModal() {
    const user = PasswordAuth.getCurrentUser();
    if (!user || !user.isAdmin) {
      alert('Only admin can add staff members');
      return;
    }

    this.closePasswordModal();

    // Clear form
    document.getElementById('staff-fullname').value = '';
    document.getElementById('staff-username').value = '';
    document.getElementById('staff-password').value = '';
    document.getElementById('staff-role').value = '';

    // Hide messages
    const errorMsg = document.getElementById('admin-error');
    const successMsg = document.getElementById('admin-success');
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';

    // Show admin modal
    const modal = document.getElementById('admin-staff-modal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closeAdminModal() {
    const modal = document.getElementById('admin-staff-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  }

  submitAddStaff() {
    const fullname = document.getElementById('staff-fullname').value.trim();
    const username = document.getElementById('staff-username').value.trim();
    const password = document.getElementById('staff-password').value.trim();
    const role = document.getElementById('staff-role').value;

    const errorMsg = document.getElementById('admin-error');
    const successMsg = document.getElementById('admin-success');

    // Validation
    if (!fullname || !username || !password || !role) {
      if (errorMsg) {
        errorMsg.textContent = 'All fields are required';
        errorMsg.style.display = 'block';
      }
      if (successMsg) successMsg.style.display = 'none';
      return;
    }

    if (username.length < 3) {
      if (errorMsg) {
        errorMsg.textContent = 'Username must be at least 3 characters';
        errorMsg.style.display = 'block';
      }
      if (successMsg) successMsg.style.display = 'none';
      return;
    }

    if (password.length < 6) {
      if (errorMsg) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        errorMsg.style.display = 'block';
      }
      if (successMsg) successMsg.style.display = 'none';
      return;
    }

    // Add staff member
    const result = PasswordAuth.addStaffMember(username, password, role, fullname);

    if (result.success) {
      if (successMsg) {
        successMsg.textContent = result.message;
        successMsg.style.display = 'block';
      }
      if (errorMsg) errorMsg.style.display = 'none';

      // Clear form
      document.getElementById('staff-fullname').value = '';
      document.getElementById('staff-username').value = '';
      document.getElementById('staff-password').value = '';
      document.getElementById('staff-role').value = '';
    } else {
      if (errorMsg) {
        errorMsg.textContent = result.message;
        errorMsg.style.display = 'block';
      }
      if (successMsg) successMsg.style.display = 'none';
    }
  }

  displayStaffList() {
    const staff = PasswordAuth.getAllStaff();
    const staffList = document.getElementById('staff-list');

    if (!staffList) return;

    if (Object.keys(staff).length === 0) {
      staffList.innerHTML = '<p style="padding: 1rem; text-align: center;">No staff members registered</p>';
      return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background-color: #f0f0f0;">';
    html += '<th style="padding: 0.5rem; border: 1px solid #ddd; text-align: left;">Name</th>';
    html += '<th style="padding: 0.5rem; border: 1px solid #ddd; text-align: left;">Username</th>';
    html += '<th style="padding: 0.5rem; border: 1px solid #ddd; text-align: left;">Role</th>';
    html += '<th style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">Action</th>';
    html += '</tr></thead><tbody>';

    for (const [username, staffData] of Object.entries(staff)) {
      html += '<tr style="border-bottom: 1px solid #ddd;">';
      html += `<td style="padding: 0.5rem; border: 1px solid #ddd;">${staffData.name}</td>`;
      html += `<td style="padding: 0.5rem; border: 1px solid #ddd;">${username}</td>`;
      html += `<td style="padding: 0.5rem; border: 1px solid #ddd;">${staffData.role}</td>`;
      html += `<td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">`;
      html += `<button onclick="app.removeStaffFromList('${username}')" class="delete-btn" style="background-color: #f44336; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 3px; cursor: pointer;">Delete</button>`;
      html += '</td></tr>';
    }

    html += '</tbody></table>';
    staffList.innerHTML = html;
  }

  removeStaffFromList(username) {
    if (confirm(`Remove staff member "${username}"?`)) {
      const result = PasswordAuth.removeStaffMember(username);
      alert(result.message);
      this.displayStaffList();
    }
  }

  handleNavigation(event) {
    event.preventDefault();
    const target = event.target.getAttribute('href');
    console.log('Navigating to:', target);

    // Update active menu items
    const menuItems = document.querySelectorAll('.menu-item, .nav-link');
    menuItems.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');

    // Load content based on target
    this.loadContent(target);
  }

  loadContent(target) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // Check permissions
    if (!this.hasAccessToPage(target)) {
      contentArea.innerHTML = '<div class="section-container"><h2>Access Denied</h2><p>You do not have permission to access this page.</p></div>';
      return;
    }

    switch (target) {
      case '#dashboard':
        this.loadDashboard();
        break;
      case '#patients':
        this.loadPatients();
        break;
      case '#staff':
        this.loadStaff();
        break;
      case '#finance':
        this.loadFinance();
        break;
      case '#reports':
        this.loadReports();
        break;
      case '#appointments':
        this.loadAppointments();
        break;
      case '#settings':
        this.loadSettings();
        break;
      default:
        this.loadDashboard();
    }
  }

  hasAccessToPage(page) {
    const user = PasswordAuth.getCurrentUser();
    
    if (!user) {
      return false;
    }

    // Admin has access to everything
    if (user.isAdmin) {
      return true;
    }

    // Define role-based page access
    const pageAccess = {
      'dashboard': ['admin', 'doctor', 'doctor1', 'doctor2', 'finance', 'finance1', 'reception', 'reception1', 'therapist', 'therapist1'],
      'patients': ['admin', 'doctor', 'doctor1', 'doctor2', 'reception', 'reception1'],
      'staff': ['admin'],
      'finance': ['admin', 'finance', 'finance1'],
      'reports': ['admin', 'finance', 'finance1'],
      'appointments': ['admin', 'doctor', 'doctor1', 'doctor2', 'reception', 'reception1'],
      'settings': ['admin']
    };

    const pageName = page.replace('#', '');
    const allowedRoles = pageAccess[pageName] || [];
    
    return allowedRoles.includes(user.role) || allowedRoles.includes(user.username);
  }

  loadDashboard() {
    console.log('Loading dashboard...');
    const contentArea = document.getElementById('content-area');
    const user = AuthManager.getCurrentUser();
    const stats = DB.getStatistics();

    let html = '<div class="dashboard"><h1>Dashboard</h1><div class="dashboard-grid">';

    // Show role-specific widgets
    if (user.role === 'admin') {
      html += `
        <div class="widget">
          <h3>Total Patients</h3>
          <p class="metric">${stats.totalPatients}</p>
        </div>
        <div class="widget">
          <h3>Active Staff</h3>
          <p class="metric">${stats.activeStaff}</p>
        </div>
        <div class="widget">
          <h3>Total Revenue</h3>
          <p class="metric">$${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div class="widget">
          <h3>Pending Invoices</h3>
          <p class="metric">${stats.pendingInvoices}</p>
        </div>
      `;
    } else if (user.role === 'doctor') {
      const myPatients = DB.getPatients({ doctorId: user.userId });
      const myAppointments = DB.getAppointments({ doctorId: user.userId });
      html += `
        <div class="widget">
          <h3>My Patients</h3>
          <p class="metric">${myPatients.length}</p>
        </div>
        <div class="widget">
          <h3>Appointments Today</h3>
          <p class="metric">${myAppointments.filter(a => a.status === 'scheduled').length}</p>
        </div>
        <div class="widget">
          <h3>Completed Appointments</h3>
          <p class="metric">${myAppointments.filter(a => a.status === 'completed').length}</p>
        </div>
      `;
    } else if (user.role === 'finance') {
      html += `
        <div class="widget">
          <h3>Total Revenue</h3>
          <p class="metric">$${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div class="widget">
          <h3>Paid Invoices</h3>
          <p class="metric">${stats.paidInvoices}</p>
        </div>
        <div class="widget">
          <h3>Pending Invoices</h3>
          <p class="metric">${stats.pendingInvoices}</p>
        </div>
      `;
    } else if (user.role === 'reception') {
      html += `
        <div class="widget">
          <h3>Total Patients</h3>
          <p class="metric">${stats.totalPatients}</p>
        </div>
        <div class="widget">
          <h3>Scheduled Appointments</h3>
          <p class="metric">${stats.scheduledAppointments}</p>
        </div>
        <div class="widget">
          <h3>Total Appointments</h3>
          <p class="metric">${stats.totalAppointments}</p>
        </div>
      `;
    }

    html += '</div></div>';
    contentArea.innerHTML = html;
  }

  loadPatients() {
    console.log('Loading patients...');
    const contentArea = document.getElementById('content-area');
    const user = AuthManager.getCurrentUser();
    
    let patients = [];
    if (user.role === 'doctor') {
      // Doctor sees only their own patients
      patients = DB.getPatients({ doctorId: user.userId });
    } else if (user.role === 'admin' || user.role === 'reception') {
      // Admin and reception see all patients
      patients = DB.getPatients();
    } else {
      patients = DB.getPatients();
    }

    let html = '<div class="section-container"><h2>Patient Management</h2>';
    
    if (user.role === 'doctor' || user.role === 'admin') {
      html += '<button onclick="app.showAddPatientForm()" class="add-btn">+ Add Patient</button>';
    }

    if (patients.length === 0) {
      html += '<p style="margin-top: 2rem; color: #999;">No patients found.</p>';
    } else {
      html += '<table><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Doctor</th></tr></thead><tbody>';
      patients.forEach(p => {
        html += `<tr>
          <td>${p.id}</td>
          <td>${p.firstName} ${p.lastName}</td>
          <td>${p.phone}</td>
          <td>${p.email}</td>
          <td><span style="background: ${p.status === 'active' ? '#4caf50' : '#ff9800'}; color: white; padding: 4px 8px; border-radius: 4px;">${p.status}</span></td>
          <td>${p.doctorName || 'Unassigned'}</td>
        </tr>`;
      });
      html += '</tbody></table>';
    }
    
    html += '</div>';
    contentArea.innerHTML = html;
  }

  loadStaff() {
    console.log('Loading staff...');
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.innerHTML = '<div class="section-container"><h2>Staff Management</h2><p>Staff management features available...</p></div>';
    }
  }

  loadFinance() {
    console.log('Loading finance...');
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.innerHTML = '<div class="section-container"><h2>Billing & Finance</h2><p>Finance management features available...</p></div>';
    }
  }

  loadReports() {
    console.log('Loading reports...');
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    try {
      const stats = DB.getStatistics() || {};
      const progress = DB.getAll('progress') || [];
      const invoices = DB.getAll('invoices') || [];

      let html = '<div class="section-container"><h2>Reports & Analytics</h2>';
      html += '<div class="dashboard-grid">';
      html += `<div class="widget"><h3>Total Patients</h3><p class="metric">${stats.totalPatients || 0}</p></div>`;
      html += `<div class="widget"><h3>Active Staff</h3><p class="metric">${stats.activeStaff || 0}</p></div>`;
      html += `<div class="widget"><h3>Total Revenue</h3><p class="metric">$${(stats.totalRevenue || 0).toFixed ? (stats.totalRevenue || 0).toFixed(2) : (stats.totalRevenue || 0)}</p></div>`;
      html += `<div class="widget"><h3>Pending Invoices</h3><p class="metric">${stats.pendingInvoices || 0}</p></div>`;
      html += '</div>';

      // Export buttons
      html += '<div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">';
      html += '<button class="submit-btn" id="export-financial">Export Financial (JSON)</button>';
      html += '<button class="submit-btn" id="export-progress">Export Recent Progress (JSON)</button>';
      html += '</div>';

      // Recent progress list
      html += '<h3 style="margin-top:20px;">Recent Progress Entries</h3>';
      if (progress.length === 0) {
        html += '<p class="empty-state">No progress entries recorded.</p>';
      } else {
        const recent = progress.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,10);
        html += '<table><thead><tr><th>Date</th><th>Patient ID</th><th>Practitioner</th><th>Notes</th></tr></thead><tbody>';
        recent.forEach(r => {
          html += `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${r.patientId}</td><td>${r.practitioner||'-'}</td><td style="white-space:pre-wrap">${(r.notes||'').replace(/</g,'&lt;')}</td></tr>`;
        });
        html += '</tbody></table>';
      }

      html += '</div>';
      contentArea.innerHTML = html;

      // Wire export buttons
      const exportFinancial = document.getElementById('export-financial');
      if (exportFinancial) exportFinancial.addEventListener('click', () => {
        const report = { reportType: 'financial', generatedDate: new Date().toISOString(), data: { invoices, totalRevenue: stats.totalRevenue || 0 } };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `financial-report-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove();
      });

      const exportProgress = document.getElementById('export-progress');
      if (exportProgress) exportProgress.addEventListener('click', () => {
        const report = { reportType: 'progress_recent', generatedDate: new Date().toISOString(), data: { recent: (DB.getAll('progress')||[]).slice(-50) } };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `progress-report-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove();
      });

    } catch (err) {
      console.error('Failed to load reports:', err);
      contentArea.innerHTML = '<div class="section-container"><h2>Reports & Analytics</h2><p class="error-message">Failed to load reports.</p></div>';
    }
  }

  loadSettings() {
    console.log('Loading settings...');
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.innerHTML = '<div class="section-container"><h2>Settings</h2><p>Application settings coming soon...</p></div>';
    }
  }

  loadAppointments() {
    console.log('Loading appointments...');
    const contentArea = document.getElementById('content-area');
    const user = AuthManager.getCurrentUser();
    
    let appointments = [];
    if (user.role === 'doctor') {
      appointments = DB.getAppointments({ doctorId: user.userId });
    } else {
      appointments = DB.getAppointments();
    }

    let html = '<div class="section-container"><h2>Appointment Booking</h2>';
    
    if (user.role === 'doctor' || user.role === 'reception' || user.role === 'admin') {
      html += '<button onclick="app.showBookAppointmentForm()" class="add-btn">+ Book Appointment</button>';
    }

    if (appointments.length === 0) {
      html += '<p style="margin-top: 2rem; color: #999;">No appointments scheduled.</p>';
    } else {
      html += '<table><thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>';
      appointments.forEach(a => {
        html += `<tr>
          <td>${a.id}</td>
          <td>${a.patientName}</td>
          <td>${a.doctorName}</td>
          <td>${a.date}</td>
          <td>${a.time}</td>
          <td><span style="background: ${a.status === 'scheduled' ? '#2196f3' : '#4caf50'}; color: white; padding: 4px 8px; border-radius: 4px;">${a.status}</span></td>
        </tr>`;
      });
      html += '</tbody></table>';
    }
    
    html += '</div>';
    contentArea.innerHTML = html;
  }

  showAddPatientForm() {
    PatientAdmission.showAdmissionForm();
  }

  showBookAppointmentForm() {
    AppointmentBooking.showBookingForm();
  }
}

// Initialize app when DOM is ready
console.log('app.js loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  const app = new RehabApp();
  console.log('RehabApp instance created');
  app.init();
  console.log('RehabApp.init() called');
});
