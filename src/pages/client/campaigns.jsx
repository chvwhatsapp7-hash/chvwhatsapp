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
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [creating, setCreating] = useState(false);

  const [runningCampaignId, setRunningCampaignId] = useState(null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaignId(campaign.campaignid);
    setSelectedTemplateId(campaign.templateid);
  };

  useEffect(() => {
    let interval;

    if (runningCampaignId && pausedCampaignId !== runningCampaignId) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }

    return () => clearInterval(interval);
  }, [runningCampaignId, pausedCampaignId]);

  return (
    <ClientLayout pageTitle="Campaigns">
      <div className="campaign-page">
        <div className="campaign-main" ref={previewRef}>
          <h3>Message Template Preview</h3>

          {!selectedTemplate && (
            <p className="empty-preview">Select a template</p>
          )}

          {selectedTemplate && (
            <div className="message-bubble">
              <div className="message-body">
                {selectedTemplate.message_body}
              </div>
            </div>
          )}

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

                <span
                  className="campaign-name"
                  style={{ width: "100%" }}
                >
                  {c.campaign_name}

                  {runningCampaignId === c.campaignid && (
                    <div
                      className="progress-container"
                      style={{
                        margin: "6px auto 0",
                        width: "70%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </span>

                {selectedCampaignId === c.campaignid && (
                  <div className="campaign-actions">
                    {runningCampaignId !== c.campaignid && (
                      <button
                        className="btn start"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProgress(0);
                          setPausedCampaignId(null);
                          setRunningCampaignId(c.campaignid);
                        }}
                      >
                        Start
                      </button>
                    )}

                    {runningCampaignId === c.campaignid && (
                      <>
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

        <div className="campaign-right-panel">
          <div className="campaign-buttons-top">
            <button className="btn start" onClick={openCreateDialog}>
              ➕ Create Campaign
            </button>
          </div>

          <div className="campaign-contacts">

  <div className="contacts-header">
    <h3>Contacts</h3>

    <select
      className="range-select"
      onChange={(e) => {
        const value = e.target.value;

        if (!value) {
          setSelectedContacts([]);
          return;
        }

        const [start, end] = value.split("-").map(Number);

        const rangedContacts = contacts
          .slice(start, end)
          .map((c) => c.contactid);

        setSelectedContacts(rangedContacts);
      }}
    >
      <option value="">Select Range</option>

      {(() => {
        const step = 10;
        const options = [];

        for (let i = 0; i < contacts.length; i += step) {
          const end = Math.min(i + step, contacts.length);

          options.push(
            <option key={i} value={`${i}-${end}`}>
              {i + 1} - {end}
            </option>
          );
        }

        return options;
      })()}
    </select>
  </div>

  <div className="contacts-actions">
    <button onClick={selectAll}>Select All</button>
    <button onClick={clearAll}>Clear</button>
  </div>

  {loading && <p>Loading contacts...</p>}
  {error && <p className="error">{error}</p>}

  <div className="contacts-list">
    {[...contacts]
      .sort((a, b) => {
        const aSelected = selectedContacts.includes(a.contactid);
        const bSelected = selectedContacts.includes(b.contactid);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        return 0;
      })
      .map((c) => (
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

      <div className="grid-wrapper">
        <h3>Templates</h3>
        <div className="template-grid">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`grid-card ${
                selectedTemplateId === t.id ? "selected" : ""
              }`}
              onClick={() => toggleTemplate(t.id)}
            >
              <strong>{t.template_name}</strong>
              <div>{t.message_body}</div>
            </div>
          ))}
        </div>
      </div>

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
                  onChange={(e) =>
                    setSelectedTemplateId(Number(e.target.value))
                  }
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
              <button onClick={() => setIsDialogOpen(false)}>
                Cancel
              </button>

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
