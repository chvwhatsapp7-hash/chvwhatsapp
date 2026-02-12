import React, { useState, useEffect, useRef } from "react";
import ClientLayout from "../../components/Layout/ClientLayout";
import "./campaigns.css";

function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [campaignStatus, setCampaignStatus] = useState("idle"); // idle | running | paused | completed
  const [currentContactIndex, setCurrentContactIndex] = useState(0);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const previewRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedTemplate && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedTemplate]);

  // Iterate contacts while campaign is running
  useEffect(() => {
    let timer;
    if (campaignStatus === "running" && selectedContacts.length > 0) {
      if (currentContactIndex < selectedContacts.length) {
        const contact = contacts.find(
          (c) => c.contactid === selectedContacts[currentContactIndex]
        );
        const message = selectedTemplate?.message_body || "";

        // Log message sending
        console.log(
          `Sending to ${contact.name} (${contact.phonenum}): ${message}`
        );

        timer = setTimeout(() => {
          setCurrentContactIndex((prev) => prev + 1);
        }, 1000); // 1 second per contact
      } else {
        console.log("Campaign completed");
        setCampaignStatus("completed"); // Keep panel visible after completion
      }
    }

    return () => clearTimeout(timer);
  }, [campaignStatus, currentContactIndex, selectedContacts, contacts, selectedTemplate]);

  async function fetchTemplates() {
    try {
      const res = await fetch(`${API_BASE}/api/templates/template`, {
        credentials: "include",
      });
      const data = await res.json();
      const templatesArray = Array.isArray(data?.data)
        ? data.data.map((t) => ({ ...t, id: t.template_id }))
        : [];
      setTemplates(templatesArray);
    } catch {
      setTemplates([]);
    }
  }

  async function fetchContacts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/Contact`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedContacts(contacts.map((c) => c.contactid));
  const clearAll = () => setSelectedContacts([]);

  const toggleTemplate = (templateId) => {
    setSelectedTemplateId((prev) => (prev === templateId ? null : templateId));
  };

  // Campaign Actions
  const startCampaign = () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      alert("Please select a template and at least one contact");
      return;
    }
    // If campaign was paused, continue from currentContactIndex
    setCampaignStatus("running");
  };

  const pauseResumeCampaign = () => {
    setCampaignStatus((prev) =>
      prev === "running" ? "paused" : "running"
    );
  };

  const cancelCampaign = () => {
    setCampaignStatus("idle");
    setCurrentContactIndex(0);
  };

  return (
    <ClientLayout pageTitle="Campaigns">
      <div className="campaign-page">
        {/* LEFT: TEMPLATE PREVIEW */}
        <div className="campaign-main" ref={previewRef}>
          <h3>Message Template Preview</h3>

          {!selectedTemplate && (
            <p className="empty-preview">Select a template from the grid below</p>
          )}

          {selectedTemplate && (
            <div className="message-bubble">
              {selectedTemplate.header_type === "text" &&
                selectedTemplate.header_text && (
                  <div className="message-header">{selectedTemplate.header_text}</div>
                )}
              {selectedTemplate.header_type === "image" &&
                selectedTemplate.header_media_url && (
                  <img
                    src={selectedTemplate.header_media_url}
                    alt="template"
                    className="message-image"
                  />
                )}
              {selectedTemplate.header_type === "video" &&
                selectedTemplate.header_media_url && (
                  <video
                    src={selectedTemplate.header_media_url}
                    controls
                    className="message-video"
                  />
                )}
              {selectedTemplate.message_body && (
                <div className="message-body">{selectedTemplate.message_body}</div>
              )}
            </div>
          )}

          {/* PROGRESS PANEL */}
          {campaignStatus !== "idle" && (
            <div className="campaign-progress-panel">
              <div className="progress-header">
                <h4>Campaign Status</h4>
              </div>

              {(campaignStatus === "running" ||
                campaignStatus === "paused" ||
                campaignStatus === "completed") && (
                <>
                  <p>
                    {campaignStatus === "running"
                      ? "Sending message to selected contacts..."
                      : campaignStatus === "paused"
                      ? "Campaign paused"
                      : "message have been sent!"}
                  </p>

                  {/* Show contact list only while running or paused */}
                  {(campaignStatus === "running" || campaignStatus === "paused") && (
                    <div className="contact-progress-list">
                      {selectedContacts.map((contactId, index) => {
                        const contact = contacts.find((c) => c.contactid === contactId);
                        return (
                          <div
                            key={contactId}
                            className={`contact-item-progress ${
                              index === currentContactIndex &&
                              campaignStatus !== "completed"
                                ? "active"
                                : ""
                            }`}
                          >
                            {contact?.name} ({contact?.phonenum})
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          ((campaignStatus === "completed"
                            ? selectedContacts.length
                            : currentContactIndex) /
                            selectedContacts.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: CONTACTS + BUTTONS */}
        <div className="campaign-right-panel">
          <div className="campaign-buttons-top">
            {campaignStatus === "idle" && (
              <button className="btn start" onClick={startCampaign}>
                ▶ Start Campaign
              </button>
            )}

            {campaignStatus !== "idle" && (
              <>
                {/* Pause/Resume toggle */}
                <button className="btn pause" onClick={pauseResumeCampaign}>
                  {campaignStatus === "running" ? "⏸ Pause Campaign" : "▶ Resume Campaign"}
                </button>

                <button className="btn cancel" onClick={cancelCampaign}>
                  ✖ Cancel Campaign
                </button>
              </>
            )}
          </div>

          <div className="campaign-contacts">
            <h3>Contacts</h3>
            <div className="contacts-actions">
              <button className="btn select-clear" onClick={selectAll}>
                Select All
              </button>
              <button className="btn select-clear" onClick={clearAll}>
                Clear
              </button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            {/* Only show contacts list if not completed */}
            {campaignStatus !== "completed" && (
              <div className="contacts-list">
                {contacts.map((c) => (
                  <label key={c.contactid} className="contact-item">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(c.contactid)}
                      onChange={() => toggleContact(c.contactid)}
                      disabled={campaignStatus === "running"}
                    />
                    <div>
                      <div>{c.name}</div>
                      <div>{c.phonenum}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      <div className="grid-wrapper">
        <h3>Templates Grid View</h3>
        <div className="template-grid">
          {templates.map((t) => {
            const isSelected = selectedTemplateId === t.id;
            return (
              <div
                key={t.id}
                className={`grid-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleTemplate(t.id)}
              >
                <div className="grid-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTemplate(t.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <strong>{t.template_name}</strong>

                {t.header_type === "image" && t.header_media_url && (
                  <img src={t.header_media_url} alt="template" className="grid-image" />
                )}
                {t.header_type === "video" && t.header_media_url && (
                  <video src={t.header_media_url} className="grid-video" muted />
                )}
                {t.header_type === "text" && t.header_text && (
                  <div className="grid-header-text">{t.header_text}</div>
                )}

                <div className="grid-body">{t.message_body}</div>
                <div className="grid-footer">
                  <span>{t.category}</span>
                  <span>{t.template_type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ClientLayout>
  );
}

export default Campaigns;
