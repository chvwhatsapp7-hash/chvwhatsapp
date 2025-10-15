    import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import Hero from '../components/landing/Hero'; // We'll create this next 

const LandingPage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Basic inline styles
  const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    background: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };
  const navLinkStyle = {
    margin: '0 15px',
    textDecoration: 'none',
    color: '#00c6a7',
    fontWeight: 'bold',
  };
  const buttonStyle = {
    ...navLinkStyle,
    backgroundColor: '#00c6a7',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '5px',
  };

  return (
    <div>
      <nav style={navBarStyle}>
        <Link to="/" style={{ ...navLinkStyle, fontSize: '1.5em' }}>
          WANotifier
        </Link>
        <div>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={navLinkStyle}>Login</Link>
              <Link to="/register" style={buttonStyle}>Sign Up</Link>
            </>
          ) : (
            <>
              <span style={{ marginRight: '15px', color: '#555' }}>
                Hello, {user.name}!
              </span>
              {user.role === 'admin' && <Link to="/admin" style={navLinkStyle}>Admin Panel</Link>}
              {user.role === 'client' && <Link to="/client" style={navLinkStyle}>My Dashboard</Link>}
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', ...navLinkStyle }}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>


      {/* You can add more landing page sections here (Features, Pricing, etc.) */}
      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', borderTop: '1px solid #eee' }}>
        <p>&copy; {new Date().getFullYear()} WANotifier. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;