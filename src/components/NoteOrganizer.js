import React, { useState, useEffect } from 'react';
import { FadeIn, SlideIn, Ripple } from './AnimatedTransitions';

function NoteOrganizer({ files, onFileMove, onFolderCreate, onClose }) {
  const [folders, setFolders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggedFile, setDraggedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    const folderStructure = buildFolderStructure(files);
    setFolders(folderStructure);
  }, [files]);

  const buildFolderStructure = (files) => {
    const structure = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        if (!structure[folder]) {
          structure[folder] = [];
        }
        structure[folder].push(file);
      } else {
        if (!structure['Root']) {
          structure['Root'] = [];
        }
        structure['Root'].push(file);
      }
    });
    return structure;
  };

  const handleDragStart = (e, file) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    if (draggedFile && targetFolder !== draggedFile.folder) {
      onFileMove(draggedFile, targetFolder);
    }
    setDraggedFile(null);
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => 
      prev.includes(file) 
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  const getSortedFiles = (files) => {
    return [...files].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'modified':
          return new Date(b.modified) - new Date(a.modified);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
  };

  const getFilteredFiles = (files) => {
    if (!filterTag) return files;
    return files.filter(file => 
      file.tags && file.tags.includes(filterTag)
    );
  };

  return (
    <div className="modal-overlay">
      <FadeIn>
        <div className="note-organizer">
          <div className="organizer-header">
            <h2>📁 Note Organizer</h2>
            <div className="header-controls">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="modified">Sort by Modified</option>
                <option value="size">Sort by Size</option>
              </select>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
              </select>
              <button onClick={onClose} className="close-btn">×</button>
            </div>
          </div>

          <div className="organizer-toolbar">
            <Ripple>
              <button 
                className="toolbar-btn"
                onClick={() => setShowNewFolder(true)}
              >
                📁 New Folder
              </button>
            </Ripple>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="filter-input"
            />
            {selectedFiles.length > 0 && (
              <div className="bulk-actions">
                <span>{selectedFiles.length} selected</span>
                <button className="bulk-btn">Move</button>
                <button className="bulk-btn">Tag</button>
                <button className="bulk-btn danger">Delete</button>
              </div>
            )}
          </div>

          {showNewFolder && (
            <SlideIn direction="up">
              <div className="new-folder-form">
                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  autoFocus
                />
                <button onClick={createFolder}>Create</button>
                <button onClick={() => setShowNewFolder(false)}>Cancel</button>
              </div>
            </SlideIn>
          )}

          <div className="organizer-content">
            {Object.entries(folders).map(([folderName, folderFiles]) => (
              <div
                key={folderName}
                className="folder-section"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, folderName)}
              >
                <div className="folder-header">
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">{folderName}</span>
                  <span className="file-count">({folderFiles.length})</span>
                </div>
                
                <div className={`files-container ${viewMode}`}>
                  {getSortedFiles(getFilteredFiles(folderFiles)).map(file => (
                    <div
                      key={file.path}
                      className={`file-card ${selectedFiles.includes(file) ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onClick={() => toggleFileSelection(file)}
                    >
                      <div className="file-icon">📝</div>
                      <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          <span>{new Date(file.modified).toLocaleDateString()}</span>
                          {file.tags && (
                            <div className="file-tags">
                              {file.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="file-tag">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

export default NoteOrganizer;
