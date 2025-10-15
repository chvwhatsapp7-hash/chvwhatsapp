import React from 'react';
import ClientLayout from '../../components/Layout/ClientLayout';

const ClientHomePage = () => {
  // Mock data for Client Dashboard
  const stats = {
    totalCampaigns: 25,
    messagesSentToday: 1500,
    messagesSentMonth: 45000,
    activeCampaigns: 3,
  };

  const cardStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };
  const cardTitleStyle = { fontSize: '1.1em', color: '#555', marginBottom: '10px' };
  const cardValueStyle = { fontSize: '2.5em', fontWeight: 'bold', color: '#075E54' };

  return (
    <ClientLayout pageTitle="Dashboard Overview">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Campaigns</h3>
          <span style={cardValueStyle}>{stats.totalCampaigns}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Messages Sent (Today)</h3>
          <span style={cardValueStyle}>{stats.messagesSentToday.toLocaleString()}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Messages Sent (Month)</h3>
          <span style={cardValueStyle}>{stats.messagesSentMonth.toLocaleString()}</span>
        </div>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Active Campaigns</h3>
          <span style={cardValueStyle}>{stats.activeCampaigns}</span>
        </div>
      </div>
      {/* Add more client dashboard components here, like recent campaigns list, charts, etc. */}
    </ClientLayout>
  );
};

export default ClientHomePage;