import React, { useState, useEffect } from 'react';
import { FadeIn, SlideIn } from './AnimatedTransitions';

function AccountSettings({ onClose }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
    preferences: {
      autoSync: true,
      notifications: true,
      analytics: false,
      betaFeatures: false
    }
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai_api_key') || '',
    claude: localStorage.getItem('claude_api_key') || '',
    gemini: localStorage.getItem('gemini_api_key') || ''
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'ai', name: 'AI Services', icon: '🤖' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'data', name: 'Data & Privacy', icon: '📊' }
  ];

  const saveProfile = () => {
    const updatedUser = { ...user, ...profile };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const saveApiKey = (service, key) => {
    localStorage.setItem(`${service}_api_key`, key);
    setApiKeys(prev => ({ ...prev, [service]: key }));
  };

  const exportUserData = () => {
    const userData = {
      profile,
      preferences: profile.preferences,
      apiKeys: Object.keys(apiKeys).reduce((acc, key) => {
        acc[key] = apiKeys[key] ? '***HIDDEN***' : '';
        return acc;
      }, {}),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neuron-user-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay">
      <FadeIn>
        <div className="account-settings">
          <div className="settings-header">
            <h2>Account Settings</h2>
            <button onClick={onClose} className="close-btn">×</button>
          </div>

          <div className="settings-content">
            <div className="settings-sidebar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-name">{tab.name}</span>
                </button>
              ))}
            </div>

            <div className="settings-main">
              {activeTab === 'profile' && (
                <SlideIn direction="right">
                  <div className="settings-section">
                    <h3>Profile Information</h3>
                    <div className="profile-avatar">
                      <div className="avatar-circle">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" />
                        ) : (
                          <span>{profile.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <button className="change-avatar-btn">Change Avatar</button>
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <button className="save-btn" onClick={saveProfile}>Save Changes</button>
                  </div>
                </SlideIn>
              )}

              {activeTab === 'preferences' && (
                <SlideIn direction="right">
                  <div className="settings-section">
                    <h3>App Preferences</h3>
                    <div className="preference-group">
                      <div className="preference-item">
                        <div className="preference-info">
                          <span className="preference-name">Auto-sync</span>
                          <span className="preference-desc">Automatically sync changes</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.preferences.autoSync}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, autoSync: e.target.checked }
                            }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <span className="preference-name">Notifications</span>
                          <span className="preference-desc">Show desktop notifications</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.preferences.notifications}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, notifications: e.target.checked }
                            }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <span className="preference-name">Analytics</span>
                          <span className="preference-desc">Help improve Neuron with usage data</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.preferences.analytics}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, analytics: e.target.checked }
                            }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <span className="preference-name">Beta Features</span>
                          <span className="preference-desc">Access experimental features</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profile.preferences.betaFeatures}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, betaFeatures: e.target.checked }
                            }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </SlideIn>
              )}

              {activeTab === 'ai' && (
                <SlideIn direction="right">
                  <div className="settings-section">
                    <h3>AI Service Configuration</h3>
                    <div className="ai-services">
                      <div className="service-item">
                        <div className="service-header">
                          <span className="service-name">🤖 OpenAI (GPT)</span>
                          <span className={`service-status ${apiKeys.openai ? 'connected' : 'disconnected'}`}>
                            {apiKeys.openai ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <input
                          type="password"
                          placeholder="sk-..."
                          value={apiKeys.openai}
                          onChange={(e) => saveApiKey('openai', e.target.value)}
                        />
                      </div>
                      <div className="service-item">
                        <div className="service-header">
                          <span className="service-name">🧠 Claude (Anthropic)</span>
                          <span className={`service-status ${apiKeys.claude ? 'connected' : 'disconnected'}`}>
                            {apiKeys.claude ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <input
                          type="password"
                          placeholder="sk-ant-..."
                          value={apiKeys.claude}
                          onChange={(e) => saveApiKey('claude', e.target.value)}
                        />
                      </div>
                      <div className="service-item">
                        <div className="service-header">
                          <span className="service-name">💎 Gemini (Google)</span>
                          <span className={`service-status ${apiKeys.gemini ? 'connected' : 'disconnected'}`}>
                            {apiKeys.gemini ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <input
                          type="password"
                          placeholder="AIza..."
                          value={apiKeys.gemini}
                          onChange={(e) => saveApiKey('gemini', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </SlideIn>
              )}

              {activeTab === 'security' && (
                <SlideIn direction="right">
                  <div className="settings-section">
                    <h3>Security & Privacy</h3>
                    <div className="security-options">
                      <button className="security-btn">🔑 Change Password</button>
                      <button className="security-btn">📱 Two-Factor Authentication</button>
                      <button className="security-btn">🔐 Encrypt Local Vault</button>
                      <button className="security-btn">📋 View Login Sessions</button>
                    </div>
                  </div>
                </SlideIn>
              )}

              {activeTab === 'data' && (
                <SlideIn direction="right">
                  <div className="settings-section">
                    <h3>Data Management</h3>
                    <div className="data-actions">
                      <button className="data-btn" onClick={exportUserData}>
                        📤 Export Account Data
                      </button>
                      <button className="data-btn danger">
                        🗑️ Delete Account
                      </button>
                    </div>
                  </div>
                </SlideIn>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

export default AccountSettings;
