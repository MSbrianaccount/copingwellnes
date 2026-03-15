import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const statistics = DB.getStatistics();
    setStats(statistics);
  }, []);

  if (!stats) {
    return <div className="page-container"><p>Loading...</p></div>;
  }

  const renderDashboard = () => {
    if (user.isAdmin) {
      return (
        <div className="dashboard-grid">
          <div className="widget">
            <h3>Total Patients</h3>
            <p className="metric">{stats.totalPatients}</p>
          </div>
          <div className="widget">
            <h3>Active Staff</h3>
            <p className="metric">{stats.activeStaff}</p>
          </div>
          <div className="widget">
            <h3>Total Revenue</h3>
            <p className="metric">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="widget">
            <h3>Pending Invoices</h3>
            <p className="metric">{stats.pendingInvoices}</p>
          </div>
        </div>
      );
    }

    if (user.role === 'doctor') {
      const myPatients = DB.getPatients({ doctorId: user.id });
      const myAppointments = DB.getAppointments({ doctorId: user.id });
      return (
        <div className="dashboard-grid">
          <div className="widget">
            <h3>My Patients</h3>
            <p className="metric">{myPatients.length}</p>
          </div>
          <div className="widget">
            <h3>Appointments Today</h3>
            <p className="metric">
              {myAppointments.filter(a => a.status === 'scheduled').length}
            </p>
          </div>
          <div className="widget">
            <h3>Completed Appointments</h3>
            <p className="metric">
              {myAppointments.filter(a => a.status === 'completed').length}
            </p>
          </div>
        </div>
      );
    }

    if (user.role === 'finance') {
      return (
        <div className="dashboard-grid">
          <div className="widget">
            <h3>Total Revenue</h3>
            <p className="metric">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="widget">
            <h3>Paid Invoices</h3>
            <p className="metric">{stats.paidInvoices}</p>
          </div>
          <div className="widget">
            <h3>Pending Invoices</h3>
            <p className="metric">{stats.pendingInvoices}</p>
          </div>
        </div>
      );
    }

    if (user.role === 'reception') {
      return (
        <div className="dashboard-grid">
          <div className="widget">
            <h3>Total Patients</h3>
            <p className="metric">{stats.totalPatients}</p>
          </div>
          <div className="widget">
            <h3>Scheduled Appointments</h3>
            <p className="metric">{stats.scheduledAppointments}</p>
          </div>
          <div className="widget">
            <h3>Total Appointments</h3>
            <p className="metric">{stats.totalAppointments}</p>
          </div>
        </div>
      );
    }

    return <div className="dashboard-grid"><p>Welcome to RehabApp</p></div>;
  };

  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
