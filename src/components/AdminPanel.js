import React, { useState } from 'react';

const AdminPanel = ({ onBack }) => {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [staffList, setStaffList] = useState(null);

  const handleAddStaff = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullname || !username || !password || !role) {
      setError('All fields are required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = PasswordAuth.addStaffMember(username, password, role, fullname);

    if (result.success) {
      setSuccess(result.message);
      setFullname('');
      setUsername('');
      setPassword('');
      setRole('');
    } else {
      setError(result.message);
    }
  };

  const handleViewStaff = () => {
    const staff = PasswordAuth.getAllStaff();
    setStaffList(Object.entries(staff));
  };

  const handleDeleteStaff = (username) => {
    if (window.confirm(`Remove staff member "${username}"?`)) {
      const result = PasswordAuth.removeStaffMember(username);
      alert(result.message);
      handleViewStaff();
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel - Add Staff Member</h2>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="admin-content">
        <form onSubmit={handleAddStaff} className="admin-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="finance">Finance</option>
              <option value="reception">Reception</option>
              <option value="therapist">Therapist</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="submit-btn">Add Staff Member</button>
          <button
            type="button"
            className="submit-btn view-staff-btn"
            onClick={handleViewStaff}
          >
            View All Staff
          </button>
        </form>

        {staffList && (
          <div className="staff-list">
            <h3>Registered Staff</h3>
            {staffList.length === 0 ? (
              <p>No staff members registered</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(([usr, data]) => (
                    <tr key={usr}>
                      <td>{data.name}</td>
                      <td>{usr}</td>
                      <td>{data.role}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteStaff(usr)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
