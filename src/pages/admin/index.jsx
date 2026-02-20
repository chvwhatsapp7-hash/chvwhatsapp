import React from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import './index.css';

export default function AdminHomePage() {

  const adminStats = {
    totalClients: 150,
    activeClients: 120,
    totalMessages: '1.2M',
    systemHealth: '99.9%',
  };

  const recentActivities = [
    "New client registered",
    "Campaign approved",
    "Server backup completed",
    "Payment received from Client A"
  ];

  return (
    <AdminLayout pageTitle="Admin Dashboard">

      <div className="admin-dashboard">

        {/* ===== STATS ===== */}
        <div className="stats-grid">
          <div className="card">
            <strong>Total Clients</strong>
            <h2 className="count">{adminStats.totalClients}</h2>
          </div>

          <div className="card">
            <strong>Active Clients</strong>
            <h2 className="count">{adminStats.activeClients}</h2>
          </div>

          <div className="card">
            <strong>Total Messages</strong>
            <h2 className="count">{adminStats.totalMessages}</h2>
          </div>

          <div className="card">
            <strong>System Health</strong>
            <h2 className="count green">{adminStats.systemHealth}</h2>
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="main-grid">

          {/* RECENT ACTIVITY */}
          <div className="card no-padding">
            <div className="card-header">Recent Activity</div>
            <div className="scroll-area">
              {recentActivities.map((activity, i) => (
                <div key={i} className="message-bubble">
                  {activity}
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="card">
            <h3>System Status</h3>
            <p>API Status: <strong className="green">Connected</strong></p>
            <p>Server Load: Normal</p>
            <p>Delivery Rate: 99.2%</p>
          </div>

        </div>

      </div>

    </AdminLayout>
  );
}
