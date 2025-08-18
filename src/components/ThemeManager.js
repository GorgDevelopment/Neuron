import React, { useState, useEffect } from 'react';

const themes = {
  dark: {
    name: 'Dark',
    colors: {
      primary: '#1e1e1e',
      secondary: '#252525',
      tertiary: '#2d2d2d',
      accent: '#007acc',
      text: '#e0e0e0',
      textSecondary: '#b0b0b0',
      textMuted: '#888',
      border: '#404040',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#ff4444'
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      accent: '#0066cc',
      text: '#212529',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: '#1a1625',
      secondary: '#241b2f',
      tertiary: '#2d2438',
      accent: '#8b5cf6',
      text: '#e5e7eb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      border: '#4b5563',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      accent: '#3b82f6',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#475569',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444'
    }
  }
};

function ThemeManager({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('neuron_theme') || 'dark';
    setCurrentTheme(savedTheme);
    applyTheme(themes[savedTheme]);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('neuron_theme', themeName);
    applyTheme(themes[themeName]);
  };

  return (
    <div className={`theme-${currentTheme}`}>
      {React.cloneElement(children, { 
        currentTheme, 
        themes: Object.keys(themes), 
        onThemeChange: changeTheme 
      })}
    </div>
  );
}

export default ThemeManager;
