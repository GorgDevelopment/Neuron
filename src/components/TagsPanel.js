import React, { useState, useEffect } from 'react';

function TagsPanel({ files, onFileSelect, onTagSelect }) {
  const [tags, setTags] = useState({});
  const [selectedTag, setSelectedTag] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const tagMap = {};
    
    files.forEach(file => {
      if (file.content) {
        const tagMatches = file.content.match(/#[\w-]+/g) || [];
        const yamlMatches = file.content.match(/^---\n([\s\S]*?)\n---/);
        
        let fileTags = [...tagMatches];
        
        if (yamlMatches) {
          const yamlContent = yamlMatches[1];
          const tagsMatch = yamlContent.match(/tags:\s*\[(.*?)\]/);
          if (tagsMatch) {
            const yamlTags = tamlMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
            fileTags = [...fileTags, ...yamlTags.map(tag => `#${tag}`)];
          }
        }
        
        fileTags.forEach(tag => {
          const cleanTag = tag.replace('#', '');
          if (!tagMap[cleanTag]) {
            tagMap[cleanTag] = [];
          }
          if (!tagMap[cleanTag].find(f => f.path === file.path)) {
            tagMap[cleanTag].push(file);
          }
        });
      }
    });
    
    setTags(tagMap);
  }, [files]);

  const sortedTags = Object.entries(tags).sort((a, b) => b[1].length - a[1].length);

  const handleTagClick = (tagName) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
    if (onTagSelect) {
      onTagSelect(tagName);
    }
  };

  return (
    <div className="tags-panel">
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`panel-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <h3>Tags ({sortedTags.length})</h3>
      </div>
      
      {isExpanded && (
        <div className="panel-content">
          {sortedTags.length === 0 ? (
            <div className="no-tags">
              <p>No tags found</p>
              <p>Add #tags to your notes to organize them</p>
            </div>
          ) : (
            <div className="tags-list">
              {sortedTags.map(([tagName, tagFiles]) => (
                <div key={tagName} className="tag-group">
                  <div 
                    className={`tag-item ${selectedTag === tagName ? 'selected' : ''}`}
                    onClick={() => handleTagClick(tagName)}
                  >
                    <span className="tag-icon">#</span>
                    <span className="tag-name">{tagName}</span>
                    <span className="tag-count">({tagFiles.length})</span>
                  </div>
                  
                  {selectedTag === tagName && (
                    <div className="tag-files">
                      {tagFiles.map(file => (
                        <div
                          key={file.path}
                          className="tag-file"
                          onClick={() => onFileSelect(file.path)}
                        >
                          <span className="file-icon">📄</span>
                          <span className="file-name">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TagsPanel;
