import React from 'react';

function PreviewCard({ template }){
  if(!template) return null;
  return (
    <div className="preview">
      <h3>Preview</h3>
      <div className="preview-card">
        {template.headerType === 'Text' && template.headerText && <div className="p-header">{template.headerText}</div>}
        {template.headerMediaUrl && <div className="p-media">Media: <a href={template.headerMediaUrl} target="_blank" rel="noreferrer">Open</a></div>}
        <div className="p-body">{template.body && template.body.split(/(\{\{\d+\}\})/g).map((part,i)=> part.match(/\{\{\d+\}\}/) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>)}</div>
        {template.footer && <div className="p-footer">{template.footer}</div>}
        {template.buttons && template.buttons.length>0 && <div className="p-buttons">{template.buttons.map((b,i)=> <button key={i} className="p-btn">{b.text||'Button'}</button>)}</div>}
      </div>

      <style>{`
        .preview{ margin-top:18px }
        .preview-card{ border-radius:12px; padding:14px; border:1px solid #eef2f7; background:linear-gradient(180deg,#ffffff,#f8fcff) }
        .p-header{ font-weight:700; margin-bottom:10px }
        .p-body{ white-space:pre-wrap }
        .p-footer{ margin-top:10px; color:#475569 }
        .p-buttons .p-btn{ margin-right:8px; padding:8px 10px; border-radius:10px; border:0; cursor:pointer; background:linear-gradient(90deg,#2563eb,#06b6d4); color:#fff }
      `}</style>
    </div>
  );
};

export default PreviewCard;