import React, { useState, useEffect } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";

function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Templates
  const [templates] = useState([
    {
      id: 1,
      name: "Promotion",
      message: "Hello {{name}}, check out our latest offers!",
    },
    {
      id: 2,
      name: "Reminder",
      message: "Hi {{name}}, this is a reminder for your appointment.",
    },
    {
      id: 3,
      name: "Greetings",
      message: "Hello {{name}}, thank you for being with us.",
    },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const selectedTemplate = templates.find(
    (t) => t.id === Number(selectedTemplateId)
  );

  const API_BASE = process.env.REACT_APP_API_URL || "";

  // ---------------- FETCH CONTACTS ----------------
  const fetchContacts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/Contact`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch contacts");

      setContacts(data.contacts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ---------------- SELECT LOGIC ----------------
  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAll = () => {
    setSelectedContacts(contacts.map((c) => c.contactid));
  };

  const clearAll = () => {
    setSelectedContacts([]);
  };

  return (
    <ClientLayout pageTitle="Campaigns">
      <div style={styles.page}>
        {/* LEFT CONTENT */}
        <div style={styles.main}>
          <h1>Campaigns</h1>
          <p>Create and manage campaigns here.</p>

          <p>
            <strong>Selected Contacts:</strong> {selectedContacts.length}
          </p>

          {/* MESSAGE TEMPLATE BOX */}
          <div style={styles.templateBox}>
            <h3 style={styles.templateTitle}>Message Template</h3>

            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={styles.templateSelect}
            >
              <option value="">Select a template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <textarea
              style={styles.templatePreview}
              value={selectedTemplate?.message || ""}
              placeholder="Template preview will appear here..."
              readOnly
            />
          </div>
        </div>

        {/* RIGHT CONTACTS PANEL */}
        <div style={styles.contacts}>
          <h3 style={styles.contactsTitle}>Contacts</h3>

          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={selectAll}>
              Select All
            </button>
            <button style={styles.actionBtn} onClick={clearAll}>
              Clear
            </button>
          </div>

          {loading && <p>Loading contacts...</p>}
          {error && <p style={{ color: "salmon" }}>{error}</p>}

          <div style={styles.list}>
            {contacts.map((contact) => (
              <label key={contact.contactid} style={styles.contactItem}>
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.contactid)}
                  onChange={() => toggleContact(contact.contactid)}
                />
                <div>
                  <div style={styles.name}>{contact.name}</div>
                  <div style={styles.phone}>{contact.phonenum}</div>
                </div>
              </label>
            ))}

            {!loading && contacts.length === 0 && (
              <p>No contacts found</p>
            )}

            <button
              style={{
                ...styles.campaignBtn,
                opacity:
                  selectedContacts.length === 0 || !selectedTemplateId
                    ? 0.5
                    : 1,
                cursor:
                  selectedContacts.length === 0 || !selectedTemplateId
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={
                selectedContacts.length === 0 || !selectedTemplateId
              }
              onClick={() => {
                console.log("Contacts:", selectedContacts);
                console.log("Template:", selectedTemplate);
              }}
            >
              Start Campaign
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export default Campaigns;

/* ===================== STYLES ===================== */

const styles = {
  page: {
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
  },

  main: {
    flex: 1,
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px hsl(0, 22%, 97%)",
  },

  templateBox: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "10px",
    background: "#f7f9fc",
    border: "1px solid #cdc1c1",
  },

  templateTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  templateSelect: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid hsl(0, 14%, 80%)",
    marginBottom: "12px",
  },

  templatePreview: {
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid rgb(77, 54, 54)",
    resize: "none",
    background: "#efe9e9",
  },

  contacts: {
    width: "340px",
    background: "rgb(255, 255, 255)",
    color: "#0b0404",
    padding: "20px",
    borderRadius: "12px",

  },

  contactsTitle: {
    fontSize: "18px",
    marginBottom: "15px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  actionBtn: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#e8edf0",
    color: "#1422eac7",
    fontSize: "13px",
    cursor: "pointer",
  },

  list: {
    maxHeight: "360px",
    overflowY: "auto",
  },

  contactItem: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    borderRadius: "8px",
    background: "#eaeced",
    marginBottom: "8px",
  },

  name: {
    fontSize: "14px",
    fontWeight: "600",
  },

  phone: {
    fontSize: "12px",
    color: "#0a0c0b",
  },

  campaignBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #008eed, #0547d6e3)",
    color: "#040303f0",
    fontSize: "16px",
    fontWeight: "600",
  },
};
