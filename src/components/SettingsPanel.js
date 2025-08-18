import React, { useState, useEffect } from 'react';

function SettingsPanel({ onClose, currentTheme, themes, onThemeChange }) {
  const [settings, setSettings] = useState({
    fontSize: 14,
    lineHeight: 1.6,
    autoSave: true,
    spellCheck: false,
    wordWrap: true,
    showLineNumbers: false,
    vimMode: false,
    darkMode: true,
    graphAnimations: true,
    backlinksCount: 10
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('neuron_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('neuron_settings', JSON.stringify(newSettings));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'neuron-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedSettings = JSON.parse(event.target.result);
            setSettings(importedSettings);
            localStorage.setItem('neuron_settings', JSON.stringify(importedSettings));
          } catch (error) {
            alert('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="settings-section">
            <h3>Appearance</h3>
            
            <div className="setting-item">
              <label>Theme</label>
              <select 
                value={currentTheme} 
                onChange={(e) => onThemeChange(e.target.value)}
                className="setting-select"
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Font Size</label>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="setting-slider"
              />
              <span className="setting-value">{settings.fontSize}px</span>
            </div>
            
            <div className="setting-item">
              <label>Line Height</label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="setting-slider"
              />
              <span className="setting-value">{settings.lineHeight}</span>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Editor</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSetting('autoSave', e.target.checked)}
                />
                Auto-save notes
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.spellCheck}
                  onChange={(e) => updateSetting('spellCheck', e.target.checked)}
                />
                Spell check
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => updateSetting('wordWrap', e.target.checked)}
                />
                Word wrap
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) => updateSetting('showLineNumbers', e.target.checked)}
                />
                Show line numbers
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.vimMode}
                  onChange={(e) => updateSetting('vimMode', e.target.checked)}
                />
                Vim mode
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Graph</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.graphAnimations}
                  onChange={(e) => updateSetting('graphAnimations', e.target.checked)}
                />
                Enable animations
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Data</h3>
            
            <div className="setting-item">
              <button className="setting-btn" onClick={exportSettings}>
                Export Settings
              </button>
              <button className="setting-btn" onClick={importSettings}>
                Import Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
