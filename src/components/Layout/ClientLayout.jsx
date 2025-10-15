import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Reusing the same style object from AdminLayout for consistency
const layoutStyles = {
  layoutContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  sidebar: {
    width: '250px', backgroundColor: '#075E54', color: 'white',
    padding: '20px 0', boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column',
  },
  logoContainer: {
    padding: '0 20px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '20px', textAlign: 'center',
  },
  logo: { fontSize: '1.8em', fontWeight: 'bold', color: '#25D366' },
  navList: { listStyle: 'none', padding: '0', margin: '0', flexGrow: 1 },
  navItem: { marginBottom: '5px' },
  navLink: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    textDecoration: 'none', color: 'white', fontSize: '1em',
    transition: 'background-color 0.2s ease', borderRadius: '0 20px 20px 0', marginRight: '10px',
  },
  activeNavLink: {
    backgroundColor: '#25D366', color: '#075E54', fontWeight: 'bold',
  },
  mainContent: { flexGrow: 1, padding: '30px', overflowY: 'auto' },
  header: {
    backgroundColor: 'white', padding: '20px 30px', marginBottom: '30px',
    borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  headerTitle: { fontSize: '1.8em', color: '#333' },
};

const ClientLayout = ({ children, pageTitle }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const clientNavLinks = [
    { name: 'Overview', path: '/client', icon: '📊' },
    { name: 'Campaigns', path: '/client/campaigns', icon: '🚀' },
    { name: 'Templates', path: '/client/templates', icon: '📝' },
    { name: 'Contacts', path: '/client/contacts', icon: '👥' },
    { name: 'Reports', path: '/client/reports', icon: '📈' },
    { name: 'Profile', path: '/client/profile', icon: '⚙️' },
  ];

  return (
    <div style={layoutStyles.layoutContainer}>
      <aside style={layoutStyles.sidebar}>
        <div style={layoutStyles.logoContainer}>
          <div style={layoutStyles.logo}>WANotifier</div>
          <p style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.7)', margin: '5px 0 0 0' }}>CLIENT PANEL</p>
        </div>
        <nav>
          <ul style={layoutStyles.navList}>
            {clientNavLinks.map((link) => (
              <li key={link.name} style={layoutStyles.navItem}>
                <Link
                  to={link.path}
                  style={{
                    ...layoutStyles.navLink,
                    ...(location.pathname === link.path ? layoutStyles.activeNavLink : {}),
                  }}
                >
                  <span style={{ marginRight: '10px' }}>{link.icon}</span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '20px' }}>
          <button onClick={logout} style={{ width: '100%', padding: '10px', background: '#FF6347', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>
      <main style={layoutStyles.mainContent}>
        <header style={layoutStyles.header}>
          <h1 style={layoutStyles.headerTitle}>{pageTitle}</h1>
        </header>
        {children}
      </main>
    </div>
  );
};

export default ClientLayout;