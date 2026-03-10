// src/pages/client/templates.jsx
import React, { useEffect, useState, useRef } from 'react';
import"./templates.css"


// set backend origin here.
const API_BASE = process.env.REACT_APP_API_URL || ""
// Simple Icons for UI polish
const Icons = {
  Plus: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Search: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Edit: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Upload: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Send: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
};

export default function TemplatesPage() {
  const emptyTemplate = {
    id: null,
    template_name: "",
    category: "Utility",
    language: "en",
    template_type: "custom",
    header_type: "text",
    header_text: "",
    header_media_url: "",
    message_body: "",
    footer_text: "",
    buttons: [],
    variables: {},
    variable_count: 0
  };

  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyTemplate);
  const [editing, setEditing] = useState(false);
  const [uploading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(null);
// null | "uploading" | "success" | "error"

  const [previewUrl, setPreviewUrl] = useState(""); // temporary preview only


  // Fetch templates on load
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Update char count
  useEffect(() => {
    setCharCount((form.message_body || '').length);
  }, [form.message_body]);

  async function fetchTemplates() {
  try {
    const res = await fetch(`${API_BASE}/api/templates/template`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log("RAW API DATA:", data);

    // ✅ CORRECT extraction
    const templatesArray = Array.isArray(data?.data) ? data.data.map(t=>({
      ...t,
      id:t.template_id,
    }))
    : [];

    console.log("Setting templates:", templatesArray);
    setTemplates(templatesArray);

  } catch (err) {
    console.error("fetchTemplates error", err);
    setTemplates([]);
  }
}
  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addPlaceholder() {
    const next = form.variable_count + 1;
    updateField("message_body", `${form.message_body || ""} {{${next}}}`);
    updateField("variables", { ...form.variables, [next]: "" });
    updateField("variable_count", next);
  }

  function addButton() {
    updateField("buttons", [...form.buttons, { button_type: "quick_reply", button_text: "", button_value: null }]);
  }

  function updateButton(i, key, value) {
    const b = [...form.buttons];
    b[i] = { ...b[i], [key]: value };
    updateField("buttons", b);
  }

  function removeButton(i) {
    const b = form.buttons.filter((_, idx) => idx !== i);
    updateField("buttons", b);
  }

  const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadStatus("uploading");

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/api/templates/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const js = await res.json();

    updateField("header_media_url", js.url);

    setUploadStatus("success");

    // Auto-hide success message after 2 seconds
    setTimeout(() => {
      setUploadStatus(null);
    }, 2000);

  } catch (err) {
    console.error(err);
    setUploadStatus("error");

    setTimeout(() => {
      setUploadStatus(null);
    }, 3000);
  }
};


  function validateTemplate(t) {
    if (!t.template_name) return "Template name required";
    if (!t.message_body) return "Message body required";
    if (t.message_body.length > 1024) return "Body exceeds 1024 chars";
    if (t.footer_text && t.footer_text.length > 60) return "Footer exceeds 60 chars";
    if (t.header_type === "text" && t.header_text && t.header_text.length > 60) return "Header text max 60 chars";
    if (t.buttons && t.buttons.length > 10) return "Max 10 buttons allowed";
    for (const b of t.buttons) if (!b.button_text) return "Each button needs text";
    return null;
  }

async function saveTemplate(e) {
  e?.preventDefault();

  const err = validateTemplate(form);
  if (err) return window.alert(err);

  try {
    const method = form.id ? "PUT" : "POST";
    const endpoint = form.id
  ? `${API_BASE}/api/templates/template?template_id=${encodeURIComponent(form.id)}`
  : `${API_BASE}/api/templates/template`;

    // ✅ Send template_id when updating
    const body = form.id
      ? { ...form, template_id: form.id } // backend requires template_id
      : form;

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("saveTemplate failed", res.status, txt);
      return window.alert("Save failed: " + res.status);
    }

    const data = await res.json();
    window.alert(data.message || "Saved");

    // ✅ Update existing template in state if editing
    if (form.id) {
      setTemplates(prev =>
        prev.map(t => (t.id === form.id ? { ...t, ...form } : t))
      );
    } else {
      // New template → refetch list
      await fetchTemplates();
    }

    // Reset form & editing state
    setForm(emptyTemplate);
    setEditing(false);

  } catch (err) {
    console.error("saveTemplate error", err);
    window.alert("Save failed");
  }
}
  function startEdit(t) {
  // 🔥 CLEAR local preview (THIS WAS THE BUG)
  setPreviewUrl("");

  setForm({
    ...emptyTemplate,
    ...t,
    id: t.id,
    template_id: t.id,
    header_type: t.header_type || "text",
    header_media_url: t.header_media_url || "",
    buttons: t.buttons || [],
    variables: t.variables || {},
    variable_count: t.variable_count || 0,
  });

  setEditing(true);
}

  async function deleteTemplate(id) {
  if (!window.confirm('Delete template?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/templates/template?template_id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: "include"
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Delete failed', res.status, txt);
      return window.alert('Delete failed: ' + res.status);
    }

    const js = await res.json();
    window.alert(js.message || 'Deleted');
    await fetchTemplates();
  } catch (err) {
    console.error('deleteTemplate error', err);
    window.alert('Delete failed');
  }
}


  return (
    <div className="wa-page-root">
      <header className="wa-topbar">
        <div className="wa-title-group">
          <h1>Message Templates</h1>
          <p>Create and manage templates for your WhatsApp campaigns.</p>
        </div>
        <button className="wa-btn wa-btn-primary" onClick={() => { setForm(emptyTemplate); setEditing(true); }}>
          <Icons.Plus /> Create Template
        </button>
      </header>

      <main className="wa-layout">
        {/* Left Sidebar: List */}
        <aside className="wa-sidebar">
          <div className="wa-search-box">
            <Icons.Search />
            <input placeholder="Search templates..." onChange={() => { /* implement search */ }} />
          </div>

          <div className="wa-list-container">
  {templates.length === 0 && (
    <div className="wa-empty-state">No templates found.</div>
  )}

{templates.map((t) => {
  console.log("TEMPLATE:", t);
  console.log("HEADER TYPE:", t.header_type);
  console.log("MEDIA URL:", t.header_media_url);

  return (  <div
    key={t.id}
    id={`template-${t.id}`}
    className={`wa-draft-item ${form.id === t.id ? "active" : ""}`}
    onClick={() => startEdit(t)}

  >
    {/* ===== Template Meta (Professional Sidebar UI) ===== */}
    <div className="wa-draft-meta">
      <div className="wa-draft-title">
        {t.template_name || "Untitled Template"}
      </div>

      
    </div>

    {/* ===== WhatsApp Bubble (UNCHANGED UI) ===== */}
    <div className={`wa-chat-bubble ${form.id === t.id ? "active" : ""}`}>
      {/* Header preview */}
      {t.header_type === "text" && t.header_text && (
        <div className="wa-draft-header-preview">
          {t.header_text}
        </div>
        
      )}

      {t.header_type !== "text" && t.header_media_url && (
  <div className="wa-draft-media-preview">
    {t.header_type === "image" && (
  <div className="wa-thumb-wrapper">
    <img
      src={t.header_media_url}
      alt="media"
      className="wa-draft-thumb"
    />
    
  </div>
)}


    {t.header_type === "video" && (
  <video
    src={t.header_media_url}
    className="wa-draft-thumb"
    muted
    preload="metadata"
  />
)}


    {t.header_type === "document" && (
  <div className="wa-thumb-wrapper">
    <div className="wa-draft-thumb document">
      📄 {t.header_media_url.split("/").pop()}
    </div>

    {/* Preview */}
    <div className="wa-thumb-hover doc-preview">
      <div className="doc-preview-content">
        <span className="doc-icon">📄</span>
        <span className="doc-name">
          {t.header_media_url.split("/").pop()}
        </span>
      </div>
    </div>
  </div>
)}


  </div>
)}

      

      {/* Body */}
      <div className="wa-chat-body">
        {(t.message_body ?? "").substring(0, 120)}
        {(t.message_body ?? "").length > 120 ? "…" : ""}
      </div>

      {/* Footer */}
      <div className="wa-chat-footer">
        <div className="wa-chat-meta">
          
          
        </div>

        <div className="wa-chat-actions">
          <button
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              startEdit(t);
            }}
          >
            <Icons.Edit />
          </button>

          

          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteTemplate(t.id);
            }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  </div>
  );
})}
</div>
        </aside>

        {/* Right Content: Editor */}
        <section className="wa-editor-area">
          {editing ? (
            <div className="wa-editor-grid">
              {/* Form Column */}
              <form className="wa-form-panel" onSubmit={saveTemplate}>
                <div className="wa-panel-header">
                  <h2>{form.id ? 'Edit Template' : 'New Template'}</h2>
                  <div className="wa-actions-group">
                    <button type="button" className="wa-btn wa-btn-ghost" onClick={() => { setForm(emptyTemplate); setEditing(false); }}>Cancel</button>
                    <button type="submit" className="wa-btn wa-btn-primary">{form.id ? "Update Template" : "Create Template"}</button>                  </div>
                </div>

                <div className="wa-form-content">
                  <div className="wa-field-group">
                    <label>Template Name</label>
                    <input 
                      type="text" 
                      value={form.template_name} 
                      onChange={e => updateField('template_name', e.target.value)} 
                      placeholder="e.g. welcome_message_v1" 
                    />
                    <small>Only lowercase alphanumeric and underscores.</small>
                  </div>

                  <div className="wa-row-3">
                    <div className="wa-field-group">
                      <label>Category</label>
                      <select value={form.category ?? 'Utility'} onChange={e => updateField('category', e.target.value)}>
                        <option>Utility</option>
                        <option>Marketing</option>
                        <option>Authentication</option>
                      </select>
                    </div>
                    <div className="wa-field-group">
                      <label>Language</label>
                      <select value={form.language ?? 'en'} onChange={e => updateField('language', e.target.value)}>
                        <option value="en">English (en)</option>
                        <option value="hi">Hindi (hi)</option>
                        <option value="es">Spanish (es)</option>
                        <option value="fr">French (fr)</option>
                      </select>
                    </div>
                    <div className="wa-field-group">
                      <label>Type</label>
                      <select value={form.template_type ?? 'custom'} onChange={e => updateField('template_type', e.target.value)}>
                        <option>Custom</option>
                        <option>Product-Catalog</option>
                        <option>Limited-Time-Offer</option>
                        <option>Carousel</option>
                      </select>
                    </div>
                  </div>

                  <hr className="wa-divider" />

                  <div className="wa-field-group">
                    <label>Header (Optional)</label>
                    <div className="wa-header-row">
  <select
    className="wa-header-type"
    value={form.header_type ?? 'text'}
    onChange={e => updateField('header_type', e.target.value)}
  >
    <option value="text">Text</option>
    <option value="image">Image</option>
    <option value="video">Video</option>
    <option value="document">Document</option>
  </select>

  {form.header_type === 'text' ? (
    <textarea
      className="wa-header-input"
      value={form.header_text ?? ''}
      onChange={e => updateField('header_text', e.target.value)}
      placeholder="Header text..."
      rows={2}
    />
  ) : (
    <div
  className="wa-header-file-box"
  onClick={() => fileRef.current.click()}
>
  <Icons.Upload />
  <span>
    {uploading ? 'Uploading...' : 'Choose file'}
  </span>

  <input
    ref={fileRef}
    type="file"
    onChange={handleUpload}
    hidden
  />
  {uploadStatus === "uploading" && (
  <p style={{ color: "#888", marginTop: "6px" }}>
    ⏳ Uploading...
  </p>
)}

{uploadStatus === "success" && (
  <p style={{ color: "green", marginTop: "6px" }}>
    ✅ Upload successful!
  </p>
)}

{uploadStatus === "error" && (
  <p style={{ color: "red", marginTop: "6px" }}>
    ❌ Upload failed. Try again.
  </p>
)}
</div>
  )}
</div>
                  </div>

                  <div className="wa-field-group">
                    <div className="label-row">
                        <label>Message Body</label>
                        <span className={`char-count ${charCount > 1024 ? 'error' : ''}`}>{charCount} / 1024</span>
                    </div>
                    <div className="wa-textarea-wrapper">
                        <textarea
                        value={form.message_body ?? ''}
                        onChange={e => updateField('message_body', e.target.value)}
                        placeholder="Hi {{1}}, your order {{2}} is ready..."
                        />
                        <div className="wa-toolbar">
                             <button type="button" onClick={addPlaceholder} className="wa-chip-btn">+ Add Variable</button>
                             <div className="wa-toolbar-help">Use variables like {'{{1}}'} for dynamic content.</div>
                        </div>
                    </div>
                  </div>

                  <div className="wa-field-group">
                    <label>Footer (Optional)</label>
                    <input value={form.footer_text ?? ''} onChange={e => updateField('footer_text', e.target.value)} placeholder="e.g. Reply STOP to unsubscribe" />
                  </div>

                  <div className="wa-field-group">
                    <label>Buttons</label>
                    <div className="wa-buttons-list">
                      {(form.buttons || []).map((b, i) => (
                        <div className="wa-button-row" key={i}>
                          <div className="wa-button-inputs">
  <select
    value={b.button_type}
    onChange={e => updateButton(i, 'button_type', e.target.value)}
  >
    <option value="url">Visit Website</option>
    <option value="call">Call Number</option>
    <option value="quick_reply">Quick Reply</option>
    <option value="copy">Copy Code</option>
  </select>

  <input
    placeholder="Label"
    value={b.button_text || ''}
    onChange={e => updateButton(i, 'button_text', e.target.value)}
  />

  <input
    placeholder={
      b.button_type === 'url'
        ? 'https://example.com'
        : 'Action value / phone number'
    }
    value={b.button_value || ''}
    onChange={e => updateButton(i, 'button_value', e.target.value)}
  />
</div>
                          <button type="button" className="wa-icon-btn danger" onClick={() => removeButton(i)}>
                            <Icons.Trash />
                          </button>
                        </div>
                      ))}
                    </div>
                    {(form.buttons || []).length < 10 && (
                        <button type="button" className="wa-btn-dashed" onClick={addButton}>+ Add Button</button>
                    )}
                  </div>
                </div>
              </form>

              {/* Preview Column */}
              <div className="wa-preview-panel">
                <div className="wa-sticky-preview">
                    <h3>Preview</h3>
                    <div className="wa-phone-mockup">
                        {/* Unified Message Card */}
                        <div className="wa-message-card">
                            
                            {/* 1. Message Body Area */}
                            <div className="wa-message-body">
                            
                            {/* Header */}
                            {form.header_type === 'text' && form.header_text && (
                                <div className="msg-header-text">{form.header_text}</div>
                            )}
                            
                            {form.header_type !== 'text' && (
  <div className="msg-header-media">
    {(previewUrl || form.header_media_url) ? (
      form.header_type === 'image' ? (
        <img src={previewUrl || form.header_media_url} alt="Header" style={{ width: '100%', display: 'block' }} />
      ) : form.header_type === 'video' ? (
        <video src={previewUrl || form.header_media_url} controls style={{ width: '100%', display: 'block' }} />
      ) : form.header_type === 'document' ? (
        <div className="doc-preview">
          📄 <strong>Document Attached</strong>
        </div>
      ) : null
    ) : (
      <div className="media-placeholder">No Media</div>
    )}
  </div>
)}


                            {/* Body Text */}
                            <div className="msg-content">
                                {(form.message_body || 'Your message text will appear here...').split(/(\{\{\d+\}\})/g).map((part, i) =>
                                part.match(/\{\{\d+\}\}/) ? <span className="msg-var" key={i}>{part}</span> : <span key={i}>{part}</span>
                                )}
                            </div>

                            {/* Footer */}
                            {form.footer_text && <div className="msg-footer">{form.footer_text}</div>}
                            
                            {/* Timestamp */}
                            <div className="msg-meta">12:00 PM</div>
                            </div>

                            {/* 2. Attached Buttons (Inside the same card) */}
                            {(form.buttons || []).length > 0 && (
                            <div className="wa-message-actions">
                                {(form.buttons || []).map((b, i) => (
  <div key={i} className="msg-action-btn">
    {b.button_type === 'url' && <span className="btn-icon">↗</span>}
    {b.button_type === 'call' && <span className="btn-icon">📞</span>}
    {b.button_type === 'copy' && <span className="btn-icon">📋</span>}
    {b.button_type === 'quick_reply' && <span className="btn-icon">💬</span>}
    {b.button_text || 'Button'}
  </div>
))}
                            </div>
                            )}
                        </div>
                        
                        <div className="preview-note">This is a preview. Actual appearance may vary.</div>
                    </div>
                    <div className="preview-note">This is a preview. Actual appearance may vary on different devices.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="wa-empty-selection">
              <div className="illustration">📝</div>
              <h2>Select a template to edit</h2>
              <p>Or create a new one to get started with your campaign.</p>
              <button className="wa-btn wa-btn-primary" onClick={() => { setForm(emptyTemplate); setEditing(true); }}>
                Create New Template
              </button>
            </div>
          )}
        </section>
      </main>
      </div>
  );
}
