import React from 'react';

function DocumentsManager({ vaultPath }) {
  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Documents</h2>
        <p className="muted">Store and manage files alongside your notes. (Coming soon)</p>
      </div>
      <div className="module-body empty-state">
        <p>Feature in progress. You will be able to attach PDFs, images, and files to notes, organize with folders and tags, and preview inline.</p>
      </div>
    </div>
  );
}

export default DocumentsManager;
