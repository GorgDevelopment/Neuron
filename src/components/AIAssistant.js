import React, { useState, useEffect } from 'react';

function AIAssistant({ currentContent, onInsertText, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [features] = useState([
    { id: 'summarize', name: 'Summarize', icon: '📝', prompt: 'Summarize this content in 3-5 bullet points:' },
    { id: 'expand', name: 'Expand Ideas', icon: '💡', prompt: 'Expand on these ideas with more details and examples:' },
    { id: 'questions', name: 'Generate Questions', icon: '❓', prompt: 'Generate 5 thoughtful questions about this content:' },
    { id: 'connections', name: 'Find Connections', icon: '🔗', prompt: 'What connections can be made with this content? Suggest related topics:' },
    { id: 'improve', name: 'Improve Writing', icon: '✨', prompt: 'Improve the clarity and structure of this writing:' },
    { id: 'translate', name: 'Translate', icon: '🌐', prompt: 'Translate this content to another language:' }
  ]);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const callOpenAI = async (prompt, content) => {
    if (!apiKey) {
      setResponse('Please set your OpenAI API key in the settings first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for a note-taking app. Provide clear, concise, and useful responses.' },
            { role: 'user', content: `${prompt}\n\n${content}` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setResponse(data.choices[0].message.content);
      } else {
        setResponse('Error: Unable to get AI response');
      }
    } catch (error) {
      setResponse('Error: Failed to connect to AI service');
    }
    setIsLoading(false);
  };

  const handleFeatureClick = (feature) => {
    if (!currentContent.trim()) {
      setResponse('Please select some text or have content in your note first.');
      return;
    }
    callOpenAI(feature.prompt, currentContent);
  };

  const handleCustomQuery = () => {
    if (!query.trim()) return;
    callOpenAI(query, currentContent);
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
  };

  return (
    <div className={`ai-assistant-overlay ${isOpen ? 'open' : ''}`}>
      <div className="ai-assistant">
        <div className="ai-header">
          <h3>🤖 AI Assistant</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {!apiKey && (
          <div className="api-key-setup">
            <p>Set your OpenAI API key to enable AI features:</p>
            <div className="api-key-input">
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button onClick={saveApiKey}>Save</button>
            </div>
          </div>
        )}

        <div className="ai-features">
          <h4>Quick Actions</h4>
          <div className="feature-grid">
            {features.map(feature => (
              <button
                key={feature.id}
                className="feature-btn"
                onClick={() => handleFeatureClick(feature)}
                disabled={isLoading}
              >
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-name">{feature.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="custom-query">
          <h4>Custom Query</h4>
          <div className="query-input">
            <input
              type="text"
              placeholder="Ask anything about your content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
            />
            <button onClick={handleCustomQuery} disabled={isLoading}>
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>

        {response && (
          <div className="ai-response">
            <div className="response-header">
              <h4>AI Response</h4>
              <button 
                className="insert-btn"
                onClick={() => onInsertText(response)}
              >
                Insert into Note
              </button>
            </div>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
