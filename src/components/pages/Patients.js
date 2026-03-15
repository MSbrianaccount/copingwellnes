import React, { useState, useEffect } from 'react';

const Patients = ({ user }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    let patientList = [];
    if (user.role === 'doctor') {
      patientList = DB.getPatients({ doctorId: user.id });
    } else if (user.isAdmin || user.role === 'reception') {
      patientList = DB.getPatients();
    }
    setPatients(patientList);
  }, [user]);

  return (
    <div className="page-container">
      <h1>Patient Management</h1>

      {(user.role === 'doctor' || user.isAdmin) && (
        <button className="add-btn">+ Add Patient</button>
      )}

      {patients.length === 0 ? (
        <p className="empty-state">No patients found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>
                  <span className={`status-badge ${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.doctorName || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Patients;
