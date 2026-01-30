import React, { useState ,useEffect} from 'react';
import ClientLayout from '../../components/Layout/ClientLayout';

export default function ClientHomePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState('');
  const [user, setUser] = useState({ name: "", phone: "" });

  const stats = {
    totalCampaigns: 0,
    messagesSentToday: 0,
    messagesSentMonth: 0,
    activeCampaigns: 0,

  };


  const recentMessages = [
    { id: 1, name: 'Sneha', text: 'Campaign delivered successfully' },
    { id: 2, name: 'Ravi', text: 'User replied to message' },
    { id: 3, name: 'Anjali', text: 'Message read' },
    { id: 4, name: 'Sneha', text: 'Follow-up message sent' },
    { id: 5, name: 'Ravi', text: 'Delivery confirmed' },
  ];

  

  const filteredContacts = contacts.filter(c =>
  c.name?.toLowerCase().includes(search.toLowerCase())
);


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
  const API_BASE = process.env.REACT_APP_API_URL || "";

  const fetchContacts = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${API_BASE}/api/Contact`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    console.log("STEP 3 - API response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch contacts");
    }

    setContacts(Array.isArray(data) ? data : data.contacts || []);
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
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

    if (!res.ok) throw new Error(data.message || "Failed to fetch user");

    const u = data.user;

    setUser({
      name: `${u.first_name || ""} ${u.last_name || ""}`,
      phone: u.whatsapp_number || ""
    });

    console.log("User info fetched:", u);
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

  
    useEffect(() => {
      fetchContacts();
      fetchUser(); 
    }, []);
    useEffect(() => {
  console.log("Contacts updated:", contacts);
}, [contacts]);

  return (
    <ClientLayout pageTitle="Dashboard Overview">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
        <div style={card}><strong>Total Campaigns</strong><h2>{stats.totalCampaigns}</h2></div>
        <div style={card}><strong>Messages Today</strong><h2>{stats.messagesSentToday}</h2></div>
        <div style={card}><strong>Messages This Month</strong><h2>{stats.messagesSentMonth}</h2></div>
        <div style={card}><strong>Active Campaigns</strong><h2>{stats.activeCampaigns}</h2></div>
      </div>

      {/* ✅ WHATSAPP INFO ROW — ADDED ONLY */}
      <div style={{
        marginTop: '16px',
        background: '#ECE5DD',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#555' }}>Phone Number</div>
          <strong>{user.phone || "N/A"}</strong>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#555' }}>Display Name</div>
          <strong>{user.name || "N/A"}</strong>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#555' }}>Messaging Limit</div>
          <strong>100k / 24hr</strong>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#555' }}>Quality Rating</div>
          <strong style={{ color: 'green' }}>● High</strong>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#555' }}>Phone Status</div>
          <strong style={{ color: 'green' }}>CONNECTED</strong>
        </div>
      </div>

      {/* Extra Features */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* RECENT MESSAGES — UNCHANGED */}
        <div style={{ ...card, padding: 0 }}>
          <div style={{
            background: '#075E54',
            color: '#fff',
            padding: '12px 16px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            fontWeight: 'bold'
          }}>
            Recent Messages
          </div>

          <div style={{
            padding: '16px',
            height: '260px',
            overflowY: 'scroll',
            background: '#ECE5DD',
            scrollbarWidth: 'none',
          }}>
            <style>{`div::-webkit-scrollbar{display:none;}`}</style>

            {recentMessages.map(m => (
              <div key={m.id} style={{
                background: '#DCF8C6',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '10px',
                maxWidth: '75%',
              }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#075E54' }}>{m.name}</div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>{m.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACTS — FILTER WORKS */}
        <div style={{ ...card, padding: 0 }} className="contact-box">

          <div style={{
            background: '#075E54',
            color: '#fff',
            padding: '12px 16px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            fontWeight: 'bold'
          }}>
            Contacts
          </div>

          <div style={{ padding: '12px 16px', background: '#F0F2F5' }}>
            {/* <p>Total: <strong>{stats.totalContacts}</strong></p>
            <p>Active: <strong>{stats.activeContacts}</strong></p> */}

            <input
              type="text"
              placeholder="Search contacts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '8px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{
            maxHeight: '200px',
            overflowY: 'scroll',
            background: '#ECE5DD',
            scrollbarWidth: 'none'
          }}>
            <style>{`.contact-box div::-webkit-scrollbar{display:none;}`}</style>

            {filteredContacts.map(c => (
              <div key={c.id} style={{
                background: '#fff',
                padding: '12px 16px',
                borderBottom: '1px solid #ddd'
              }}>
                <strong>{c.name}</strong>
                <div style={{ fontSize: '12px', color: '#555' }}>{c.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
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
              }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT CAMPAIGNS */}
      <div style={{ marginTop: '30px' }}>
        <div style={card}>
          <h3>Recent Campaigns</h3>
          {recentCampaigns.map(c => (
            <p key={c.id}><strong>{c.name}</strong> — {c.status}</p>
          ))}
        </div>
      </div>

      {/* SYSTEM STATUS + NOTIFICATIONS */}
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
