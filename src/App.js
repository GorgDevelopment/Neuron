import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import VaultSelector from './components/VaultSelector';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import CommandPalette from './components/CommandPalette';
import QuickSwitcher from './components/QuickSwitcher';
import BacklinksPanel from './components/BacklinksPanel';
import SearchPanel from './components/SearchPanel';
import ThemeManager from './components/ThemeManager';
import TagsPanel from './components/TagsPanel';
import Canvas from './components/Canvas';
import SettingsPanel from './components/SettingsPanel';
import PluginManager from './components/PluginManager';
import StatusBar from './components/StatusBar';
import OutlinePanel from './components/OutlinePanel';
import AIAssistant from './components/AIAssistant';
import SmartSuggestions from './components/SmartSuggestions';
import NoteOrganizer from './components/NoteOrganizer';
import AdvancedGraphView from './components/AdvancedGraphView';
import useAutoSave from './components/AutoSave';
import { FloatingParticles, FadeIn, SlideIn } from './components/AnimatedTransitions';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

function App({ currentTheme, themes, onThemeChange }) {
  const [selectedVaultPath, setSelectedVaultPath] = useState(null);
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [applicationIsLoading, setApplicationIsLoading] = useState(true);
  const [activeFileName, setActiveFileName] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('editor');
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [quickSwitcherVisible, setQuickSwitcherVisible] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [pluginsModalVisible, setPluginsModalVisible] = useState(false);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);
  const [noteOrganizerVisible, setNoteOrganizerVisible] = useState(false);
  const [canvasModalVisible, setCanvasModalVisible] = useState(false);
  const [selectedRightPanel, setSelectedRightPanel] = useState('backlinks');

  const loadVaultFiles = useCallback(async () => {
    if (!selectedVaultPath) return;
    
    setApplicationIsLoading(true);
    try {
      const vaultFiles = await window.electronAPI.getVaultFiles(selectedVaultPath);
      setMarkdownFiles(vaultFiles || []);
    } catch (error) {
      console.error('Error loading vault files:', error);
      setMarkdownFiles([]);
    } finally {
      setApplicationIsLoading(false);
    }
  }, [selectedVaultPath]);

  const handleVaultOpen = useCallback(async (newVaultPath) => {
    setSelectedVaultPath(newVaultPath);
    await loadVaultFiles();
  }, [loadVaultFiles]);

  const loadFile = useCallback(async (fileName) => {
    if (!selectedVaultPath || !fileName) return;
    
    try {
      const fileContent = await window.electronAPI.readFile(selectedVaultPath, fileName);
      setActiveFileName(fileName);
      setEditorContent(fileContent || '');
    } catch (error) {
      console.error('Error loading file:', error);
      setEditorContent('');
    }
  }, [selectedVaultPath]);

  const saveFile = useCallback(async (fileName, content) => {
    if (!selectedVaultPath || !fileName) return;
    
    try {
      await window.electronAPI.writeFile(selectedVaultPath, fileName, content);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [selectedVaultPath]);

  const createNewNote = useCallback(async (noteName) => {
    if (!selectedVaultPath) return;
    
    const suggestedFileName = noteName || `New Note ${Date.now()}.md`;
    const markdownFileName = suggestedFileName.endsWith('.md') ? suggestedFileName : `${suggestedFileName}.md`;
    
    try {
      const initialNoteContent = `# ${markdownFileName.replace('.md', '')}

Start writing your thoughts here...
`;
      await window.electronAPI.writeFile(selectedVaultPath, markdownFileName, initialNoteContent);
      await loadVaultFiles();
      setActiveFileName(markdownFileName);
      setEditorContent(initialNoteContent);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [selectedVaultPath, loadVaultFiles]);

  const deleteFile = useCallback(async (fileName) => {
    try {
      await window.electronAPI.deleteFile(fileName);
      setMarkdownFiles(prev => prev.filter(f => f.name !== fileName));
      if (activeFileName === fileName) {
        setActiveFileName(null);
        setEditorContent('');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, [activeFileName]);

  const renameFile = useCallback(async (oldFileName, newFileName) => {
    if (!selectedVaultPath || !oldFileName || !newFileName) return;
    
    try {
      const oldPath = oldFileName.endsWith('.md') ? oldFileName : `${oldFileName}.md`;
      const newPath = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
      
      await window.electronAPI.renameFile(oldPath, newPath);
      await loadVaultFiles();
      
      if (activeFileName === oldPath) {
        setActiveFileName(newPath);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename file. Please try again.');
    }
  }, [selectedVaultPath, loadVaultFiles, activeFileName]);

  const insertTextAtCursor = useCallback((textToInsert) => {
    const editorTextarea = document.querySelector('.editor-textarea');
    if (!editorTextarea) return;
    
    const cursorStartPosition = editorTextarea.selectionStart;
    const cursorEndPosition = editorTextarea.selectionEnd;
    const currentText = editorTextarea.value;
    
    const updatedText = currentText.substring(0, cursorStartPosition) + textToInsert + currentText.substring(cursorEndPosition);
    setEditorContent(updatedText);
    
    setTimeout(() => {
      editorTextarea.focus();
      editorTextarea.setSelectionRange(cursorStartPosition + textToInsert.length, cursorStartPosition + textToInsert.length);
    }, 0);
  }, []);

  const handleSuggestionClick = useCallback((selectedSuggestion) => {
    insertTextAtCursor(selectedSuggestion);
  }, [insertTextAtCursor]);

  useAutoSave(activeFileName, editorContent, saveFile);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onVaultOpened(handleVaultOpen);

      window.electronAPI.onFileAdded(() => {
        loadVaultFiles();
      });

      window.electronAPI.onFileChanged(() => {
        loadVaultFiles();
      });

      window.electronAPI.onFileDeleted(() => {
        loadVaultFiles();
        if (activeFileName) {
          setActiveFileName(null);
          setEditorContent('');
        }
      });

      window.electronAPI.onNewNote(() => {
        setCommandPaletteVisible(false);
        setQuickSwitcherVisible(false);
        createNewNote();
      });

      window.electronAPI.onToggleCommandPalette(() => {
        setCommandPaletteVisible(!commandPaletteVisible);
        setQuickSwitcherVisible(false);
      });

      window.electronAPI.onToggleQuickSwitcher(() => {
        setQuickSwitcherVisible(!quickSwitcherVisible);
        setCommandPaletteVisible(false);
      });

      return () => {
        window.electronAPI.removeAllListeners('vault-opened');
        window.electronAPI.removeAllListeners('file-added');
        window.electronAPI.removeAllListeners('file-changed');
        window.electronAPI.removeAllListeners('file-deleted');
        window.electronAPI.removeAllListeners('new-note');
        window.electronAPI.removeAllListeners('toggle-command-palette');
        window.electronAPI.removeAllListeners('toggle-quick-switcher');
      };
    }
  }, [commandPaletteVisible, quickSwitcherVisible, createNewNote, loadVaultFiles, handleVaultOpen]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (window.electronAPI) {
          const existingVault = await window.electronAPI.getVaultPath();
          if (existingVault) {
            setSelectedVaultPath(existingVault);
            await loadVaultFiles();
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setApplicationIsLoading(false);
      }
    };

    initializeApp();

    const handleShowAI = () => setAiAssistantVisible(true);
    const handleShowOrganizer = () => setNoteOrganizerVisible(true);
    const handleVaultOpened = async (event) => {
      const newVaultPath = event.detail;
      setSelectedVaultPath(newVaultPath);
      await loadVaultFiles();
    };

    window.addEventListener('show-ai', handleShowAI);
    window.addEventListener('show-organizer', handleShowOrganizer);
    window.addEventListener('vault-opened', handleVaultOpened);

    return () => {
      window.removeEventListener('show-ai', handleShowAI);
      window.removeEventListener('show-organizer', handleShowOrganizer);
      window.removeEventListener('vault-opened', handleVaultOpened);
    };
  }, [loadVaultFiles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setCommandPaletteVisible(!commandPaletteVisible);
        setQuickSwitcherVisible(false);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setQuickSwitcherVisible(true);
        setCommandPaletteVisible(false);
      } else if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      } else if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setActiveViewMode('graph');
      } else if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setActiveViewMode('editor');
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setActiveViewMode('canvas');
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (activeFileName && editorContent) {
          saveFile(activeFileName, editorContent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewNote, activeFileName, editorContent, saveFile]);

  const handleContentChange = useCallback((updatedContent) => {
    setEditorContent(updatedContent);
    if (activeFileName) {
      saveFile(activeFileName, updatedContent);
    }
  }, [activeFileName, saveFile]);

  const filteredMarkdownFiles = markdownFiles.filter(file => 
    file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  if (applicationIsLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Neuron...</p>
      </div>
    );
  }

  if (!selectedVaultPath) {
    return <VaultSelector onVaultOpen={handleVaultOpen} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">Neuron</div>
        <div className="view-controls">
          <button 
            className={activeViewMode === 'editor' ? 'active' : ''}
            onClick={() => setActiveViewMode('editor')}
          >
            Editor
          </button>
          <button 
            className={activeViewMode === 'graph' ? 'active' : ''}
            onClick={() => setActiveViewMode('graph')}
          >
            Graph
          </button>
          <button 
            className={activeViewMode === 'canvas' ? 'active' : ''}
            onClick={() => setActiveViewMode('canvas')}
          >
            Canvas
          </button>
          {activeFileName && (
            <button 
              className="unselect-file-btn"
              onClick={() => {
                setActiveFileName(null);
                setEditorContent('');
              }}
              title="Close file"
            >
              ×
            </button>
          )}
          <div className="theme-selector">
            <select 
              value={currentTheme} 
              onChange={(e) => onThemeChange(e.target.value)}
              className="theme-dropdown"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="app-body">
          <Sidebar 
            files={filteredMarkdownFiles} 
            currentFile={activeFileName}
            onFileSelect={loadFile}
            onCreateNote={createNewNote}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            searchQuery={fileSearchQuery}
            onSearchChange={setFileSearchQuery}
          />
        
        <div className="main-content">
          {activeViewMode === 'editor' && !activeFileName && (
            <div className="welcome-screen">
              <div className="welcome-content">
                <h1>Welcome to Neuron</h1>
                <p>Your intelligent note-taking companion</p>
                <div className="welcome-actions">
                  <button onClick={() => createNewNote()} className="welcome-btn primary">
                    Create New Note
                  </button>
                  <button onClick={() => setCommandPaletteVisible(true)} className="welcome-btn secondary">
                    Open Command Palette
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeViewMode === 'editor' && activeFileName && (
          <FadeIn>
            <div className="editor-container">
              <div className="editor-header">
                <div className="file-info">
                  <span className="file-icon">📝</span>
                  <span className="file-name">{activeFileName}</span>
                </div>
                <div className="editor-actions">
                  <button 
                    className="save-btn"
                    onClick={() => saveFile(activeFileName, editorContent)}
                    title="Save (Ctrl+S)"
                  >
                    Save
                  </button>
                </div>
              </div>
              <Editor 
                content={editorContent}
                onChange={setEditorContent}
                onSave={() => saveFile(activeFileName, editorContent)}
                files={markdownFiles}
                currentFile={activeFileName}
              />
              <SmartSuggestions
                currentContent={editorContent}
                files={markdownFiles}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </FadeIn>
        )}
        {activeViewMode === 'graph' && (
          <FadeIn>
            <AdvancedGraphView 
              files={markdownFiles}
              currentFile={activeFileName}
              onNodeClick={loadFile}
              onCreateNote={createNewNote}
              onDeleteNote={deleteFile}
            />
          </FadeIn>
        )}
        {activeViewMode === 'canvas' && (
          <FadeIn>
            <Canvas />
          </FadeIn>
        )}
        </div>
        
        {activeViewMode === 'editor' && activeFileName && (
          <div className="right-panels">
            <div className="panel-tabs">
              <button 
                className={selectedRightPanel === 'backlinks' ? 'active' : ''}
                onClick={() => setSelectedRightPanel('backlinks')}
              >
                Backlinks
              </button>
              <button 
                className={selectedRightPanel === 'outline' ? 'active' : ''}
                onClick={() => setSelectedRightPanel('outline')}
              >
                Outline
              </button>
              <button 
                className={selectedRightPanel === 'tags' ? 'active' : ''}
                onClick={() => setSelectedRightPanel('tags')}
              >
                Tags
              </button>
              <button 
                className={selectedRightPanel === 'search' ? 'active' : ''}
                onClick={() => setSelectedRightPanel('search')}
              >
                Search
              </button>
            </div>
            
            <div className="panel-content">
              {selectedRightPanel === 'backlinks' && (
                <BacklinksPanel 
                  currentFile={activeFileName}
                  files={markdownFiles}
                  onFileSelect={loadFile}
                />
              )}
              {selectedRightPanel === 'outline' && (
                <OutlinePanel content={editorContent} />
              )}
              {selectedRightPanel === 'tags' && (
                <TagsPanel 
                  files={markdownFiles}
                  currentFile={activeFileName}
                  onFileSelect={loadFile}
                />
              )}
              {selectedRightPanel === 'search' && (
                <SearchPanel 
                  files={markdownFiles}
                  onFileSelect={loadFile}
                  searchQuery={fileSearchQuery}
                  onSearchChange={setFileSearchQuery}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <StatusBar 
        currentFile={activeFileName}
        content={editorContent}
        vaultPath={selectedVaultPath}
        files={markdownFiles}
      />

      {settingsModalVisible && (
        <SettingsPanel 
          onClose={() => setSettingsModalVisible(false)}
          currentTheme={currentTheme}
          themes={themes}
          onThemeChange={onThemeChange}
        />
      )}

      {pluginsModalVisible && (
        <PluginManager 
          onClose={() => setPluginsModalVisible(false)}
        />
      )}

      {aiAssistantVisible && (
        <AIAssistant
          currentContent={editorContent}
          onInsertText={insertTextAtCursor}
          onClose={() => setAiAssistantVisible(false)}
        />
      )}


      {noteOrganizerVisible && (
        <NoteOrganizer
          files={markdownFiles}
          onClose={() => setNoteOrganizerVisible(false)}
          onFileSelect={loadFile}
          onDeleteFile={deleteFile}
        />
      )}

      {commandPaletteVisible && (
        <CommandPalette 
          onClose={() => setCommandPaletteVisible(false)}
          onCommand={(selectedCommand) => {
            if (selectedCommand === 'new-note') createNewNote();
            if (selectedCommand === 'open-graph') setActiveViewMode('graph');
            if (selectedCommand === 'open-canvas') setActiveViewMode('canvas');
            setCommandPaletteVisible(false);
          }}
        />
      )}

      {quickSwitcherVisible && (
        <QuickSwitcher 
          files={markdownFiles}
          onClose={() => setQuickSwitcherVisible(false)}
          onFileSelect={(selectedFile) => {
            loadFile(selectedFile.path);
            setQuickSwitcherVisible(false);
          }}
        />
      )}

      <FloatingParticles />
    </div>
  );
}

function AppWithTheme() {
  return (
    <ThemeManager>
      <App />
    </ThemeManager>
  );
}

export default AppWithTheme;
