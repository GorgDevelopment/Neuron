import React from 'react';

function NotesTopBar({ activeViewMode, onChangeView, currentTheme, onThemeChange }) {
  return (
    <div className="notes-topbar">
      <div className="left">
        <button className={`tb-btn ${activeViewMode === 'editor' ? 'active' : ''}`} onClick={() => onChangeView('editor')}>Editor</button>
        <button className={`tb-btn ${activeViewMode === 'graph' ? 'active' : ''}`} onClick={() => onChangeView('graph')}>Graph</button>
        <button className={`tb-btn ${activeViewMode === 'canvas' ? 'active' : ''}`} onClick={() => onChangeView('canvas')}>Canvas</button>
      </div>
      <div className="right">
        <select value={currentTheme} onChange={(e) => onThemeChange(e.target.value)} className="theme-dropdown">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="purple">Purple</option>
        </select>
      </div>
    </div>
  );
}

export default NotesTopBar;
