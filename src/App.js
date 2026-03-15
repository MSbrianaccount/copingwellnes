import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Menu from './components/Menu';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/pages/Dashboard';
import Patients from './components/pages/Patients';
import Staff from './components/pages/Staff';
import Finance from './components/pages/Finance';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const authenticatedUser = PasswordAuth.getCurrentUser();
    setUser(authenticatedUser);
  }, []);

  const handleLoginSuccess = (panel = null) => {
    if (panel === 'admin-panel') {
      setShowAdminPanel(true);
    } else {
      const authenticatedUser = PasswordAuth.getCurrentUser();
      setUser(authenticatedUser);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      PasswordAuth.logout();
      setUser(null);
      setShowMenu(false);
      setShowAdminPanel(false);
      setCurrentPage('dashboard');
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBackFromAdmin = () => {
    setShowAdminPanel(false);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (showAdminPanel) {
    return <AdminPanel onBack={handleBackFromAdmin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'patients':
        return <Patients user={user} />;
      case 'staff':
        return <Staff user={user} />;
      case 'finance':
        return <Finance user={user} />;
      case 'reports':
        return <Reports user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-name">RehabApp</span>
        </div>
        <div className="navbar-center">
          <span className="user-role">{user.role.toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
        </div>
        <div className="navbar-right">
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰ Menu
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {renderPage()}
      </div>

      {/* Menu Modal */}
      {showMenu && (
        <Menu
          onNavigate={handleNavigate}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default App;
