import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import './index.css';

export default function AdminHomePage() {
  const [adminStats, setAdminStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalMessages: 0,
    systemHealth: '0%',
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [ setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || "";

  // ===== Fetch Admin Stats =====
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        method: "GET",
        cache: "no-store", // 🔥 force fresh data
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch stats");

      setAdminStats({
        totalClients: data.totalClients || 0,
        activeClients: data.activeClients || 0,
        totalMessages: data.totalMessages || 0,
        systemHealth: data.systemHealth || "0%",
      });

      setRecentActivities(data.recentActivities || []);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  }, [API_BASE]);

  // ===== Fetch Users =====
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/getUsers`, {
        method: "GET",
        cache: "no-store", // 🔥 force fresh data
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAdminStats(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAdminStats, fetchUsers]);

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
            <div className="card-header">Recent Activity (Past 3 Days)</div>
            <div className="scroll-area">
              {loading ? (
                <p>Loading...</p>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, i) => (
                  <div key={i} className="message-bubble">{activity}</div>
                ))
              ) : (
                <p>No recent activity</p>
              )}
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