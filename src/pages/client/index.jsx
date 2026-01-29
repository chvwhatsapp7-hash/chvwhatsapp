import React from 'react';
import ClientLayout from '../../components/Layout/ClientLayout';

export default function ClientHomePage() {
  const stats = {
    totalCampaigns: 25,
    messagesSentToday: 1500,
    messagesSentMonth: 45000,
    activeCampaigns: 3,
    totalContacts: 820,
    activeContacts: 640,
  };

  const recentMessages = [
    { id: 1, name: 'Sneha', text: 'Campaign delivered successfully' },
    { id: 2, name: 'Ravi', text: 'User replied to message' },
    { id: 3, name: 'Anjali', text: 'Message read' },
  ];

  const recentContacts = [
    { id: 1, name: 'Rahul', phone: '+91 98765 43210' },
    { id: 2, name: 'Priya', phone: '+91 91234 56789' },
    { id: 3, name: 'Karthik', phone: '+91 99887 66554' },
  ];

  /* 🔹 EXTRA FEATURES DATA */
  const recentCampaigns = [
    { id: 1, name: 'Diwali Sale', status: 'Running' },
    { id: 2, name: 'New Launch Promo', status: 'Completed' },
  ];

  const notifications = [
    'WhatsApp API connected successfully',
    'New contact list uploaded',
    'Campaign Diwali Sale is live',
  ];

  const quickActions = [
    'Send Message',
    'Create Campaign',
    'Import Contacts',
    'View Reports',
  ];

  const card = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  return (
    <ClientLayout pageTitle="Dashboard Overview">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
        <div style={card}><strong>Total Campaigns</strong><h2>{stats.totalCampaigns}</h2></div>
        <div style={card}><strong>Messages Today</strong><h2>{stats.messagesSentToday}</h2></div>
        <div style={card}><strong>Messages This Month</strong><h2>{stats.messagesSentMonth}</h2></div>
        <div style={card}><strong>Active Campaigns</strong><h2>{stats.activeCampaigns}</h2></div>
      </div>

      {/* Extra Features */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        <div style={card}>
          <h3>Recent Messages</h3>
          {recentMessages.map(m => (
            <p key={m.id}><strong>{m.name}:</strong> {m.text}</p>
          ))}
        </div>

        <div style={card}>
          <h3>Contacts</h3>
          <p>Total: {stats.totalContacts}</p>
          <p>Active: {stats.activeContacts}</p>
          <hr />
          {recentContacts.map(c => (
            <p key={c.id}><strong>{c.name}</strong><br />{c.phone}</p>
          ))}
        </div>

      </div>

      {/* 🔹 QUICK ACTIONS */}
      <div style={{ marginTop: '30px' }}>
        <div style={card}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {quickActions.map((action, i) => (
              <button key={i} style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #075E54',
                background: '#075E54',
                color: '#fff',
                cursor: 'pointer',
              }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 RECENT CAMPAIGNS */}
      <div style={{ marginTop: '30px' }}>
        <div style={card}>
          <h3>Recent Campaigns</h3>
          {recentCampaigns.map(c => (
            <p key={c.id}><strong>{c.name}</strong> — {c.status}</p>
          ))}
        </div>
      </div>

      {/* 🔹 SYSTEM STATUS + NOTIFICATIONS */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div style={card}>
          <h3>System Status</h3>
          <p>WhatsApp API: <strong style={{ color: 'green' }}>Connected</strong></p>
          <p>Message Queue: Normal</p>
          <p>Delivery Rate: 99.2%</p>
        </div>

        <div style={card}>
          <h3>Notifications</h3>
          <ul>
            {notifications.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

      </div>

    </ClientLayout>
  );
}
