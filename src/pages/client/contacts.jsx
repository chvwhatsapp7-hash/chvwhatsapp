import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. --- Fetch existing contacts on page load ---
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/Contact", {
        method: "GET",
        credentials: "include", // IMPORTANT: This sends your auth cookies
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch contacts");
      }

      const data = await res.json();
      setContacts(data.contacts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 2. --- Handler for adding a single contact ---
  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "http://localhost:3000/api/Contact?action=addcontacts",
        {
          method: "POST",
          credentials: "include", // Sends auth cookies
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: [{ name, phonenum: phone }], // Use 'phonenum'
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      await fetchContacts(); // Refresh the list
      setName("");
      setPhone("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. --- Handler for uploading the CSV file ---
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/Uploadcsv", {
        method: "POST",
        credentials: "include", // Sends auth cookies
        body: formData,
        // NOTE: Do NOT set 'Content-Type' header, browser does it for FormData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      await fetchContacts(); // Refresh the list
      setFile(null);
      e.target.reset(); // Clear the file input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout pageTitle="Contacts">
      <>
        {/* --- Loading/Error/Success Messages --- */}
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {success && <p style={{ color: "green" }}>Success: {success}</p>}

        {/* --- Forms --- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          
          {/* --- Form 1: Add Single Contact --- */}
          <form onSubmit={handleAddContact} style={formStyle}>
            <h3>Add Single Contact</h3>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Phone Number (e.g., 91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Adding..." : "Add Contact"}
            </button>
          </form>

          {/* --- Form 2: Upload CSV --- */}
          <form onSubmit={handleCsvUpload} style={formStyle}>
            <h3>Upload CSV File</h3>
            <p style={{ margin: 0, fontSize: "0.9em" }}>
              CSV must have 'name' and 'phnnum' columns.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </form>
        </div>

        {/* --- Contacts List Table --- */}
        <h2 style={{ marginTop: "2rem" }}>Your Contacts</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={contact.contact_id}>
                  <td style={tdStyle}>{contact.name}</td>
                  {/* Use 'phonenum' here as well */}
                  <td style={tdStyle}>{contact.phonenum}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={tdStyle}>
                  You have no contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    </ClientLayout>
  );
}

// --- Basic Styles (for demonstration) ---
const formStyle = {
  padding: "1.5rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
};
const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  margin: "0.5rem 0",
  boxSizing: "border-box",
  borderRadius: "4px",
  border: "1px solid #ccc",
};
const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
};
const thStyle = {
  backgroundColor: "#f2f2f2",
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};
const tdStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid #ddd",
};

export default Contacts;