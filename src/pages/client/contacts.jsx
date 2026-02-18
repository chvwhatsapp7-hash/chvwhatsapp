// import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Contact`, {
        method: "GET",
        credentials: "include",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_BASE}/api/Contact?action=addcontacts`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: [{ name, phonenum: phone }],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      await fetchContacts();
      setName("");
      setPhone("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Handler for uploading the CSV file ---
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
      const res = await fetch(`${API_BASE}/api/Uploadcsv`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      await fetchContacts();
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/Contact/${contactId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message || "Contact deleted successfully");
      await fetchContacts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
  const header = ["name", "phnnum"]; // two columns
  const rows = [["", ""]]; // one empty row (optional, can be empty)
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [header, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "contacts.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <ClientLayout pageTitle="Contacts">
      <>
        {/* --- Loading/Error/Success Messages --- */}
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {success && <p style={{ color: "green" }}>Success: {success}</p>}

        {/* --- Forms --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* --- Add Single Contact --- */}
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

          {/* --- Upload CSV --- */}
          <form onSubmit={handleCsvUpload} style={formStyle}>
            <h3>Upload CSV File</h3>
            <p style={{ margin: 0, fontSize: "0.9em" }}>
              CSV must have 'name' and 'phnnum' columns.
            </p>
            <button
            type="button"
            onClick={handleExportCsv}
            style={{
            padding: "2px 6px",
            fontSize: "0.75rem",
            marginLeft: "8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}>
          Export
        </button>
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
        {/* <button
            type="button"
            onClick={handleExportCsv}
            style={{
            padding: "2px 6px",
            fontSize: "0.75rem",
            marginLeft: "8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
           }}
  > Export
         </button>
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
         
   */}

        {/* --- Contacts List Table --- */}
        <h2 style={{ marginTop: "2rem" }}>Your Contacts</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Phone Number</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={contact.contactid}>
                  <td style={tdStyle}>{contact.name}</td>
                  <td style={tdStyle}>{contact.phonenum}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDeleteContact(contact.contactid)}
                      disabled={loading}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={tdStyle}>
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

const deleteButtonStyle = {
  padding: "0.3rem 0.6rem",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.9rem",
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