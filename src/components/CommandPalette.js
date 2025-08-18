import React, { useState, useEffect, useRef } from 'react';

function CommandPalette({ onClose, onCreateNote, onFileSelect, files }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef();

  const commands = [
    {
      id: 'new-note',
      name: 'Create new note',
      icon: '📝',
      action: () => {
        onCreateNote();
        onClose();
      },
      shortcut: 'Ctrl+N',
      category: 'File'
    },
    {
      id: 'new-folder',
      name: 'Create new folder',
      icon: '📁',
      action: () => {
        console.log('Create folder');
        onClose();
      },
      category: 'File'
    },
    {
      id: 'daily-note',
      name: 'Open daily note',
      icon: '📅',
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        onCreateNote(`Daily Note ${today}`);
        onClose();
      },
      category: 'File'
    },
    {
      id: 'random-note',
      name: 'Open random note',
      icon: '🎲',
      action: () => {
        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          onFileSelect(randomFile.path);
        }
        onClose();
      },
      category: 'Navigation'
    },
    {
      id: 'ai-assistant',
      name: 'Open AI Assistant',
      icon: '🤖',
      action: () => {
        window.dispatchEvent(new CustomEvent('show-ai'));
        onClose();
      },
      shortcut: 'Ctrl+I',
      category: 'AI'
    },
    {
      id: 'ai-summarize',
      name: 'AI: Summarize current note',
      icon: '📋',
      action: () => {
        window.dispatchEvent(new CustomEvent('ai-summarize'));
        onClose();
      },
      category: 'AI'
    },
    {
      id: 'ai-expand',
      name: 'AI: Expand current selection',
      icon: '📈',
      action: () => {
        window.dispatchEvent(new CustomEvent('ai-expand'));
        onClose();
      },
      category: 'AI'
    },
    {
      id: 'note-organizer',
      name: 'Note Organizer',
      icon: '🗂️',
      action: () => {
        window.dispatchEvent(new CustomEvent('show-organizer'));
        onClose();
      },
      shortcut: 'Ctrl+O',
      category: 'Organization'
    },
    {
      id: 'graph-view',
      name: 'Open graph view',
      icon: '🕸️',
      action: () => {
        console.log('Switch to graph view');
        onClose();
      },
      shortcut: 'Ctrl+G',
      category: 'View'
    },
    {
      id: 'canvas-view',
      name: 'Open canvas',
      icon: '🎨',
      action: () => {
        console.log('Switch to canvas view');
        onClose();
      },
      category: 'View'
    },
    {
      id: 'search-notes',
      name: 'Search in all notes',
      icon: '🔍',
      action: () => {
        console.log('Search functionality');
        onClose();
      },
      shortcut: 'Ctrl+Shift+F',
      category: 'Search'
    },
    {
      id: 'search-replace',
      name: 'Find and replace',
      icon: '🔄',
      action: () => {
        console.log('Find and replace');
        onClose();
      },
      shortcut: 'Ctrl+H',
      category: 'Search'
    },
    {
      id: 'toggle-theme',
      name: 'Toggle theme',
      icon: '🌙',
      action: () => {
        console.log('Toggle theme');
        onClose();
      },
      shortcut: 'Ctrl+T',
      category: 'Appearance'
    },
    {
      id: 'zen-mode',
      name: 'Toggle zen mode',
      icon: '🧘',
      action: () => {
        console.log('Toggle zen mode');
        onClose();
      },
      category: 'View'
    },
    {
      id: 'account-settings',
      name: 'Account Settings',
      icon: '👤',
      action: () => {
        window.dispatchEvent(new CustomEvent('show-account'));
        onClose();
      },
      shortcut: 'Ctrl+U',
      category: 'Settings'
    },
    {
      id: 'export-vault',
      name: 'Export vault',
      icon: '📤',
      action: () => {
        console.log('Export vault');
      },
      category: 'Vault',
      shortcut: ''
    },
    {
      id: 'backup-vault',
      name: 'Backup vault',
      icon: '💾',
      action: () => console.log('Backup vault'),
      category: 'Vault',
      shortcut: ''
    },
    {
      id: 'insert-template',
      name: 'Insert template',
      icon: '📄',
      action: () => console.log('Insert template'),
      category: 'Insert',
      shortcut: ''
    },
    {
      id: 'insert-table',
      name: 'Insert table',
      icon: '📊',
      action: () => console.log('Insert table'),
      category: 'Insert',
      shortcut: ''
    },
    {
      id: 'insert-wiki-link',
      name: 'Insert wiki link',
      icon: '🔗',
      action: () => console.log('Insert wiki link'),
      category: 'Insert',
      shortcut: '[['
    },
    {
      id: 'insert-code-block',
      name: 'Insert code block',
      icon: '```',
      action: () => console.log('Insert code block'),
      category: 'Insert',
      shortcut: '```'
    },
    {
      id: 'insert-math-block',
      name: 'Insert math block',
      icon: '$$',
      action: () => console.log('Insert math block'),
      category: 'Insert',
      shortcut: '$$'
    },
    {
      id: 'insert-checklist',
      name: 'Insert checklist',
      icon: '- [ ]',
      action: () => console.log('Insert checklist'),
      category: 'Insert',
      shortcut: '- [ ]'
    },
    {
      id: 'insert-quote',
      name: 'Insert quote',
      icon: '>',
      action: () => console.log('Insert quote'),
      category: 'Insert',
      shortcut: '>'
    },
    {
      id: 'insert-horizontal-rule',
      name: 'Insert horizontal rule',
      icon: '---',
      action: () => console.log('Insert horizontal rule'),
      category: 'Insert',
      shortcut: '---'
    },
    {
      id: 'toggle-bold',
      name: 'Toggle bold',
      icon: '',
      action: () => console.log('Toggle bold'),
      category: 'Format',
      shortcut: 'Ctrl+B'
    },
    {
      id: 'toggle-italic',
      name: 'Toggle italic',
      icon: '',
      action: () => console.log('Toggle italic'),
      category: 'Format',
      shortcut: 'Ctrl+I'
    },
    {
      id: 'toggle-strikethrough',
      name: 'Toggle strikethrough',
      icon: '',
      action: () => console.log('Toggle strikethrough'),
      category: 'Format',
      shortcut: ''
    },
    {
      id: 'toggle-highlight',
      name: 'Toggle highlight',
      icon: '==',
      action: () => console.log('Toggle highlight'),
      category: 'Format',
      shortcut: '=='
    },
    {
      id: 'insert-link',
      name: 'Insert link',
      icon: '🔗',
      action: () => {
        console.log('Insert link');
        onClose();
      },
      shortcut: 'Ctrl+K',
      category: 'Insert'
    }
  ];

  const fileCommands = files.map(file => ({
    id: `open-${file.path}`,
    name: `Open: ${file.name}`,
    icon: '📄',
    action: () => {
      onFileSelect(file.path);
      onClose();
    }
  }));

  const allCommands = [...commands, ...fileCommands];
  const filteredCommands = allCommands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

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
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="command-input"
          />
        </div>
        
        <div className="command-results">
          {filteredCommands.map((command, index) => (
            <div
              key={command.id}
              className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={command.action}
            >
              <div className="command-left">
                <span className="command-icon">{command.icon}</span>
                <div className="command-details">
                  <span className="command-name">{command.name}</span>
                  {command.category && (
                    <span className="command-category">{command.category}</span>
                  )}
                </div>
              </div>
              {command.shortcut && (
                <span className="command-shortcut">{command.shortcut}</span>
              )}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <span>No commands found for "{query}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
