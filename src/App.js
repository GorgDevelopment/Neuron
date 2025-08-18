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
import AccountSettings from './components/AccountSettings';
import NoteOrganizer from './components/NoteOrganizer';
import AdvancedGraphView from './components/AdvancedGraphView';
import useAutoSave from './components/AutoSave';
import { FloatingParticles, FadeIn, SlideIn } from './components/AnimatedTransitions';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

function App() {
  const [vaultPath, setVaultPath] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentContent, setCurrentContent] = useState('');
  const [viewMode, setViewMode] = useState('editor');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNoteOrganizer, setShowNoteOrganizer] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [rightPanel, setRightPanel] = useState('backlinks');

  const loadVaultFiles = useCallback(async () => {
    if (!vaultPath) return;
    
    setIsLoading(true);
    try {
      const vaultFiles = await window.electronAPI.getVaultFiles(vaultPath);
      setFiles(vaultFiles || []);
    } catch (error) {
      console.error('Error loading vault files:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [vaultPath]);

  const handleVaultOpen = useCallback(async (selectedVaultPath) => {
    setVaultPath(selectedVaultPath);
    await loadVaultFiles();
  }, [loadVaultFiles]);

  const loadFile = useCallback(async (fileName) => {
    if (!vaultPath || !fileName) return;
    
    try {
      const content = await window.electronAPI.readFile(vaultPath, fileName);
      setCurrentFile(fileName);
      setCurrentContent(content || '');
    } catch (error) {
      console.error('Error loading file:', error);
      setCurrentContent('');
    }
  }, [vaultPath]);

  const saveFile = useCallback(async (fileName, content) => {
    if (!vaultPath || !fileName) return;
    
    try {
      await window.electronAPI.writeFile(vaultPath, fileName, content);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [vaultPath]);

  const createNewNote = useCallback(async (noteName) => {
    if (!vaultPath) return;
    
    const fileName = noteName || `New Note ${Date.now()}.md`;
    const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    
    try {
      const defaultContent = `# ${finalFileName.replace('.md', '')}\n\nStart writing your thoughts here...\n`;
      await window.electronAPI.writeFile(vaultPath, finalFileName, defaultContent);
      await loadVaultFiles();
      setCurrentFile(finalFileName);
      setCurrentContent(defaultContent);
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  }, [vaultPath, loadVaultFiles]);

  const deleteFile = useCallback(async (fileName) => {
    try {
      await window.electronAPI.deleteFile(fileName);
      setFiles(prev => prev.filter(f => f.name !== fileName));
      if (currentFile === fileName) {
        setCurrentFile(null);
        setCurrentContent('');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, [currentFile]);

  const insertTextAtCursor = useCallback((text) => {
    setCurrentContent(prev => prev + text);
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    insertTextAtCursor(suggestion);
  }, [insertTextAtCursor]);

  useAutoSave(currentFile, currentContent, saveFile);

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
        if (currentFile) {
          setCurrentFile(null);
          setCurrentContent('');
        }
      });

      window.electronAPI.onNewNote(() => {
        setShowCommandPalette(false);
        setShowQuickSwitcher(false);
        createNewNote();
      });

      window.electronAPI.onToggleCommandPalette(() => {
        setShowCommandPalette(!showCommandPalette);
        setShowQuickSwitcher(false);
      });

      window.electronAPI.onToggleQuickSwitcher(() => {
        setShowQuickSwitcher(!showQuickSwitcher);
        setShowCommandPalette(false);
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
  }, [showCommandPalette, showQuickSwitcher, createNewNote, loadVaultFiles, handleVaultOpen]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (window.electronAPI) {
          const existingVault = await window.electronAPI.getVaultPath();
          if (existingVault) {
            setVaultPath(existingVault);
            await loadVaultFiles();
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    const handleShowAI = () => setShowAI(true);
    const handleShowOrganizer = () => setShowNoteOrganizer(true);
    const handleShowAccount = () => setShowAccountSettings(true);
    const handleVaultOpened = async (event) => {
      const vaultPath = event.detail;
      setVaultPath(vaultPath);
      await loadVaultFiles();
    };

    window.addEventListener('show-ai', handleShowAI);
    window.addEventListener('show-organizer', handleShowOrganizer);
    window.addEventListener('show-account', handleShowAccount);
    window.addEventListener('vault-opened', handleVaultOpened);

    return () => {
      window.removeEventListener('show-ai', handleShowAI);
      window.removeEventListener('show-organizer', handleShowOrganizer);
      window.removeEventListener('show-account', handleShowAccount);
      window.removeEventListener('vault-opened', handleVaultOpened);
    };
  }, [loadVaultFiles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setShowCommandPalette(true);
        setShowQuickSwitcher(false);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowQuickSwitcher(true);
        setShowCommandPalette(false);
      } else if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      } else if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setViewMode('graph');
      } else if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setViewMode('editor');
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setViewMode('canvas');
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (currentFile && currentContent) {
          saveFile(currentFile, currentContent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewNote, currentFile, currentContent, saveFile]);

  const handleContentChange = useCallback((content) => {
    setCurrentContent(content);
    if (currentFile) {
      saveFile(currentFile, content);
    }
  }, [currentFile, saveFile]);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Neuron...</p>
      </div>
    );
  }

  if (!vaultPath) {
    return <VaultSelector onVaultOpen={handleVaultOpen} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">Neuron</div>
        <div className="view-controls">
          <button 
            className={viewMode === 'editor' ? 'active' : ''}
            onClick={() => setViewMode('editor')}
          >
            Editor
          </button>
          <button 
            className={viewMode === 'graph' ? 'active' : ''}
            onClick={() => setViewMode('graph')}
          >
            Graph
          </button>
          <button 
            className={viewMode === 'canvas' ? 'active' : ''}
            onClick={() => setViewMode('canvas')}
          >
            Canvas
          </button>
        </div>
      </div>
      
      <div className="app-body">
        <Sidebar 
          files={filteredFiles}
          currentFile={currentFile}
          onFileSelect={loadFile}
          onCreateNote={createNewNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="main-content">
          {viewMode === 'editor' && (
          <FadeIn>
            <div className="editor-container">
              <div className="editor-header">
                <div className="file-info">
                  <span className="file-icon">📝</span>
                  <span className="file-name">{currentFile || 'No file selected'}</span>
                </div>
                <div className="editor-actions">
                  <button 
                    className="save-btn"
                    onClick={() => currentFile && saveFile(currentFile, currentContent)}
                    disabled={!currentFile}
                    title="Save (Ctrl+S)"
                  >
                    💾 Save
                  </button>
                </div>
              </div>
              <Editor 
                content={currentContent}
                onChange={setCurrentContent}
                onSave={() => saveFile(currentFile, currentContent)}
                files={files}
                currentFile={currentFile}
              />
              <SmartSuggestions
                currentContent={currentContent}
                files={files}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </FadeIn>
        )}
        {viewMode === 'graph' && (
          <FadeIn>
            <AdvancedGraphView 
              files={files}
              currentFile={currentFile}
              onNodeClick={loadFile}
              onCreateNote={createNewNote}
              onDeleteNote={deleteFile}
            />
          </FadeIn>
        )}
        {viewMode === 'canvas' && (
          <FadeIn>
            <Canvas />
          </FadeIn>
        )}
        </div>
        
        {viewMode === 'editor' && currentFile && (
          <div className="right-panels">
            <div className="panel-tabs">
              <button 
                className={rightPanel === 'backlinks' ? 'active' : ''}
                onClick={() => setRightPanel('backlinks')}
              >
                Backlinks
              </button>
              <button 
                className={rightPanel === 'outline' ? 'active' : ''}
                onClick={() => setRightPanel('outline')}
              >
                Outline
              </button>
              <button 
                className={rightPanel === 'tags' ? 'active' : ''}
                onClick={() => setRightPanel('tags')}
              >
                Tags
              </button>
            </div>
            
            {rightPanel === 'backlinks' && (
              <BacklinksPanel 
                currentFile={currentFile}
                files={files}
                onFileSelect={loadFile}
              />
            )}
            
            {rightPanel === 'outline' && (
              <OutlinePanel 
                content={currentContent}
                onJumpToLine={(line) => console.log('Jump to line:', line)}
              />
            )}
            
            {rightPanel === 'tags' && (
              <TagsPanel 
                files={files}
                onFileSelect={loadFile}
                onTagSelect={(tag) => console.log('Tag selected:', tag)}
              />
            )}
          </div>
        )}
      </div>

      {showCommandPalette && (
        <CommandPalette 
          onClose={() => setShowCommandPalette(false)}
          onCreateNote={createNewNote}
          onFileSelect={loadFile}
          files={files}
        />
      )}

      {showQuickSwitcher && (
        <QuickSwitcher 
          onClose={() => setShowQuickSwitcher(false)}
          onFileSelect={loadFile}
          files={files}
        />
      )}

      <StatusBar 
        currentFile={currentFile}
        content={currentContent}
        vaultPath={vaultPath}
        files={files}
      />

      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          currentTheme="dark"
          themes={['dark', 'light', 'purple', 'blue']}
          onThemeChange={(theme) => console.log('Theme changed:', theme)}
        />
      )}

      {showPlugins && (
        <PluginManager 
          onClose={() => setShowPlugins(false)}
        />
      )}

      {showAI && (
        <AIAssistant
          currentContent={currentContent}
          onInsertText={insertTextAtCursor}
          onClose={() => setShowAI(false)}
        />
      )}

      {showAccountSettings && (
        <AccountSettings
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {showNoteOrganizer && (
        <NoteOrganizer
          files={files}
          onFileMove={(file, folder) => console.log('Move file:', file, 'to:', folder)}
          onFolderCreate={(name) => console.log('Create folder:', name)}
          onClose={() => setShowNoteOrganizer(false)}
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
