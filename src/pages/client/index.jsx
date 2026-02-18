import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/Layout/ClientLayout';
import './index.css';

export default function ClientHomePage() {
  const [contacts, setContacts] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  const [search, setSearch] = useState('');
  const [user, setUser] = useState({ name: "", phone: "" });
  const [messages, setMessages] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);

  const stats = {
    totalCampaigns: 0,
    messagesSentToday: 0,
    messagesSentMonth: 0,
    activeCampaigns: 0,
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

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

  const API_BASE = process.env.REACT_APP_API_URL || "";

  /* ===== ALL YOUR FETCH FUNCTIONS UNCHANGED ===== */

  const fetchContacts = async () => {
    // setLoading(true);
    // setError("");
    try {
      const res = await fetch(`${API_BASE}/api/Contact`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch contacts");
      setContacts(Array.isArray(data) ? data : data.contacts || []);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile?action=profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      const u = data.user;
      setUser({
        name: `${u.first_name || ""} ${u.last_name || ""}`,
        phone: u.whatsapp_number || ""
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/campaign?action=list`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch campaigns");
      setRecentCampaigns(data.data || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchUser();
    fetchMessages();
    fetchRecentCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentMessages = messages.map(m => ({
    id: m.id || m.messageid,
    name: m.sender_name || "Campaign Message",
    text: m.message || m.text
  }));

  return (
    <ClientLayout pageTitle="Dashboard Overview">
      <div className="client-dashboard">

        {/* ===== STATS ===== */}
        <div className="stats-grid">
          <div className="card"><strong>Total Campaigns</strong><h2>{stats.totalCampaigns}</h2></div>
          <div className="card"><strong>Messages Today</strong><h2>{stats.messagesSentToday}</h2></div>
          <div className="card"><strong>Messages This Month</strong><h2>{stats.messagesSentMonth}</h2></div>
          <div className="card"><strong>Active Campaigns</strong><h2>{stats.activeCampaigns}</h2></div>
        </div>

        {/* ===== WHATSAPP INFO ===== */}
        <div className="whatsapp-info">
          <div><span>Phone Number</span><strong>{user.phone || "N/A"}</strong></div>
          <div><span>Display Name</span><strong>{user.name || "N/A"}</strong></div>
          <div><span>Messaging Limit</span><strong>100k / 24hr</strong></div>
          <div><span>Quality Rating</span><strong className="green">● High</strong></div>
          <div><span>Phone Status</span><strong className="green">CONNECTED</strong></div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="main-grid">

          {/* RECENT MESSAGES */}
          <div className="card no-padding">
            <div className="card-header">Recent Messages</div>
            <div className="scroll-area">
              {recentMessages.map(m => (
                <div key={m.id} className="message-bubble">
                  <div className="message-name">{m.name}</div>
                  <div className="message-text">{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACTS */}
          <div className="card no-padding">
            <div className="card-header">Contacts</div>

            <div className="contact-search">
              <input
                type="text"
                placeholder="Search contacts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="scroll-area">
              {filteredContacts.map(c => (
                <div key={c.id} className="contact-item">
                  <strong>{c.name}</strong>
                  <div className="contact-phone">{c.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="section">
          <div className="card">
            <h3>Quick Actions</h3>
            <div className="button-row">
              {quickActions.map((action, i) => (
                <button key={i} className="primary-btn">{action}</button>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT CAMPAIGNS */}
        <div className="section">
          <div className="card no-padding">
            <div className="card-header">Recent Campaigns</div>
            <div className="scroll-area small">
              {campaignLoading && <p>Loading campaigns...</p>}
              {recentCampaigns.map(c => (
                <div key={c.campaignid} className="message-bubble">
                  <div className="message-name">{c.campaign_name}</div>
                  <div>Status: {c.status ? "Running" : "Stopped"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SYSTEM + NOTIFICATIONS */}
        <div className="double-grid">
          <div className="card">
            <h3>System Status</h3>
            <p>WhatsApp API: <strong className="green">Connected</strong></p>
            <p>Message Queue: Normal</p>
            <p>Delivery Rate: 99.2%</p>
          </div>

          <div className="card">
            <h3>Notifications</h3>
            <ul>
              {notifications.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        </div>

      </div>
    </ClientLayout>
  );
}
