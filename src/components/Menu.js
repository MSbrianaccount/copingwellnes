import React from 'react';

const Menu = ({ onNavigate, onClose }) => {
  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      title: 'Dashboard',
      description: 'View system metrics and overview'
    },
    {
      id: 'patients',
      icon: '👥',
      title: 'Patient Management',
      description: 'Manage patient records'
    },
    {
      id: 'staff',
      icon: '👔',
      title: 'Staff Management',
      description: 'Manage staff information'
    },
    {
      id: 'finance',
      icon: '💰',
      title: 'Billing & Finance',
      description: 'Invoice and payment tracking'
    },
    {
      id: 'reports',
      icon: '📈',
      title: 'Reports & Analytics',
      description: 'Generate reports and insights'
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Settings',
      description: 'Configure application settings'
    }
  ];

  const handleCardClick = (id) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Navigation Menu</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-card"
              onClick={() => handleCardClick(item.id)}
            >
              <div className="menu-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
