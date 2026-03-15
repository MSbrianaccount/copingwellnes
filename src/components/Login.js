import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    const result = PasswordAuth.authenticate(password);

    if (result.success) {
      setPassword('');
      onLoginSuccess();
    } else {
      setError(result.message);
      setPassword('');
    }
  };

  const handleAdminClick = () => {
    onLoginSuccess('admin-panel');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>RehabApp</h1>
          <p>Rehabilitation Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Enter Password:</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn login-submit-btn">
            Enter
          </button>

          <button
            type="button"
            className="submit-btn admin-btn"
            onClick={handleAdminClick}
          >
            Admin: Add Staff
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Demo Credentials:</h3>
          <p><strong>Admin:</strong> admin123</p>
          <p><strong>Doctor:</strong> doctor123</p>
          <p><strong>Finance:</strong> finance123</p>
          <p><strong>Reception:</strong> reception123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
