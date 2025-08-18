import React, { useState, useEffect } from 'react';

function PluginManager({ onClose }) {
  const [plugins, setPlugins] = useState([]);
  const [availablePlugins, setAvailablePlugins] = useState([
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Add a calendar widget to track daily notes',
      version: '1.0.0',
      author: 'Neuron Team',
      enabled: false,
      core: true
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Create kanban-style task boards',
      version: '1.2.0',
      author: 'Neuron Team',
      enabled: false,
      core: true
    },
    {
      id: 'mind-map',
      name: 'Mind Map',
      description: 'Create visual mind maps from your notes',
      version: '1.1.0',
      author: 'Community',
      enabled: false,
      core: false
    },
    {
      id: 'word-count',
      name: 'Word Count',
      description: 'Display word and character count in status bar',
      version: '1.0.1',
      author: 'Community',
      enabled: false,
      core: false
    },
    {
      id: 'templates',
      name: 'Templates',
      description: 'Create and use note templates',
      version: '2.0.0',
      author: 'Neuron Team',
      enabled: false,
      core: true
    },
    {
      id: 'daily-notes',
      name: 'Daily Notes',
      description: 'Automatically create and manage daily notes',
      version: '1.5.0',
      author: 'Neuron Team',
      enabled: false,
      core: true
    }
  ]);

  useEffect(() => {
    const savedPlugins = localStorage.getItem('neuron_plugins');
    if (savedPlugins) {
      const enabledPlugins = JSON.parse(savedPlugins);
      setAvailablePlugins(prev => 
        prev.map(plugin => ({
          ...plugin,
          enabled: enabledPlugins.includes(plugin.id)
        }))
      );
    }
  }, []);

  const togglePlugin = (pluginId) => {
    setAvailablePlugins(prev => {
      const updated = prev.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, enabled: !plugin.enabled }
          : plugin
      );
      
      const enabledPlugins = updated.filter(p => p.enabled).map(p => p.id);
      localStorage.setItem('neuron_plugins', JSON.stringify(enabledPlugins));
      
      return updated;
    });
  };

  const installPlugin = () => {
    const pluginUrl = prompt('Enter plugin URL or file path:');
    if (pluginUrl) {
      alert('Plugin installation will be available in future versions');
    }
  };

  const corePlugins = availablePlugins.filter(p => p.core);
  const communityPlugins = availablePlugins.filter(p => !p.core);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="plugin-manager" onClick={e => e.stopPropagation()}>
        <div className="plugin-header">
          <h2>Plugin Manager</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="plugin-content">
          <div className="plugin-section">
            <div className="section-header">
              <h3>Core Plugins</h3>
              <span className="plugin-count">({corePlugins.length})</span>
            </div>
            
            <div className="plugin-list">
              {corePlugins.map(plugin => (
                <div key={plugin.id} className="plugin-item">
                  <div className="plugin-info">
                    <div className="plugin-name">{plugin.name}</div>
                    <div className="plugin-description">{plugin.description}</div>
                    <div className="plugin-meta">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                    </div>
                  </div>
                  <div className="plugin-actions">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => togglePlugin(plugin.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="plugin-section">
            <div className="section-header">
              <h3>Community Plugins</h3>
              <span className="plugin-count">({communityPlugins.length})</span>
              <button className="install-btn" onClick={installPlugin}>
                Install Plugin
              </button>
            </div>
            
            <div className="plugin-list">
              {communityPlugins.map(plugin => (
                <div key={plugin.id} className="plugin-item">
                  <div className="plugin-info">
                    <div className="plugin-name">{plugin.name}</div>
                    <div className="plugin-description">{plugin.description}</div>
                    <div className="plugin-meta">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                    </div>
                  </div>
                  <div className="plugin-actions">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => togglePlugin(plugin.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PluginManager;
