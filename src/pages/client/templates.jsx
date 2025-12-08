// src/pages/client/templates.jsx
import React, { useEffect, useState, useRef } from 'react';

// set backend origin here. If using env var in React:
// (create a .env.local: REACT_APP_API_BASE=http://localhost:3000)
// const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

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
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd });
      if (!res.ok) {
        window.alert('Upload failed: ' + res.status);
        return;
      }
      const js = await res.json();
      updateField('headerMediaUrl', js.url || '');
      updateField('headerType', file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'Document');
    } catch (err) {
      console.error('upload error', err);
      window.alert('Upload failed');
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
      // ensure arrays exist to keep inputs controlled
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

  return (
    <div className="page-root">
      <header className="topbar">
        <h1>Message Templates</h1>
        <div className="actions">
          <button className="btn primary" onClick={() => { setForm(emptyTemplate); setEditing(true); }}>
            + New Template
          </button>
        </div>
      </header>

      <main className="main">
        <aside className="left">
          <div className="search">
            <input placeholder="Search templates..." onChange={() => { /* implement search if needed */ }} />
          </div>

          <div className="list">
            {templates.length === 0 && <div className="empty">No templates yet — click "New Template"</div>}
            {templates.map(t => (
              <div className="tpl-card" key={t.id}>
                <div className="tpl-info">
                  <strong>{t.name ?? '(no name)'}</strong>
                  <div className="meta">{t.category} · {t.templateType} · {t.language} · <span className={`status ${t.status}`}>{t.status}</span></div>
                  <div className="preview-small">{(t.body ?? '').substring(0, 120)}{(t.body ?? '').length > 120 ? '...' : ''}</div>
                </div>
                <div className="tpl-actions">
                  <button onClick={() => startEdit(t)}>Edit</button>
                  <button onClick={() => submitForApproval(t.id)}>Submit</button>
                  <button onClick={() => deleteTemplate(t.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="right">
          {editing ? (
            <form className="editor" onSubmit={saveTemplate}>
              <h2>{form.id ? 'Edit' : 'Create'} Template</h2>

              <label>
                Template Name
                <input value={form.name ?? ''} onChange={e => updateField('name', e.target.value)} placeholder="Short name for internal use" />
              </label>

              <div className="row">
                <label>
                  Category
                  <select value={form.category ?? 'Utility'} onChange={e => updateField('category', e.target.value)}>
                    <option>Utility</option>
                    <option>Marketing</option>
                    <option>Authentication</option>
                    <option>Transactional</option>
                  </select>
                </label>

                <label>
                  Language
                  <select value={form.language ?? 'en'} onChange={e => updateField('language', e.target.value)}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </label>

                <label>
                  Template Type
                  <select value={form.templateType ?? 'Custom'} onChange={e => updateField('templateType', e.target.value)}>
                    <option>Custom</option>
                    <option>Product-Catalog</option>
                    <option>Limited-Time-Offer</option>
                    <option>Carousel</option>
                  </select>
                </label>
              </div>

              <fieldset className="header-field">
                <legend>Header</legend>

                <label>
                  Header Type
                  <select value={form.headerType ?? 'Text'} onChange={e => updateField('headerType', e.target.value)}>
                    <option>Text</option>
                    <option>Image</option>
                    <option>Video</option>
                    <option>Document</option>
                    <option>Carousel</option>
                  </select>
                </label>

                {form.headerType === 'Text' ? (
                  <label>
                    Header Text
                    <input value={form.headerText ?? ''} onChange={e => updateField('headerText', e.target.value)} placeholder="Short header (≤60 chars)" />
                  </label>
                ) : (
                  <label>
                    Upload Media
                    <input ref={fileRef} type="file" onChange={handleUpload} />
                    {uploading && <em>Uploading...</em>}
                    {form.headerMediaUrl && (
                      <div className="media-preview">Preview: <a href={form.headerMediaUrl} target="_blank" rel="noreferrer">{form.headerMediaUrl}</a></div>
                    )}
                  </label>
                )}
              </fieldset>

              <label>
                Body
                <textarea
                  value={form.body ?? ''}
                  onChange={e => updateField('body', e.target.value)}
                  rows={6}
                  placeholder="Write the message body (use placeholders like {{1}})"
                />
                <div className="body-tools">
                  <button type="button" onClick={addPlaceholder}>Insert Placeholder</button>
                  <small>{charCount}/1024 chars</small>
                </div>
              </label>

              <label>
                Footer
                <input value={form.footer ?? ''} onChange={e => updateField('footer', e.target.value)} placeholder="Optional footer (≤60 chars)" />
              </label>

              <fieldset>
                <legend>Buttons (optional)</legend>
                <div className="buttons-area">
                  {(form.buttons || []).map((b, i) => (
                    <div className="btn-row" key={i}>
                      <select value={b.type ?? 'url'} onChange={e => updateButton(i, 'type', e.target.value)}>
                        <option value="url">URL</option>
                        <option value="call">Call</option>
                        <option value="quick_reply">Quick Reply</option>
                        <option value="copy">Copy</option>
                      </select>
                      <input placeholder="Button text" value={b.text ?? ''} onChange={e => updateButton(i, 'text', e.target.value)} />
                      <input placeholder="Payload / URL / Number" value={b.payload ?? ''} onChange={e => updateButton(i, 'payload', e.target.value)} />
                      <button type="button" onClick={() => removeButton(i)}>Remove</button>
                    </div>
                  ))}
                  <div className="btn-add">
                    <button type="button" onClick={addButton}>Add Button</button>
                  </div>
                </div>
              </fieldset>

              <div className="editor-actions">
                <button type="submit">Save Template</button>
                <button type="button" onClick={() => { setForm(emptyTemplate); setEditing(false); }}>Cancel</button>
              </div>

              <div className="preview">
                <h3>Preview</h3>
                <div className="preview-card">
                  {form.headerType === 'Text' && form.headerText && <div className="p-header">{form.headerText}</div>}
                  {form.headerMediaUrl && <div className="p-media">Media: <a href={form.headerMediaUrl} target="_blank" rel="noreferrer">Open</a></div>}
                  <div className="p-body">
                    {(form.body || '').split(/(\{\{\d+\}\})/g).map((part, i) =>
                      part.match(/\{\{\d+\}\}/) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </div>
                  {form.footer && <div className="p-footer">{form.footer}</div>}
                  {(form.buttons || []).length > 0 && (
                    <div className="p-buttons">
                      {(form.buttons || []).map((b, i) => <button key={i} className="p-btn">{b.text || 'Button'}</button>)}
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="idle">Select a template to edit or create a new one.</div>
          )}
        </section>
      </main>

      <style>{`
        :root{ --accent:#2563eb; --accent-2:#06b6d4; --muted:#94a3b8 }
        *{box-sizing:border-box}
        body, .page-root{ margin:0; padding:0; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
        .page-root{ background:linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding:24px; max-width:1200px; margin:0 auto }
        .topbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px }
        .topbar h1{ margin:0; font-size:20px; color:#0f1724 }
        .btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; border:0; cursor:pointer; font-weight:600 }
        .btn.primary{ background:linear-gradient(90deg,var(--accent),#3b82f6); color:#fff }
        .main{ display:grid; grid-template-columns:360px 1fr; gap:20px }
        .left{ background:#fff; padding:12px; border-radius:12px; box-shadow:0 6px 18px rgba(2,6,23,0.06); height:calc(100vh - 180px); overflow:auto }
        .search{ display:flex; gap:8px; margin-bottom:12px }
        .search input{ flex:1; padding:8px 10px; border-radius:8px; border:1px solid #e6eef6 }
        .tpl-card{ display:flex; justify-content:space-between; align-items:flex-start; padding:12px; border-radius:10px; background:linear-gradient(180deg,#ffffff,#fbfdff); margin-bottom:10px }
        .tpl-info strong{ display:block; font-size:15px; color:#0f1724 }
        .meta{ font-size:12px; color:var(--muted); margin-top:6px }
        .preview-small{ color:#475569; font-size:13px; margin-top:8px }
        .tpl-actions{ display:flex; gap:8px; align-items:center }
        .tpl-actions button{ padding:6px 8px; border-radius:8px; border:1px solid #e6eef6; background:transparent; cursor:pointer }

        .right{ background:linear-gradient(180deg,#ffffff,#fbfdff); padding:18px; border-radius:12px; box-shadow:0 6px 18px rgba(2,6,23,0.04); min-height:600px }
        .editor h2{ margin-top:0 }
        .form-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px }
        label{ display:block; font-size:13px; color:#0f1724 }
        input[type=text], input, select, textarea{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e6eef6; margin-top:6px; background:#fff }
        textarea{ min-height:120px; resize:vertical }
        .header-field{ padding:12px; border-radius:10px; background:linear-gradient(180deg,#fbfdff,#ffffff); border:1px dashed #edf2f7 }
        .body-tools{ display:flex; justify-content:space-between; align-items:center; margin-top:8px }
        .body-tools button{ background:transparent; border:1px dashed #dbeafe; color:var(--accent); padding:6px 8px; border-radius:8px }
        .buttons-area .btn-row{ display:flex; gap:8px; margin-bottom:8px }
        .btn-add button{ background:transparent; border:1px dashed #c7e0ff; padding:8px 10px; border-radius:8px; color:var(--accent) }
        .editor-actions{ display:flex; gap:8px; margin-top:14px }

        .preview{ margin-top:18px }
        .preview-card{ border-radius:12px; padding:14px; border:1px solid #eef2f7; background:linear-gradient(180deg,#ffffff,#f8fcff) }
        .p-header{ font-weight:700; margin-bottom:10px; color:#0f1724 }
        .p-body{ white-space:pre-wrap; color:#0b1220 }
        .p-footer{ margin-top:10px; color:#475569 }
        .p-buttons .p-btn{ margin-right:8px; padding:8px 10px; border-radius:10px; border:0; cursor:pointer; background:linear-gradient(90deg,var(--accent),var(--accent-2)); color:#fff }

        @media (max-width:900px){ .main{ grid-template-columns:1fr; } .left{ height:auto } }
      `}</style>
    </div>
  );
}
