import React, { useState, useRef, useEffect } from 'react';
import PreviewCard from './PreviewCard.jsx';

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
  status: 'draft'
};

function TemplateEditor({ initial = null, onCancel = ()=>{}, onSaved = ()=>{} }){
  const [form, setForm] = useState(initial || emptyTemplate);
  const [uploading, setUploading] = useState(false);
  const [charCount, setCharCount] = useState((initial && initial.body ? initial.body.length : 0));
  const fileRef = useRef(null);

  useEffect(()=>{ setForm(initial || emptyTemplate); setCharCount((initial && initial.body) ? initial.body.length : 0); }, [initial]);

  function updateField(k, v){ setForm(prev => ({ ...prev, [k]: v })); }

  function addPlaceholder(){
    const next = (form.placeholders.length + 1).toString();
    updateField('body', (form.body || '') + ` {{${next}}}`);
    updateField('placeholders', [...(form.placeholders||[]), `{{${next}}}`]);
  }

  function addButton(){ updateField('buttons', [...(form.buttons||[]), { type: 'url', text: '', payload: '' }]); }
  function updateButton(i, key, value){ const b = [...form.buttons]; b[i] = { ...b[i], [key]: value }; updateField('buttons', b); }
  function removeButton(i){ const b = form.buttons.filter((_, idx)=>idx!==i); updateField('buttons', b); }

  async function handleUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try{
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const js = await res.json();
      updateField('headerMediaUrl', js.url);
      updateField('headerType', file.type.startsWith('image/') ? 'Image' : (file.type.startsWith('video/') ? 'Video' : 'Document'));
    }catch(err){ console.error(err); window.alert('Upload failed'); }
    finally{ setUploading(false); }
  }

  function validateTemplate(t){
    if(!t.name) return 'Template name required.';
    if(!t.body) return 'Body cannot be empty.';
    if(t.body.length > 1024) return 'Body exceeds 1024 characters.';
    if(t.footer && t.footer.length > 60) return 'Footer exceeds 60 characters.';
    if(t.headerType === 'Text' && t.headerText && t.headerText.length>60) return 'Header text length must be <= 60.';
    if(t.buttons && t.buttons.length > 10) return 'Up to 10 buttons allowed.';
    for(const b of (t.buttons||[])){ if(!b.text) return 'Each button needs text.' }
    return null;
  }

  async function handleSave(e){
    e && e.preventDefault();
    const err = validateTemplate(form);
    if(err){ window.alert(err); return; }
    try{
      const method = form.id ? 'PUT' : 'POST';
      const endpoint = form.id ? `/api/templates?id=${form.id}` : '/api/templates';
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const js = await res.json();
      window.alert(js.message || 'Saved');
      onSaved(js.template || null);
    }catch(err){ console.error(err); window.alert('Save failed'); }
  }

  return (
    <form className="editor" onSubmit={handleSave}>
      <h2>{form.id ? 'Edit' : 'Create'} Template</h2>

      <div className="form-grid">
        <label>
          Template Name
          <input value={form.name} onChange={e=>updateField('name', e.target.value)} placeholder="Short name for internal use" />
        </label>

        <label>
          Category
          <select value={form.category} onChange={e=>updateField('category', e.target.value)}>
            <option>Utility</option>
            <option>Marketing</option>
            <option>Authentication</option>
            <option>Transactional</option>
          </select>
        </label>

        <label>
          Language
          <select value={form.language} onChange={e=>updateField('language', e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>

      <fieldset className="header-field">
        <legend>Header</legend>
        <label>
          Header Type
          <select value={form.headerType} onChange={e=>updateField('headerType', e.target.value)}>
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
            <input value={form.headerText} onChange={e=>updateField('headerText', e.target.value)} placeholder="Short header (≤60 chars)" />
          </label>
        ) : (
          <label>
            Upload Media
            <input ref={fileRef} type="file" onChange={handleUpload} />
            {uploading && <em>Uploading...</em>}
            {form.headerMediaUrl && <div className="media-preview">Preview: <a href={form.headerMediaUrl} target="_blank" rel="noreferrer">{form.headerMediaUrl}</a></div>}
          </label>
        )}
      </fieldset>

      <label>
        Body
        <textarea value={form.body} onChange={e=>{ updateField('body', e.target.value); setCharCount(e.target.value.length); }} rows={6} placeholder="Write the message body (use placeholders like {{1}})"></textarea>
        <div className="body-tools">
          <button type="button" onClick={addPlaceholder}>Insert Placeholder</button>
          <small>{charCount}/1024 chars</small>
        </div>
      </label>

      <label>
        Footer
        <input value={form.footer} onChange={e=>updateField('footer', e.target.value)} placeholder="Optional footer (≤60 chars)" />
      </label>

      <fieldset>
        <legend>Buttons (optional)</legend>
        <div className="buttons-area">
          {form.buttons.map((b, i) => (
            <div className="btn-row" key={i}>
              <select value={b.type} onChange={e=>updateButton(i, 'type', e.target.value)}>
                <option value="url">URL</option>
                <option value="call">Call</option>
                <option value="quick_reply">Quick Reply</option>
                <option value="copy">Copy</option>
              </select>
              <input placeholder="Button text" value={b.text} onChange={e=>updateButton(i, 'text', e.target.value)} />
              <input placeholder="Payload / URL / Number" value={b.payload} onChange={e=>updateButton(i, 'payload', e.target.value)} />
              <button type="button" onClick={()=>removeButton(i)}>Remove</button>
            </div>
          ))}
          <div className="btn-add"><button type="button" onClick={addButton}>Add Button</button></div>
        </div>
      </fieldset>

      <div className="editor-actions">
        <button className="btn primary" type="submit">Save Template</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>

      <PreviewCard template={form} />

      <style>{`
        .form-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px }
        label{ display:block; font-size:13px; color:#0f1724 }
        input, select, textarea{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e6eef6; margin-top:6px; background:#fff }
        .header-field{ padding:12px; border-radius:10px; background:linear-gradient(180deg,#fbfdff,#ffffff); border:1px dashed #edf2f7 }
        .body-tools{ display:flex; justify-content:space-between; align-items:center; margin-top:8px }
        .body-tools button{ background:transparent; border:1px dashed #dbeafe; color:var(--accent); padding:6px 8px; border-radius:8px }
        .buttons-area .btn-row{ display:flex; gap:8px; margin-bottom:8px }
        .editor-actions{ display:flex; gap:8px; margin-top:14px }
      `}</style>
    </form>
  );
}

export default TemplateEditor;