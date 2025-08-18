# Neuron 🧠

A powerful, modern note-taking and knowledge management desktop application built with Electron and React. Neuron combines the best features of Obsidian-style linking with advanced AI assistance and beautiful animations.

![Neuron App](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

### Core Functionality
- **Vault-based file system** - Organize your notes in folders of markdown files
- **Wiki-style linking** - Connect notes with `[[note title]]` syntax
- **Interactive graph view** - Visualize connections between your notes
- **Markdown editor** - Rich text editing with live preview
- **Global search** - Find content across all your notes instantly
- **Backlinks panel** - See which notes link to your current note

### Advanced Features
- **AI Assistant** - OpenAI/Claude/Gemini integration for content summarization, expansion, and question generation
- **Smart Suggestions** - Auto-suggests links, templates, and content based on context
- **Auto-save** - Never lose your work with intelligent 2-second auto-save
- **Command Palette** - Quick actions with `Ctrl+P`
- **Quick Switcher** - Fast file navigation with `Ctrl+Shift+P`
- **Note Organizer** - Drag-drop organization with bulk operations
- **Canvas Mode** - Visual note arrangement and mind mapping
- **Account Settings** - Profile management and AI service configuration

### User Experience
- **Beautiful animations** - Smooth fade-in, slide transitions, and floating particles
- **Clean interface** - Distraction-free design with hidden menu bar
- **Theme customization** - Multiple themes to match your style
- **Local-first** - All your data stays on your device

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuron.git
   cd neuron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm start
   # In another terminal:
   npm run electron-dev
   ```

### Building for Production

**Windows:**
```bash
npm run dist-win
```

**macOS:**
```bash
npm run dist-mac
```

**Linux:**
```bash
npm run dist-linux
```

The built application will be available in the `dist/` directory.

## 🎯 Usage

1. **Open a vault** - Select a folder to use as your note vault
2. **Create notes** - Use `Ctrl+N` or the command palette
3. **Link notes** - Use `[[Note Name]]` to create connections
4. **Explore connections** - Switch to Graph view to see your knowledge network
5. **Use AI features** - Access the AI assistant for content help
6. **Organize notes** - Use the Note Organizer for bulk operations

### Keyboard Shortcuts
- `Ctrl+P` - Command Palette
- `Ctrl+Shift+P` - Quick Switcher
- `Ctrl+N` - New Note
- `Ctrl+S` - Save Note
- `Ctrl+G` - Graph View
- `Ctrl+E` - Editor View
- `Ctrl+K` - Canvas View

## 🛠️ Tech Stack

- **Frontend**: React 18, CSS3 with animations
- **Desktop**: Electron 22
- **File Watching**: Chokidar
- **Graph Visualization**: D3.js
- **Search**: Fuse.js
- **Markdown**: React Markdown with GFM support
- **Build**: electron-builder

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/neuron.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Start development**
   ```bash
   npm start
   npm run electron-dev
   ```

### Contribution Guidelines

- **Code Style**: Follow the existing code style and use meaningful variable names
- **Commits**: Use clear, descriptive commit messages
- **Testing**: Test your changes thoroughly before submitting
- **Documentation**: Update documentation for new features
- **Issues**: Check existing issues before creating new ones

### Types of Contributions

- 🐛 **Bug fixes** - Help us squash bugs
- ✨ **New features** - Add exciting functionality
- 📚 **Documentation** - Improve our docs
- 🎨 **UI/UX** - Enhance the user experience
- ⚡ **Performance** - Make Neuron faster
- 🧪 **Testing** - Add or improve tests

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Increase version numbers in package.json following [SemVer](http://semver.org/)
3. Your PR will be reviewed
4. Once approved, it will be merged into the main branch

## 📁 Project Structure

```
neuron/
├── public/
│   ├── electron.js      # Electron main process
│   ├── preload.js       # Preload script for IPC
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   │   ├── AIAssistant.js
│   │   ├── AdvancedGraphView.js
│   │   ├── Editor.js
│   │   └── ...
│   ├── App.js          # Main React app
│   ├── App.css         # Global styles
│   └── index.js        # React entry point
├── build/              # Built React app (generated)
├── dist/               # Packaged app (generated)
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### AI Services
Configure your AI service in Account Settings:
- **OpenAI**: Requires API key
- **Claude**: Requires Anthropic API key  
- **Gemini**: Requires Google AI API key

### Themes
Choose from built-in themes:
- Dark (default)
- Light
- Purple
- Blue

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Community

Join our community for support, feature requests, and discussions:

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/5WQsgCxfSm)

## 🙏 Acknowledgments

- Inspired by Obsidian's linking system and graph view
- Special thanks to all contributors and users

## 📊 Roadmap

### Core Features
- [ ] Plugin system for extensibility
- [ ] Advanced search with filters and regex support
- [ ] Export to various formats (PDF, HTML, DOCX, LaTeX)
- [ ] Import from other note apps (Obsidian, Notion, Roam)
- [ ] Full-text search with highlighting
- [ ] Note templates and snippets
- [ ] Folder-based organization with nested structures
- [ ] Note encryption and password protection

### Collaboration & Sync
- [ ] Cloud sync capabilities (Google Drive, Dropbox, OneDrive)
- [ ] Real-time collaborative editing
- [ ] Version history and conflict resolution
- [ ] Shared vaults with permission management
- [ ] Comment system for collaborative notes
- [ ] Live cursor tracking for co-editing

### Advanced Functionality
- [ ] Mathematical equation support (LaTeX/MathJax)
- [ ] Code execution blocks (Python, JavaScript, etc.)
- [ ] Embedded media support (videos, audio, PDFs)
- [ ] Advanced graph analytics (centrality, clustering)
- [ ] Custom CSS themes and styling
- [ ] Spaced repetition system for learning
- [ ] Daily notes and journal templates
- [ ] Task management with due dates and reminders

### AI & Automation
- [ ] AI-powered note summarization
- [ ] Automatic tag generation
- [ ] Smart content recommendations
- [ ] Voice-to-text note creation
- [ ] AI-assisted research and fact-checking
- [ ] Automatic link suggestions while typing
- [ ] Content translation between languages
- [ ] Meeting transcription and note generation

### Mobile & Cross-Platform
- [ ] Mobile companion app (iOS/Android)
- [ ] Web version for browser access
- [ ] Browser extension for web clipping
- [ ] API for third-party integrations
- [ ] Command-line interface (CLI)
- [ ] Vim keybindings support

### Performance & Developer Experience
- [ ] Faster file indexing for large vaults
- [ ] Background sync and caching
- [ ] Plugin marketplace and store
- [ ] Developer API documentation
- [ ] Automated testing suite
- [ ] Performance monitoring and analytics
- [ ] Memory usage optimization
- [ ] Startup time improvements

---

*Star ⭐ this repo if you find it useful!*
