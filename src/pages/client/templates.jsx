// src/pages/client/templates.jsx
import React, { useEffect, useState, useRef } from 'react';

// set backend origin here.
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:3000";

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
  const [uploading, setUploading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileRef = useRef(null);

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

  async function handleUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Revoke previous local preview
  if (previewUrl) URL.revokeObjectURL(previewUrl);

  const localUrl = URL.createObjectURL(file);
  setPreviewUrl(localUrl);

  const type = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : "document";

  updateField("header_type", type);

  setUploading(true);
  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/api/templates/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    if (!res.ok) throw new Error("Upload failed");

    const js = await res.json();
    // Set permanent backend URL
    updateField("header_media_url", js.url);

    // Clear temporary preview
    setPreviewUrl("");
  } catch (err) {
    console.error(err);
    window.alert("Upload failed");
  } finally {
    setUploading(false);
  }
}



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

  {templates.map((t) => (
  <div
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
))}
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

      <style>{`
        /* Global & Reset */
        :root {
            --wa-primary: #008069; /* WhatsApp Green */
            --wa-primary-hover: #006b57;
            --wa-bg: #f0f2f5;
            --wa-white: #ffffff;
            --wa-border: #e9edef;
            --wa-text-main: #111b21;
            --wa-text-sub: #54656f;
            --wa-danger: #ea0038;
            --wa-blue: #009de2;
            --radius-md: 8px;
            --radius-lg: 12px;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .wa-page-root {
            font-family: var(--font-stack);
            background-color: var(--wa-bg);
            min-height: 100vh;
            color: var(--wa-text-main);
            display: flex;
            flex-direction: column;
        }

        * { box-sizing: border-box; }

        /* Topbar */
        .wa-topbar {
            background: var(--wa-white);
            border-bottom: 1px solid var(--wa-border);
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .wa-title-group h1 { font-size: 20px; margin: 0; font-weight: 600; }
        .wa-title-group p { font-size: 13px; color: var(--wa-text-sub); margin: 4px 0 0 0; }

        /* Buttons */
        .wa-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .wa-btn-primary {
            background-color: var(--wa-primary);
            color: white;
        }
        .wa-btn-primary:hover { background-color: var(--wa-primary-hover); }
        .wa-btn-ghost { background: transparent; color: var(--wa-text-sub); }
        .wa-btn-ghost:hover { background: #f5f6f6; color: var(--wa-text-main); }
        .wa-btn-dashed {
            width: 100%; border: 1px dashed #ccc; background: transparent; color: var(--wa-primary); padding: 8px; border-radius: 6px; cursor: pointer;
        }
        .wa-btn-dashed:hover { background: #f0fdf4; border-color: var(--wa-primary); }

        /* Layout Grid */
        .wa-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 74px);
  overflow: hidden;
}

        /* Sidebar */
        .wa-sidebar {
  background: var(--wa-white);
  border-right: 1px solid var(--wa-border);
  display: flex;
  flex-direction: column;
  height: 100%;   /* 🔥 THIS IS THE FIX */
  overflow: hidden;
}
        .wa-search-box {
            padding: 16px;
            border-bottom: 1px solid var(--wa-border);
            position: relative;
            color: var(--wa-text-sub);
        }
        .wa-search-box svg { position: absolute; left: 24px; top: 26px; }
        .wa-search-box input {
            width: 100%; padding: 8px 12px 8px 36px;
            border-radius: 6px; border: 1px solid var(--wa-border); background: var(--wa-bg);
            outline: none;
        }
        
        .wa-list-item {
            padding: 16px; border-bottom: 1px solid var(--wa-border); cursor: pointer; transition: background 0.1s;
        }
        .wa-list-item:hover { background: #f5f6f6; }
        .wa-list-item.active { background: #f0fdf4; border-left: 4px solid var(--wa-primary); }
        .wa-item-header { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
        .wa-status-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
        .status-success { background: #dcf8c6; color: #075e54; }
        .status-error { background: #ffebee; color: #c62828; }
        .status-warning { background: #fff3e0; color: #ef6c00; }
        .status-neutral { background: #eceff1; color: #455a64; }
        .wa-item-meta { font-size: 11px; color: var(--wa-text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .wa-item-body-preview { font-size: 13px; color: var(--wa-text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; }
        .wa-item-actions { display: flex; gap: 8px; }
        .wa-item-actions button {
            background: none; border: 1px solid var(--wa-border); border-radius: 4px; padding: 4px; cursor: pointer; color: var(--wa-text-sub);
        }
        .wa-item-actions button:hover { background: var(--wa-bg); color: var(--wa-primary); }
        .wa-item-actions button.danger:hover { color: var(--wa-danger); border-color: var(--wa-danger); }

        /* Main Editor Area */
        .wa-editor-area {
            background: var(--wa-bg);
            overflow-y: auto;
            padding: 24px;
        }
        .wa-editor-grid {
            display: grid;
            grid-template-columns: minmax(400px, 1fr) 340px;
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Form Panel */
        .wa-form-panel {
            background: var(--wa-white);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--wa-border);
        }
        .wa-panel-header {
            padding: 20px; border-bottom: 1px solid var(--wa-border); display: flex; justify-content: space-between; align-items: center;
        }
        .wa-panel-header h2 { margin: 0; font-size: 18px; }
        .wa-actions-group { display: flex; gap: 10px; }
        .wa-form-content { padding: 24px; }
        
        /* Form Controls */
        .wa-field-group { margin-bottom: 20px; }
        label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: var(--wa-text-main); }
        input[type=text], select, textarea {
            width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
            font-size: 14px; font-family: inherit; transition: border 0.2s;
        }
        input:focus, select:focus, textarea:focus { outline: none; border-color: var(--wa-primary); ring: 2px solid #e7f5f2; }
        small { font-size: 12px; color: var(--wa-text-sub); margin-top: 4px; display: block; }
        .wa-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .wa-divider { margin: 24px 0; border: 0; border-top: 1px solid var(--wa-border); }
        
        /* Textarea with tools */
        .wa-textarea-wrapper { border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; transition: border 0.2s; }
        .wa-textarea-wrapper:focus-within { border-color: var(--wa-primary); }
        .wa-textarea-wrapper textarea { border: none; resize: vertical; min-height: 120px; border-radius: 0; }
        .wa-textarea-wrapper textarea:focus { ring: none; }
        .wa-toolbar { background: #f8fafc; padding: 8px 12px; border-top: 1px solid var(--wa-border); display: flex; justify-content: space-between; align-items: center; }
        .wa-chip-btn { background: #e2e8f0; border: none; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; }
        .wa-chip-btn:hover { background: #cbd5e1; }
        .wa-toolbar-help { font-size: 12px; color: #94a3b8; }
        .label-row { display: flex; justify-content: space-between; }
        .char-count { font-size: 12px; color: #94a3b8; }
        .char-count.error { color: var(--wa-danger); }

        /* Dynamic Inputs */
        .wa-input-with-select { display: flex; gap: 0; }
        .wa-input-with-select .prefix-select { width: 110px; border-top-right-radius: 0; border-bottom-right-radius: 0; background: #f8fafc; }
        .wa-input-with-select input { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 0; }
        .wa-file-upload-wrapper { flex: 1; border: 1px solid #cbd5e1; border-left: 0; border-radius: 0 6px 6px 0; display: flex; align-items: center; padding: 0 10px; }
        .wa-btn-upload { border: none; background: none; color: var(--wa-primary); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; }
        .file-status { font-size: 12px; margin-left: 10px; color: green; }

        /* Buttons List */
        .wa-button-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: flex-start; }
        .wa-button-inputs { display: grid; grid-template-columns: 120px 1fr 1fr; gap: 8px; flex: 1; }
        .wa-icon-btn { width: 36px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--wa-border); background: white; border-radius: 6px; cursor: pointer; }
        .wa-icon-btn.danger { color: var(--wa-danger); border-color: #fee2e2; background: #fef2f2; }

        /* Preview Panel */
        .wa-preview-panel { padding-top: 60px; }
        .wa-sticky-preview { position: sticky; top: 20px; }
        .wa-sticky-preview h3 { font-size: 14px; text-transform: uppercase; color: var(--wa-text-sub); letter-spacing: 0.5px; margin-bottom: 12px; }
        .wa-phone-mockup {
            background-color: #efe7dd;
            background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
            background-blend-mode: overlay;
            border-radius: 16px;
            padding: 20px 16px; /* slightly more padding */
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 8px solid #111b21;
            min-height: 400px;
        }
        .wa-message-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
            max-width: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        /* The Little Tail on the top left */
        .wa-message-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: -8px;
            width: 0;
            height: 0;
            border: 8px solid transparent;
            border-top-color: #fff;
            border-right: 0;
            transform: skew(15deg);
        }
        .msg-header-text { font-weight: bold; font-size: 15px; padding: 6px 8px; color: black; }
        .msg-header-media { margin-bottom: 4px; border-radius: 6px; overflow: hidden; }
        .msg-header-media img { object-fit: cover; }

        .media-placeholder { 
            background: #e9edef; height: 140px; display: flex; align-items: center; justify-content: center; 
            color: #54656f; font-size: 12px; font-weight: 500;
        }
        .media-placeholder.filled { background: #dcf8c6; color: #075e54; }

        .msg-content { 
            font-size: 14px; line-height: 20px; color: #111b21; 
            white-space: pre-wrap; padding: 6px 8px; 
        }
        .msg-var { font-weight: bold; color: var(--wa-text-sub); }

        .msg-footer { font-size: 11px; color: #54656f; margin-top: 4px; padding: 0 8px; }
        .msg-meta { font-size: 11px; color: #54656f; text-align: right; margin-top: 2px; padding: 4px 8px; }

        /* Buttons Section */
        .wa-message-actions {
            border-top: 1px solid #e9edef; /* The separator line */
            display: flex;
            flex-direction: column;
        }

        .msg-action-btn {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #007aff; /* Standard iOS/WhatsApp Action Blue */
            font-size: 14px;
            font-weight: 500;
            cursor: default;
            border-bottom: 1px solid #e9edef;
            gap: 8px;
        }

        /* Remove border from last button */
        .msg-action-btn:last-child {
            border-bottom: none;
        }

        .btn-icon { font-size: 12px; }
        .preview-note { margin-top: 12px; font-size: 11px; text-align: center; color: var(--wa-text-sub); }

        /* Empty States */
        .wa-empty-selection {
            display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: var(--wa-text-sub);
        }
        .wa-empty-selection .illustration { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .wa-empty-selection h2 { color: var(--wa-text-main); margin-bottom: 8px; }
        .wa-empty-state { padding: 32px; text-align: center; color: var(--wa-text-sub); }

        @media (max-width: 900px) {
            .wa-layout { grid-template-columns: 1fr; }
            .wa-sidebar { height: 300px; border-bottom: 1px solid var(--wa-border); border-right: none; }
            .wa-editor-grid { grid-template-columns: 1fr; }
            .wa-preview-panel { padding-top: 0; }
            .wa-sticky-preview { position: static; }
        }
            /* WhatsApp draft list background */
.wa-list-container {
  flex: 1;                   /* fills left column */
  background: #efeae2;
  padding: 12px;
  overflow-y: auto;        /* FORCE scrollbar */
  overflow-x: hidden;
}

/* Chat bubble */
.wa-chat-bubble {
  background: #dcf8c6;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  max-width: 92%;
  box-shadow: 0 1px 1px rgba(0,0,0,0.08);
  cursor: pointer;
  position: relative;
}

.wa-chat-bubble.active {
  outline: 2px solid var(--wa-primary);
}

/* Header */
.wa-chat-header {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #075e54;
}

.wa-chat-label {
  font-weight: 500;
  color: #667781;
}

/* Body */
.wa-chat-body {
  font-size: 14px;
  line-height: 1.4;
  color: #111b21;
  white-space: pre-wrap;
}

.wa-draft-header-preview {
  font-size: 16px;
  font-weight: 600;
  color: #111b21;
  margin-bottom: 4px;
}

.wa-draft-media-preview {
  font-size: 12px;
  color: #075e54;
  background: rgba(0, 128, 105, 0.1);
  padding: 4px 6px;
  border-radius: 4px;
  margin-bottom: 6px;
  width: fit-content;
}

/* Footer */
.wa-chat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  color: #667781;
}

.wa-chat-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
/* Actions */
.wa-chat-actions {
  display: flex;
  gap: 6px;
}

.wa-chat-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #54656f;
}

.wa-chat-actions button:hover {
  color: var(--wa-primary);
}
  .wa-draft-item {
  background: #fcf8f8;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #e9edef;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.wa-draft-item:hover {
  background: #f7f9fa;
}

.wa-draft-item.active {
  box-shadow: 0 0 0 2px var(--wa-primary);
}
  .wa-draft-meta {
  padding: 4px 6px 8px;
}

.wa-draft-title {
  font-size: 23px;
  font-weight: 600;
  color: #111b21;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wa-draft-sub {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #667781;
}

.wa-draft-lang {
  font-weight: 500;
}

.wa-draft-status-text {
  text-transform: capitalize;
}
  .wa-draft-item .wa-chat-bubble {
  margin: 0;
}
  /* Header field sizing fix */
.wa-header-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.wa-header-type {
  width: 150px;
  height: 44px;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
}

.wa-header-input {
  flex: 1;
  min-height: 56px;
  max-height: 80px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  resize: vertical;
}
  /* File upload same size as header text box */
.wa-header-file-box {
  flex: 1;
  min-height: 56px;
  max-height: 80px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 14px;
  color: #475569;

  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
}

.wa-header-file-box:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}
.doc-preview {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

  /* Thumbnail wrapper */
.wa-thumb-wrapper {
  position: relative;
}

/* Hover preview */
.wa-thumb-hover {
  position: absolute;
  left: 110%;
  top: 0;
  z-index: 50;
  display: none;
  background: white;
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.wa-thumb-hover img {
  width: 220px;
  border-radius: 8px;
}

/* Show on hover */
.wa-thumb-wrapper:hover .wa-thumb-hover {
  display: block;
}

/* Shared thumb */
.wa-draft-thumb {
  width: 100%;
  max-height: 120px;
  border-radius: 8px;
  object-fit: cover;
  background: #e9edef;
  margin-bottom: 6px;
}

/* Document badge */
.wa-draft-thumb.document {
  height: auto;
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #075e54;
  text-align: center;
}
/* Document preview */
.doc-preview {
  min-width: 220px;
}

.doc-preview-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #075e54;
}

.doc-icon {
  font-size: 26px;
}

.doc-name {
  word-break: break-all;
}

      `}</style>
    </div>
  );
}