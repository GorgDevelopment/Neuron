import React, { useState, useEffect } from 'react';

function SmartSuggestions({ currentContent, files, onSuggestionClick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentContent.length > 50) {
      generateSuggestions();
    }
  }, [currentContent, files]);

  const generateSuggestions = () => {
    const words = currentContent.toLowerCase().split(/\s+/);
    const lastWords = words.slice(-10);
    
    const linkSuggestions = files
      .filter(file => {
        const fileName = file.name.toLowerCase();
        return lastWords.some(word => 
          fileName.includes(word) || 
          word.includes(fileName.slice(0, 4))
        );
      })
      .slice(0, 3)
      .map(file => ({
        type: 'link',
        text: `[[${file.name}]]`,
        description: `Link to ${file.name}`,
        icon: '🔗'
      }));

    const contentSuggestions = [];
    
    if (currentContent.includes('TODO') || currentContent.includes('todo')) {
      contentSuggestions.push({
        type: 'template',
        text: '\n- [ ] ',
        description: 'Add task checkbox',
        icon: '☑️'
      });
    }

    if (currentContent.includes('#') && !currentContent.includes('##')) {
      contentSuggestions.push({
        type: 'template',
        text: '\n## ',
        description: 'Add subheading',
        icon: '📋'
      });
    }

    if (currentContent.length > 200 && !currentContent.includes('---')) {
      contentSuggestions.push({
        type: 'template',
        text: '\n---\n\n',
        description: 'Add section divider',
        icon: '➖'
      });
    }

    const allSuggestions = [...linkSuggestions, ...contentSuggestions];
    setSuggestions(allSuggestions);
    setIsVisible(allSuggestions.length > 0);
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="smart-suggestions">
      <div className="suggestions-header">
        <span>💡 Smart Suggestions</span>
        <button onClick={() => setIsVisible(false)}>×</button>
      </div>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="suggestion-item"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            <span className="suggestion-icon">{suggestion.icon}</span>
            <div className="suggestion-content">
              <div className="suggestion-text">{suggestion.text}</div>
              <div className="suggestion-description">{suggestion.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartSuggestions;
