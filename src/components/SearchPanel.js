import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';

function SearchPanel({ files, onFileSelect, isVisible, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fuse = new Fuse(files, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'content', weight: 0.3 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true
  });

  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuse.search(query);
      setResults(searchResults.slice(0, 20));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, files]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onFileSelect(results[selectedIndex].item.path);
        onClose();
      }
    }
  };

  const highlightMatches = (text, matches) => {
    if (!matches || !matches.length) return text;
    
    let result = text;
    const sortedMatches = matches.sort((a, b) => b.indices[0][0] - a.indices[0][0]);
    
    sortedMatches.forEach(match => {
      match.indices.forEach(([start, end]) => {
        const before = result.substring(0, start);
        const highlighted = result.substring(start, end + 1);
        const after = result.substring(end + 1);
        result = before + `<mark>${highlighted}</mark>` + after;
      });
    });
    
    return result;
  };

  if (!isVisible) return null;

  return (
    <div className="search-panel">
      <div className="search-header">
        <input
          type="text"
          placeholder="Search across all notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input-main"
          autoFocus
        />
        <button className="close-search-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="search-results-panel">
        {results.length === 0 && query ? (
          <div className="no-search-results">
            No results found for "{query}"
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={result.item.path}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                onFileSelect(result.item.path);
                onClose();
              }}
            >
              <div className="result-header">
                <span className="file-icon">📄</span>
                <span className="result-name">{result.item.name}</span>
                <span className="result-score">{Math.round((1 - result.score) * 100)}%</span>
              </div>
              
              {result.matches && (
                <div className="result-matches">
                  {result.matches.slice(0, 3).map((match, matchIndex) => (
                    <div key={matchIndex} className="match-snippet">
                      <span 
                        dangerouslySetInnerHTML={{
                          __html: highlightMatches(
                            match.value.substring(0, 150) + (match.value.length > 150 ? '...' : ''),
                            [match]
                          )
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchPanel;
