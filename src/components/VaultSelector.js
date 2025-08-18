import React, { useState } from 'react';
import AuthModal from './AuthModal';

function VaultSelector() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleOpenVault = async () => {
    if (window.electronAPI) {
      try {
        const vaultPath = await window.electronAPI.openVault();
        if (vaultPath) {
          console.log('Vault opened:', vaultPath);
          window.dispatchEvent(new CustomEvent('vault-opened', { detail: vaultPath }));
        }
      } catch (error) {
        console.error('Failed to open vault:', error);
        alert('Failed to open vault. Please try again.');
      }
    } else {
      console.error('Electron API not available');
      alert('Electron API not available. Please run the app in Electron.');
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowAuth(false);
  };

  return (
    <div className="vault-selector">
      <div className="vault-selector-content">
        <h1>Welcome to Neuron</h1>
        <p>Your personal knowledge management system. Connect ideas, build understanding, and grow your digital brain.</p>
        
        {!isLoggedIn ? (
          <div className="auth-section">
            <button 
              className="auth-btn"
              onClick={() => setShowAuth(true)}
            >
              Sign In / Register
            </button>
            <div className="divider">
              <span>or</span>
            </div>
          </div>
        ) : (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span>Welcome back, {user.name}!</span>
            </div>
          </div>
        )}
        
        <button 
          className="open-vault-btn"
          onClick={handleOpenVault}
        >
          Open Local Vault
        </button>
        
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🧠</div>
            <h3>Connected Thinking</h3>
            <p>Link your notes together and see how ideas connect</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📝</div>
            <h3>Markdown Support</h3>
            <p>Write in plain text with rich formatting</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <h3>Powerful Search</h3>
            <p>Find anything instantly across all your notes</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>Graph View</h3>
            <p>Visualize your knowledge network</p>
          </div>
        </div>
      </div>

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default VaultSelector;
