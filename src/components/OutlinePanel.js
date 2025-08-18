import React, { useState, useEffect } from 'react';

function OutlinePanel({ content, onJumpToLine }) {
  const [outline, setOutline] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!content) {
      setOutline([]);
      return;
    }

    const lines = content.split('\n');
    const headings = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        headings.push({
          level,
          text,
          line: index + 1,
          id: `heading-${index}`
        });
      }
    });
    
    setOutline(headings);
  }, [content]);

  const handleHeadingClick = (lineNumber) => {
    if (onJumpToLine) {
      onJumpToLine(lineNumber);
    }
  };

  return (
    <div className="outline-panel">
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`panel-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <h3>Outline ({outline.length})</h3>
      </div>
      
      {isExpanded && (
        <div className="panel-content">
          {outline.length === 0 ? (
            <div className="no-outline">
              <p>No headings found</p>
              <p>Add # headings to see document structure</p>
            </div>
          ) : (
            <div className="outline-list">
              {outline.map((heading, index) => (
                <div
                  key={index}
                  className={`outline-item level-${heading.level}`}
                  onClick={() => handleHeadingClick(heading.line)}
                  style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
                >
                  <span className="heading-marker">
                    {'#'.repeat(heading.level)}
                  </span>
                  <span className="heading-text">{heading.text}</span>
                  <span className="line-number">:{heading.line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OutlinePanel;
