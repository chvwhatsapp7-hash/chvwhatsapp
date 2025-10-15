import React from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';

const AdminHomePage = () => {
  // Mock data for Admin Dashboard
  const adminStats = {
    totalClients: 150,
    activeClients: 120,
    pendingApprovals: 5,
    totalMessages: '1.2M',
  };

  const cardStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };
  const cardTitleStyle = { fontSize: '1.1em', color: '#555', marginBottom: '10px' };
  const cardValueStyle = { fontSize: '2.5em', fontWeight: 'bold', color: '#075E54' };

  return (
    <AdminLayout pageTitle="Admin Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Clients</h3>
          <span style={cardValueStyle}>{adminStats.totalClients}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Active Clients</h3>
          <span style={cardValueStyle}>{adminStats.activeClients}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Pending Template Approvals</h3>
          <span style={cardValueStyle}>{adminStats.pendingApprovals}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Messages Processed</h3>
          <span style={cardValueStyle}>{adminStats.totalMessages}</span>
        </div>
      </div>
      {/* Add more admin dashboard components here, like recent activity logs, charts, etc. */}
    </AdminLayout>
  );
};

export default AdminHomePage;