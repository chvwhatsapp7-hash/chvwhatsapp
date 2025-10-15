import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- MOCK AUTHENTICATION LOGIC ---
    if (email === 'admin@example.com' && password === 'password') {
      login({ id: 'admin1', name: 'Admin User', email: email }, 'admin');
      navigate('/admin');
    } else if (email === 'client@example.com' && password === 'password') {
      login({ id: 'client1', name: 'Client User', email: email }, 'client');
      navigate('/client');
    } else {
      setError('Invalid credentials. Use admin@example.com or client@example.com with password "password".');
    }
    // --- END MOCK AUTHENTICATION LOGIC ---
  };

  // Styles (same as from the previous step)
  const formContainerStyle = {
    maxWidth: '400px', margin: 'auto', padding: '30px', background: 'white',
    borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center',
  };
  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd',
    borderRadius: '4px', boxSizing: 'border-box', fontSize: '1em',
  };
  const buttonStyle = {
    width: '100%', padding: '12px', backgroundColor: '#00c6a7', color: 'white',
    border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer', fontWeight: 'bold',
  };
  const linkStyle = { color: '#00c6a7', textDecoration: 'none', fontWeight: 'bold' };

  return (
    <div style={formContainerStyle}>
      <h2 style={{ fontSize: '2em', color: '#333', marginBottom: '25px' }}>Login to WANotifier</h2>
      {error && <p style={{ color: 'red', marginBottom: '15px', fontSize: '0.9em' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
        Don't have an account? <Link to="/register" style={linkStyle}>Register here</Link>
      </p>
    </div>
  );
};

export default LoginForm;