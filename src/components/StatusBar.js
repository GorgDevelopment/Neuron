import React, { useState, useEffect } from 'react';

function StatusBar({ currentFile, content, vaultPath, files }) {
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    lines: 0,
    readingTime: 0
  });

  useEffect(() => {
    if (content) {
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      const characters = content.length;
      const lines = content.split('\n').length;
      const readingTime = Math.ceil(words / 200);
      
      setStats({ words, characters, lines, readingTime });
    } else {
      setStats({ words: 0, characters: 0, lines: 0, readingTime: 0 });
    }
  }, [content]);

  const formatPath = (path) => {
    if (!path) return '';
    return path.length > 50 ? '...' + path.slice(-47) : path;
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="vault-info">
          📁 {vaultPath ? formatPath(vaultPath) : 'No vault'}
        </span>
        <span className="file-count">
          {files.length} notes
        </span>
      </div>
      
      <div className="status-center">
        {currentFile && (
          <span className="current-file">
            📄 {formatPath(currentFile)}
          </span>
        )}
      </div>
      
      <div className="status-right">
        {content && (
          <>
            <span className="stat-item">
              {stats.words} words
            </span>
            <span className="stat-item">
              {stats.characters} chars
            </span>
            <span className="stat-item">
              {stats.lines} lines
            </span>
            <span className="stat-item">
              ~{stats.readingTime} min read
            </span>
          </>
        )}
        <span className="sync-status">
          ✓ Saved
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
