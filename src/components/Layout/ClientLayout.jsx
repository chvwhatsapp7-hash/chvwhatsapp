import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
/*import { useNavigate } from 'react-router-dom';*/

// Reusing the same style object from AdminLayout for consistency
const layoutStyles = {
  layoutContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  sidebar: {
  width: '250px',
  background: 'linear-gradient(180deg, #0f766e, #065f46)',
  color: 'white',
  padding: '90px 0px 0px 0px',
  boxShadow: '2px 0 15px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',

  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  overflowY: 'auto'
},


  logoContainer: {
    padding: '0 20px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '20px', textAlign: 'center',
  },
logo: {
  fontSize: '1.8em',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #ffffff, #ffffff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
},
  navList: { listStyle: 'none', padding: '0', margin: '0', flexGrow: 1 },
  navItem: { marginBottom: '5px' },
  navLink: {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  textDecoration: 'none',
  color: 'rgba(255,255,255,0.9)',
  fontSize: '1em',
  borderRadius: '0 20px 20px 0',
  marginRight: '10px',
  transition: 'all 0.25s ease',
},

 activeNavLink: {
  background: 'rgba(255,255,255,0.2)',
  color: '#ffffff',
  fontWeight: '600',
  boxShadow: 'inset 4px 0 0 #ffffff',
},

mainContent: {
  flexGrow: 1,
  padding: '30px',
  marginLeft: '250px',   // IMPORTANT
  overflowY: 'auto'
},
header: {
  background: "linear-gradient(145deg, rgba(13,148,136,0.18), rgba(13,148,136,0.08))",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  padding: "20px 30px",
  marginBottom: "30px",
  borderRadius: "12px",
  border: "1px solid rgba(13,148,136,0.25)",
  boxShadow: "0 8px 30px rgba(13,148,136,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease"
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
    { name: 'Profile', path: '/client/profile', icon: '⚙️' },
  ];

  return (
    <div style={layoutStyles.layoutContainer}>
      <aside style={layoutStyles.sidebar}>
        <div style={layoutStyles.logoContainer}>
          <div style={layoutStyles.logo}>CHV Whatsapp</div>
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
         <button
  onClick={logout}
  style={{
    width: '100%',
    padding: '10px',
    background: 'rgba(247, 65, 65, 0.79)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  }}
>
  Logout
</button>

        </div>
      </aside>
     <main style={layoutStyles.mainContent}>
  {pageTitle && (
    <header style={layoutStyles.header}>
      <h1 style={layoutStyles.headerTitle}>{pageTitle}</h1>
    </header>
  )}

  {children}
</main>

    </div>
  );
};

export default ClientLayout;