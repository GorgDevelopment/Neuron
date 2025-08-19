import React from 'react';

function NavSidebar({ collapsed, active, onSelect, onToggle }) {
  const items = [
    { key: 'notes', label: 'Notes', icon: '🗒️' },
    { key: 'documents', label: 'Documents', icon: '📁' },
    { key: 'contacts', label: 'Contacts', icon: '👤' },
    { key: 'finance', label: 'Finance', icon: '💹' },
    { key: 'synapses', label: 'Synapses', icon: '🧠' },
  ];

  return (
    <div className={`nav-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="nav-top">
        <div className="app-brand" title="Neuron">
          <span className="brand-icon">🧠</span>
          {!collapsed && <span className="brand-text">Neuron</span>}
        </div>
        <div className="nav-items">
          {items.map(item => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => onSelect(item.key)}
              title={item.label}
            >
              <span className="nav-icon" aria-hidden>{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="nav-bottom">
        <button className="nav-item secondary" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          <span className="nav-icon" aria-hidden>{collapsed ? '➡️' : '⬅️'}</span>
          {!collapsed && <span className="nav-label">{collapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
      </div>
    </div>
  );
}

export default NavSidebar;
