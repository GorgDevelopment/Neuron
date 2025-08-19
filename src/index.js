import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Simple theme tokens using CSS variables applied at :root
const THEME_PRESETS = {
  dark: {
    '--color-primary': '#0d1117',
    '--color-secondary': '#161b22',
    '--color-border': '#30363d',
    '--color-accent': '#58a6ff',
    '--color-text': '#e6edf3',
    '--color-muted': '#8b949e',
  },
  light: {
    '--color-primary': '#ffffff',
    '--color-secondary': '#f6f8fa',
    '--color-border': '#d0d7de',
    '--color-accent': '#0969da',
    '--color-text': '#24292f',
    '--color-muted': '#57606a',
  },
  midnight: {
    '--color-primary': '#0b1020',
    '--color-secondary': '#111735',
    '--color-border': '#202a44',
    '--color-accent': '#6ea8fe',
    '--color-text': '#e7ecf3',
    '--color-muted': '#94a3b8',
  },
};

function Root() {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    const tokens = THEME_PRESETS[currentTheme] || THEME_PRESETS.dark;
    Object.entries(tokens).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, [currentTheme]);

  return (
    <App
      currentTheme={currentTheme}
      themes={Object.keys(THEME_PRESETS)}
      onThemeChange={setCurrentTheme}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
