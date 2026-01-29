// src/pages/client/templates.jsx
import React, { useEffect, useState, useRef } from 'react';

// set backend origin here.
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

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
    name: '',
    category: 'Utility',
    language: 'en',
    templateType: 'Custom',
    headerType: 'Text',
    headerText: '',
    headerMediaUrl: '',
    body: '',
    footer: '',
    buttons: [],
    placeholders: [],
    status: 'draft',
  };

  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyTemplate);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCharCount((form.body || '').length);
  }, [form.body]);

  async function fetchTemplates() {
    try {
      const res = await fetch(`${API_BASE}/api/templates`);
      if (!res.ok) {
        console.error('Templates API returned', res.status);
        setTemplates([]);
        return;
      }
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchTemplates error', err);
      setTemplates([]);
    }
  }

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addPlaceholder() {
    const next = (form.placeholders?.length || 0) + 1;
    updateField('body', (form.body || '') + ` {{${next}}}`);
    updateField('placeholders', [...(form.placeholders || []), `{{${next}}}`]);
  }

  function addButton() {
    updateField('buttons', [...(form.buttons || []), { type: 'url', text: '', payload: '' }]);
  }

  function updateButton(i, key, value) {
    const b = [...(form.buttons || [])];
    b[i] = { ...b[i], [key]: value };
    updateField('buttons', b);
  }

  function removeButton(i) {
    const b = (form.buttons || []).filter((_, idx) => idx !== i);
    updateField('buttons', b);
  }

    async function handleUpload(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // 1. Create a Fake Local URL immediately so the preview works
        const localUrl = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'Document';

        // 2. Set state immediately (This makes the image appear)
        setForm(prev => ({
        ...prev,
        headerMediaUrl: localUrl,
        headerType: type
        }));

        // 3. Try to upload to backend (Silent fail if backend is 404)
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
        const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd });
        if (res.ok) {
            const js = await res.json();
            // If upload succeeds, swap local URL for the real server URL
            updateField('headerMediaUrl', js.url); 
        } else {
            console.warn("Backend upload failed (404). Keeping local preview.");
        }
        } catch (err) {
        console.error("Network error during upload.", err);
        } finally {
        setUploading(false);
        }
    }

  function validateTemplate(t) {
    if (!t.name) return 'Template name required.';
    if (!t.body) return 'Body cannot be empty.';
    if ((t.body || '').length > 1024) return 'Body exceeds 1024 characters.';
    if (t.footer && t.footer.length > 60) return 'Footer exceeds 60 characters.';
    if (t.headerType === 'Text' && t.headerText && t.headerText.length > 60) return 'Header text length must be <= 60.';
    if (t.buttons && t.buttons.length > 10) return 'Up to 10 buttons allowed.';
    for (const b of (t.buttons || [])) {
      if (!b.text) return 'Each button needs text.';
    }
    return null;
  }

  async function saveTemplate(e) {
    e && e.preventDefault();
    const err = validateTemplate(form);
    if (err) {
      window.alert(err);
      return;
    }
    try {
      const method = form.id ? 'PUT' : 'POST';
      const endpoint = form.id ? `${API_BASE}/api/templates?id=${encodeURIComponent(form.id)}` : `${API_BASE}/api/templates`;
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('saveTemplate failed', res.status, txt);
        window.alert('Save failed: ' + res.status);
        return;
      }
      const data = await res.json();
      window.alert(data.message || 'Saved');
      setForm(emptyTemplate);
      setEditing(false);
      await fetchTemplates();
    } catch (err) {
      console.error('saveTemplate error', err);
      window.alert('Save failed');
    }
  }

  function startEdit(template) {
    setForm({
      ...emptyTemplate,
      ...template,
      buttons: template.buttons || [],
      placeholders: template.placeholders || [],
    });
    setEditing(true);
  }

  async function deleteTemplate(id) {
    if (!window.confirm('Delete template?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/templates?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        window.alert('Delete failed: ' + res.status);
        return;
      }
      const js = await res.json();
      window.alert(js.message || 'Deleted');
      await fetchTemplates();
    } catch (err) {
      console.error('deleteTemplate error', err);
      window.alert('Delete failed');
    }
  }

  async function submitForApproval(id) {
    try {
      const res = await fetch(`${API_BASE}/api/submit?id=${encodeURIComponent(id)}`, { method: 'POST' });
      if (!res.ok) {
        window.alert('Submit failed: ' + res.status);
        return;
      }
      const js = await res.json();
      window.alert(js.message || 'Submitted for approval');
      await fetchTemplates();
    } catch (err) {
      console.error('submitForApproval error', err);
      window.alert('Submit failed');
    }
  }

  // Helper to format date if needed, or just display status nicely
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-success';
      case 'rejected': return 'status-error';
      case 'submitted': return 'status-warning';
      default: return 'status-neutral';
    }
  };

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
            {templates.length === 0 && <div className="wa-empty-state">No templates found.</div>}
            {templates.map(t => (
              <div 
                className={`wa-list-item ${form.id === t.id ? 'active' : ''}`} 
                key={t.id} 
                onClick={() => startEdit(t)}
              >
                <div className="wa-item-header">
                  <strong>{t.name || 'Untitled Template'}</strong>
                  <span className={`wa-status-badge ${getStatusColor(t.status)}`}>{t.status}</span>
                </div>
                <div className="wa-item-meta">
                  {t.category} • {t.language.toUpperCase()}
                </div>
                <div className="wa-item-body-preview">
                  {(t.body ?? '').substring(0, 60)}{(t.body ?? '').length > 60 ? '...' : ''}
                </div>
                <div className="wa-item-actions">
                  <button title="Edit" onClick={(e) => {e.stopPropagation(); startEdit(t);}}>
                    <Icons.Edit />
                  </button>
                  <button title="Submit" onClick={(e) => {e.stopPropagation(); submitForApproval(t.id);}}>
                    <Icons.Send />
                  </button>
                  <button title="Delete" className="danger" onClick={(e) => {e.stopPropagation(); deleteTemplate(t.id);}}>
                    <Icons.Trash />
                  </button>
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
                    <button type="submit" className="wa-btn wa-btn-primary">Save & Submit</button>
                  </div>
                </div>

                <div className="wa-form-content">
                  <div className="wa-field-group">
                    <label>Template Name</label>
                    <input 
                      type="text" 
                      value={form.name ?? ''} 
                      onChange={e => updateField('name', e.target.value)} 
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
                      <select value={form.templateType ?? 'Custom'} onChange={e => updateField('templateType', e.target.value)}>
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
                    <div className="wa-input-with-select">
                      <select className="prefix-select" value={form.headerType ?? 'Text'} onChange={e => updateField('headerType', e.target.value)}>
                        <option>Text</option>
                        <option>Image</option>
                        <option>Video</option>
                        <option>Document</option>
                      </select>
                      {form.headerType === 'Text' ? (
                        <input 
                          value={form.headerText ?? ''} 
                          onChange={e => updateField('headerText', e.target.value)} 
                          placeholder="Header text..." 
                        />
                      ) : (
                        <div className="wa-file-upload-wrapper">
                           <button type="button" className="wa-btn-upload" onClick={() => fileRef.current.click()}>
                             <Icons.Upload /> {uploading ? 'Uploading...' : 'Choose File'}
                           </button>
                           <input ref={fileRef} type="file" onChange={handleUpload} style={{display:'none'}} />
                           {form.headerMediaUrl && <span className="file-status">File uploaded</span>}
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
                        value={form.body ?? ''}
                        onChange={e => updateField('body', e.target.value)}
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
                    <input value={form.footer ?? ''} onChange={e => updateField('footer', e.target.value)} placeholder="e.g. Reply STOP to unsubscribe" />
                  </div>

                  <div className="wa-field-group">
                    <label>Buttons</label>
                    <div className="wa-buttons-list">
                      {(form.buttons || []).map((b, i) => (
                        <div className="wa-button-row" key={i}>
                          <div className="wa-button-inputs">
                            <select value={b.type ?? 'url'} onChange={e => updateButton(i, 'type', e.target.value)}>
                                <option value="url">Visit Website</option>
                                <option value="call">Call Number</option>
                                <option value="quick_reply">Quick Reply</option>
                                <option value="copy">Copy Code</option>
                            </select>
                            <input placeholder="Label" value={b.text ?? ''} onChange={e => updateButton(i, 'text', e.target.value)} />
                            <input placeholder={b.type === 'url' ? 'https://...' : 'Action payload/number'} value={b.payload ?? ''} onChange={e => updateButton(i, 'payload', e.target.value)} />
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
                            {form.headerType === 'Text' && form.headerText && (
                                <div className="msg-header-text">{form.headerText}</div>
                            )}
                            {form.headerType !== 'Text' && (
                                <div className="msg-header-media">
                                {form.headerMediaUrl ? (
                                    form.headerType === 'Image' ? (
                                    <img src={form.headerMediaUrl} alt="Header" style={{width:'100%', display:'block'}} />
                                    ) : (
                                    <div className="media-placeholder filled">{form.headerType} Attached</div>
                                    )
                                ) : (
                                    <div className="media-placeholder">No Media</div>
                                )}
                                </div>
                            )}

                            {/* Body Text */}
                            <div className="msg-content">
                                {(form.body || 'Your message text will appear here...').split(/(\{\{\d+\}\})/g).map((part, i) =>
                                part.match(/\{\{\d+\}\}/) ? <span className="msg-var" key={i}>{part}</span> : <span key={i}>{part}</span>
                                )}
                            </div>

                            {/* Footer */}
                            {form.footer && <div className="msg-footer">{form.footer}</div>}
                            
                            {/* Timestamp */}
                            <div className="msg-meta">12:00 PM</div>
                            </div>

                            {/* 2. Attached Buttons (Inside the same card) */}
                            {(form.buttons || []).length > 0 && (
                            <div className="wa-message-actions">
                                {(form.buttons || []).map((b, i) => (
                                <div key={i} className="msg-action-btn">
                                    {b.type === 'url' && <span className="btn-icon">↗</span>}
                                    {b.type === 'call' && <span className="btn-icon">📞</span>}
                                    {b.type === 'copy' && <span className="btn-icon">📋</span>}
                                    {b.text || 'Button'}
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
        .wa-list-container { flex: 1; overflow-y: auto; }
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
      `}</style>
    </div>
  );
}