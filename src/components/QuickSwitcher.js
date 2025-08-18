import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';

function QuickSwitcher({ onClose, onFileSelect, files }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef();

  const fuse = new Fuse(files, {
    keys: ['name', 'path'],
    threshold: 0.3,
    includeScore: true
  });

  const searchResults = query ? fuse.search(query).map(result => result.item) : files;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        onFileSelect(searchResults[selectedIndex].path);
        onClose();
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quick-switcher" onClick={e => e.stopPropagation()}>
        <div className="switcher-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="switcher-input"
          />
        </div>
        
        <div className="switcher-results">
          {searchResults.map((file, index) => (
            <div
              key={file.path}
              className={`switcher-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                onFileSelect(file.path);
                onClose();
              }}
            >
              <div className="switcher-item-main">
                <span className="file-icon">📄</span>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-path">{file.path}</div>
                </div>
              </div>
              <div className="file-meta">
                <span className="file-date">{formatDate(file.modified)}</span>
              </div>
            </div>
          ))}
          
          {searchResults.length === 0 && (
            <div className="no-results">
              No notes found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickSwitcher;
