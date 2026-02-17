import React, { useState, useEffect, useRef } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";
import "./campaigns.css";

function Campaigns() {
  const API_BASE = process.env.REACT_APP_API_URL || "";

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null); // ✅ selected campaign

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [creating, setCreating] = useState(false);
  const [runningCampaignId, setRunningCampaignId] = useState(null); // ✅ track running campaign
  const [progress, setProgress] = useState(0);


  const [pausedCampaignId, setPausedCampaignId] = useState(null);

  const previewRef = useRef(null);

  const selectedTemplate = templates.find(
    (t) => t.id === selectedTemplateId
  );

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
    fetchCampaigns();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch(`${API_BASE}/api/templates/template`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch templates");
      const templatesArray = Array.isArray(data?.data)
        ? data.data.map((t) => ({ ...t, id: t.template_id }))
        : [];
      setTemplates(templatesArray);
    } catch (err) {
      console.error("Template fetch error:", err);
      setTemplates([]);
    }
  }

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Contact`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch contacts");
      setContacts(data.contacts || []);
    } catch (err) {
      console.error("Contact fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns() {
    setCampaignLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/campaign?action=list`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch campaigns");
      setCampaigns(data.data || []);
    } catch (err) {
      console.error("Campaign fetch error:", err);
    } finally {
      setCampaignLoading(false);
    }
  }

  /* ================= CONTACT HANDLING ================= */

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const selectAll = () =>
    setSelectedContacts(contacts.map((c) => c.contactid));

  const clearAll = () => setSelectedContacts([]);

  const toggleTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
  };

  const openCreateDialog = () => {
    setIsDialogOpen(true);
  };

  const submitCampaign = async () => {
    if (!campaignName.trim()) {
      alert("Campaign name is required");
      return;
    }

    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/user/campaign?action=create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            templateid: selectedTemplateId,
            campaignname: campaignName.trim(),
            status: true,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create campaign");

      setIsDialogOpen(false);
      setCampaignName("");
      setSelectedTemplateId(null);
      fetchCampaigns();
    } catch (error) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  /* ================= HANDLE CAMPAIGN SELECTION ================= */
  const handleSelectCampaign = (campaign) => {
    setSelectedCampaignId(campaign.campaignid);
    setSelectedTemplateId(campaign.templateid); // update preview
  };
 useEffect(() => {
  let interval;

  if (runningCampaignId) {
    setProgress(0);
    let value = 0;

    interval = setInterval(() => {
      value += 5;
      setProgress(value);

      if (value >= 100) {
        clearInterval(interval);
      }
    }, 300);
  }

  return () => clearInterval(interval);
}, [runningCampaignId]);

  return (
    <ClientLayout pageTitle="Campaigns">
      <div className="campaign-page">
        {/* MESSAGE PREVIEW */}
        <div className="campaign-main" ref={previewRef}>
          <h3>Message Template Preview</h3>
          {!selectedTemplate && <p className="empty-preview">Select a template</p>}
          {selectedTemplate && (
            <div className="message-bubble">
              <div className="message-body">{selectedTemplate.message_body}</div>
            </div>
          )}

          {/* CREATED CAMPAIGNS */}
          <div className="campaigns-list">
            <h3 className="campaignh3">Created Campaigns</h3>
            {campaignLoading && <p>Loading campaigns...</p>}
            {campaigns.map((c) => (
  <div
    key={c.campaignid}
    className={`campaign-item ${
      selectedCampaignId === c.campaignid ? "active" : ""
    }`}
    onClick={() => handleSelectCampaign(c)}
  >
    <input
      type="radio"
      name="selectedCampaign"
      checked={selectedCampaignId === c.campaignid}
      onChange={() => handleSelectCampaign(c)}
      onClick={(e) => e.stopPropagation()}
    />

    <span className="campaign-name">
      {c.campaign_name}
    </span>

    {/* ✅ Show Start button ONLY if selected */}
    {selectedCampaignId === c.campaignid && (
  <div className="campaign-actions">
    
    {/* Show Start only if NOT running */}
    {runningCampaignId !== c.campaignid && (
      <button
        className="btn start"
        onClick={(e) => {
          e.stopPropagation();
          setRunningCampaignId(c.campaignid);
        }}
      >
        Start
      </button>
    )}

    {/* Show Pause + Stop only if running */}
    {runningCampaignId === c.campaignid && (
  <>
  {/* Progress Bar */}
<div className="progress-container">
  <div
    className="progress-bar"
    style={{ width: `${progress}%` }}
  ></div>
</div>

    {/* If NOT paused → show Pause */}
    {pausedCampaignId !== c.campaignid && (
      <button
        className="btn pause"
        onClick={(e) => {
          e.stopPropagation();
          setPausedCampaignId(c.campaignid);
        }}
      >
        Pause
      </button>
    )}

    {/* If paused → show Resume */}
    {pausedCampaignId === c.campaignid && (
      <button
        className="btn resume"
        onClick={(e) => {
          e.stopPropagation();
          setPausedCampaignId(null);
        }}
      >
        Resume
      </button>
    )}

    <button
      className="btn stop"
      onClick={(e) => {
        e.stopPropagation();
        setRunningCampaignId(null);
        setPausedCampaignId(null);
      }}
    >
      Stop
    </button>
  </>
)}

  </div>
)}

  </div>
))}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="campaign-right-panel">
          <div className="campaign-buttons-top">
            <button className="btn start" onClick={openCreateDialog}>
              ➕ Create Campaign
            </button>
          </div>

          <div className="campaign-contacts">
            <h3>Contacts</h3>

            <div className="contacts-actions">
              <button onClick={selectAll}>Select All</button>
              <button onClick={clearAll}>Clear</button>
            </div>

            {loading && <p>Loading contacts...</p>}
            {error && <p className="error">{error}</p>}

            <div className="contacts-list">
              {contacts.map((c) => (
                <label key={c.contactid} className="contact-item">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.contactid)}
                    onChange={() => toggleContact(c.contactid)}
                  />
                  {c.name} ({c.phonenum})
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEMPLATE GRID */}
      <div className="grid-wrapper">
        <h3>Templates</h3>
        <div className="template-grid">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`grid-card ${selectedTemplateId === t.id ? "selected" : ""}`}
              onClick={() => toggleTemplate(t.id)}
            >
              <strong>{t.template_name}</strong>
              <div>{t.message_body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE CAMPAIGN DIALOG */}
      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Create Campaign</h3>

            <div className="dialog-form">
              <div>
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div>
                <label>Select Template</label>
                <select
                  value={selectedTemplateId || ""}
                  onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                >
                  <option value="">Select</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.template_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dialog-actions">
              <button onClick={() => setIsDialogOpen(false)}>Cancel</button>

              <button onClick={submitCampaign} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

export default Campaigns;
