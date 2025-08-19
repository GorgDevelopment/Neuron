import React from 'react';

function ContactsManager() {
  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Contacts</h2>
        <p className="muted">Manage people, companies, and link them to notes. (Coming soon)</p>
      </div>
      <div className="module-body empty-state">
        <p>Feature in progress. Plan: properties (name, email, phone), tags, and backlinks to notes and documents.</p>
      </div>
    </div>
  );
}

export default ContactsManager;
