import React, { useState } from 'react';

function Sidebar({ files, currentFile, onFileSelect, onCreateNote, onDeleteFile, onRenameFile, searchQuery, onSearchChange }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const organizeFiles = (files) => {
    const folders = {};
    const rootFiles = [];

    files.forEach(file => {
      const pathParts = file.path.split(/[\/\\]/);
      if (pathParts.length === 1) {
        rootFiles.push(file);
      } else {
        const folderName = pathParts[0];
        if (!folders[folderName]) {
          folders[folderName] = [];
        }
        folders[folderName].push({
          ...file,
          path: pathParts.slice(1).join('/')
        });
      }
    });

    return { folders, rootFiles };
  };

  const { folders, rootFiles } = organizeFiles(files);

  const renderFile = (file, depth = 0) => (
    <div
      key={file.path}
      className={`file-item ${currentFile === file.path ? 'active' : ''}`}
      style={{ paddingLeft: `${depth * 20 + 12}px` }}
    >
      <div className="file-content" onClick={() => onFileSelect(file.path)}>
        <span className="file-icon">📄</span>
        <span className="file-name">{file.name}</span>
      </div>
      <div className="file-actions">
        <button 
          className="rename-btn"
          onClick={(e) => {
            e.stopPropagation();
            const newName = prompt('Enter new name:', file.name.replace('.md', ''));
            if (newName && newName.trim() && newName !== file.name.replace('.md', '')) {
              onRenameFile(file.name, newName.trim());
            }
          }}
          title="Rename file"
        >
          ✏️
        </button>
        <button 
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${file.name}"?`)) {
              onDeleteFile(file.name);
            }
          }}
          title="Delete file"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  const renderFolder = (folderName, folderFiles) => {
    const isExpanded = expandedFolders.has(folderName);
    const { folders: subFolders, rootFiles: subFiles } = organizeFiles(folderFiles);

    return (
      <div key={folderName} className="folder-item">
        <div 
          className="folder-header"
          onClick={() => toggleFolder(folderName)}
        >
          <span className={`folder-icon ${isExpanded ? 'expanded' : ''}`}>📁</span>
          <span className="folder-name">{folderName}</span>
        </div>
        {isExpanded && (
          <div className="folder-content">
            {Object.entries(subFolders).map(([subFolderName, subFolderFiles]) =>
              renderFolder(subFolderName, subFolderFiles)
            )}
            {subFiles.map(file => renderFile(file, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="new-note-btn"
          onClick={() => onCreateNote()}
          title="Create new note (Ctrl+N)"
        >
          +
        </button>
      </div>
      
      <div className="file-list">
        {Object.entries(folders).map(([folderName, folderFiles]) =>
          renderFolder(folderName, folderFiles)
        )}
        {rootFiles.map(file => renderFile(file))}
        
        {files.length === 0 && (
          <div className="empty-state">
            <p>No notes yet</p>
            <p>Create your first note to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
