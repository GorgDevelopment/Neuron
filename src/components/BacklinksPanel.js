import React, { useState, useEffect } from 'react';

function BacklinksPanel({ currentFile, files, onFileSelect }) {
  const [backlinks, setBacklinks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!currentFile || !files.length) {
      setBacklinks([]);
      return;
    }

    const currentFileName = currentFile.replace(/\.md$/, '').split(/[\/\\]/).pop();
    const foundBacklinks = [];

    files.forEach(file => {
      if (file.path !== currentFile && file.content) {
        const linkPattern = new RegExp(`\\[\\[${currentFileName}\\]\\]`, 'gi');
        const matches = file.content.match(linkPattern);
        if (matches) {
          const lines = file.content.split('\n');
          const contexts = [];
          
          lines.forEach((line, index) => {
            if (linkPattern.test(line)) {
              contexts.push({
                lineNumber: index + 1,
                content: line.trim(),
                before: lines[index - 1]?.trim() || '',
                after: lines[index + 1]?.trim() || ''
              });
            }
          });

          foundBacklinks.push({
            file: file,
            contexts: contexts,
            count: matches.length
          });
        }
      }
    });

    setBacklinks(foundBacklinks);
  }, [currentFile, files]);

  if (!currentFile) {
    return null;
  }

  return (
    <div className="backlinks-panel">
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`panel-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <h3>Backlinks ({backlinks.length})</h3>
      </div>
      
      {isExpanded && (
        <div className="panel-content">
          {backlinks.length === 0 ? (
            <div className="no-backlinks">
              <p>No backlinks found</p>
              <p>Other notes that link to this note will appear here</p>
            </div>
          ) : (
            <div className="backlinks-list">
              {backlinks.map((backlink, index) => (
                <div key={index} className="backlink-item">
                  <div 
                    className="backlink-file"
                    onClick={() => onFileSelect(backlink.file.path)}
                  >
                    <span className="file-icon">📄</span>
                    <span className="file-name">{backlink.file.name}</span>
                    <span className="link-count">({backlink.count})</span>
                  </div>
                  
                  <div className="backlink-contexts">
                    {backlink.contexts.map((context, ctxIndex) => (
                      <div key={ctxIndex} className="context-item">
                        <div className="context-line">
                          <span className="line-number">{context.lineNumber}</span>
                          <span className="context-content">{context.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BacklinksPanel;
