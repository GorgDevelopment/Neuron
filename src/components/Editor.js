import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Editor({ content, onChange, currentFile, files }) {
  const [isPreview, setIsPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [content, cursorPosition]);

  const handleTextChange = (e) => {
    const newContent = e.target.value;
    const cursor = e.target.selectionStart;
    setCursorPosition(cursor);
    onChange(newContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      setCursorPosition(start + 2);
    }
    
    if (e.key === '[' && e.target.selectionStart > 0 && content[e.target.selectionStart - 1] === '[') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + ']]' + content.substring(end);
      onChange(newContent);
      setCursorPosition(start);
      showLinkSuggestions(start);
    }
  };

  const showLinkSuggestions = (position) => {
    const suggestions = files.map(file => file.name);
    console.log('Link suggestions:', suggestions);
  };

  const processWikiLinks = (text) => {
    return text.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      const linkedFile = files.find(file => file.name === linkText);
      if (linkedFile) {
        return `[${linkText}](neuron://note/${linkedFile.path})`;
      }
      return `[${linkText}](neuron://create/${linkText})`;
    });
  };

  const renderMarkdown = (text) => {
    const processedText = processWikiLinks(text);
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('neuron://note/')) {
              const notePath = href.replace('neuron://note/', '');
              return (
                <span 
                  className="wiki-link"
                  onClick={() => {
                    const file = files.find(f => f.path === notePath);
                    if (file) {
                      window.electronAPI?.readFile(file.path).then(content => {
                        onChange(content);
                      });
                    }
                  }}
                >
                  {children}
                </span>
              );
            }
            if (href?.startsWith('neuron://create/')) {
              const noteName = href.replace('neuron://create/', '');
              return (
                <span 
                  className="wiki-link broken"
                  onClick={() => {
                    if (window.electronAPI) {
                      window.electronAPI.createNote(noteName);
                    }
                  }}
                >
                  {children}
                </span>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          }
        }}
      >
        {processedText}
      </ReactMarkdown>
    );
  };

  if (!currentFile) {
    return (
      <div className="editor-empty">
        <div className="empty-state">
          <h2>Welcome to Neuron</h2>
          <p>Select a note from the sidebar or create a new one to start writing</p>
          <div className="shortcuts">
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>N</kbd> New note
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>P</kbd> Command palette
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> Quick switcher
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="file-info">
          <span className="file-name">{currentFile}</span>
        </div>
        <div className="editor-controls">
          <button 
            className={`mode-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
          >
            Edit
          </button>
          <button 
            className={`mode-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        {isPreview ? (
          <div className="markdown-preview">
            {renderMarkdown(content)}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="editor-textarea"
            placeholder="Start writing your note..."
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

export default Editor;
