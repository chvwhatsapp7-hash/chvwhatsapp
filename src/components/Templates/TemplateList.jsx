import React from 'react';

function TemplateList({ templates = [], onEdit = ()=>{}, onDelete = ()=>{}, onSubmit = ()=>{} }){
  return (
    <div>
      {templates.length === 0 && <div className="empty">No templates yet</div>}
      {templates.map(t => (
        <div className="tpl-card" key={t.id}>
          <div className="tpl-info">
            <strong>{t.name || '(no name)'}</strong>
            <div className="meta">{t.category} · {t.templateType} · {t.language} · <span className={`status ${t.status}`}>{t.status}</span></div>
            <div className="preview-small">{(t.body||'').substring(0,120)}{(t.body||'').length>120? '...' : ''}</div>
          </div>
          <div className="tpl-actions">
            <button onClick={()=>onEdit(t)} className="btn">Edit</button>
            <button onClick={()=>onSubmit(t.id)} className="btn">Submit</button>
            <button onClick={()=>onDelete(t.id)} className="btn">Delete</button>
          </div>
        </div>
      ))}

      <style>{`
        .tpl-card{ display:flex; justify-content:space-between; align-items:flex-start; padding:12px; border-radius:10px; background:linear-gradient(180deg,#ffffff,#fbfdff); margin-bottom:10px }
        .tpl-info strong{ display:block; font-size:15px }
        .meta{ font-size:12px; color:#94a3b8; margin-top:6px }
        .preview-small{ color:#475569; font-size:13px; margin-top:8px }
        .tpl-actions{ display:flex; gap:8px }
        .tpl-actions .btn{ padding:6px 8px; border-radius:8px; border:1px solid #e6eef6; background:transparent; cursor:pointer }
      `}</style>
    </div>
  );
};

export default TemplateList;