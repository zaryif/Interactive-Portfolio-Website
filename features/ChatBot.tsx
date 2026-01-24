import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ResumeData, Tab } from '../types';
import { getGroundedChatResponse } from '../services/geminiService';
import { Send, Map, FileText, Briefcase, Clock, Sparkles, Mail, Download } from 'lucide-react';
import { Spinner } from '../components/Spinner';

// Defines the props for the ChatBot component.
interface ChatBotProps {
  resumeData: ResumeData;         // Portfolio data for context.
  setActiveTab: (tab: Tab) => void; // Function to change the main app tab.
  onClose: () => void;              // Function to close the chat modal.
}

// Pre-defined questions users can click to start a conversation.
const PROMPT_STARTERS = [
    "What are your top skills?",
    "What are your extracurricular activities?",
    "What are you studying?",
];

// A sub-component for displaying quick action buttons.
const QuickActions: React.FC<{ onAction: (action: Tab | 'download') => void }> = ({ onAction }) => {
    const actions = [
        { label: 'Resume', icon: FileText, action: 'Resume' as Tab },
        { label: 'Projects', icon: Briefcase, action: 'Projects' as Tab },
        { label: 'Timeline', icon: Clock, action: 'Timeline' as Tab },
        { label: 'AI Playground', icon: Sparkles, action: 'AI Playground' as Tab },
        { label: 'Contact', icon: Mail, action: 'Contact' as Tab },
        { label: 'Download CV', icon: Download, action: 'download' as const },
    ];

    return (
        <div className="my-4 p-3 bg-gray-500/10 rounded-lg">
            <h4 className="text-sm font-bold text-[var(--subtle-text)] mb-2 px-1">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
                {actions.map(({ label, icon: Icon, action }) => (
                    <button
                        key={label}
                        onClick={() => onAction(action)}
                        className="flex items-center gap-2 w-full text-left p-2 bg-gray-500/5 hover:bg-gray-500/10 rounded-md text-sm transition-colors text-[var(--text-color)]"
                    >
                        <Icon className="w-4 h-4 text-[var(--header-text)]" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


const ChatBot: React.FC<ChatBotProps> = ({ resumeData, setActiveTab, onClose }) => {
  // State to store the history of chat messages.
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm ZOSO AI, Zarif's personal assistant. Ask me anything, or use the quick actions below to navigate the site." }
  ]);
  // State for the user's current input in the text field.
  const [input, setInput] = useState('');
  // State to track if the AI is currently generating a response.
  const [isLoading, setIsLoading] = useState(false);
  // State to enable or disable Google Maps for grounding.
  const [useMaps, setUseMaps] = useState(false);
  // Ref to the end of the messages container for auto-scrolling.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to smoothly scroll to the latest message.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect hook to scroll to the bottom whenever the messages array changes.
  useEffect(scrollToBottom, [messages]);

  // Handles clicks on the quick action buttons.
  const handleQuickAction = (action: Tab | 'download') => {
    if (action === 'download') {
        // Construct a direct download link for the Google Drive file and trigger the download.
        let downloadUrl = resumeData.resumePdfUrl;
        try {
            // Robust parsing to support multiple Drive link formats
            const matchView = resumeData.resumePdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            const matchId = resumeData.resumePdfUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            const fileId = matchView?.[1] || matchId?.[1];

            if (fileId) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
        } catch(e) { console.error("Could not construct download URL", e); }
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'MD_ZARIF_AZFAR_Resume.pdf';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // If it's a navigation action, change the tab and close the chat.
        setActiveTab(action);
        onClose();
    }
  };

    // Toggles the use of Google Maps.
    const handleToggleMaps = () => {
        setUseMaps(prev => !prev);
    };


  // Handles sending a message to the AI.
  const handleSend = async (messageText: string = input) => {
    if (messageText.trim() === '' || isLoading) return; // Prevent sending empty or while loading.
    
    // Add the user's message to the chat history.
    const userMessage: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format the chat history for the API call.
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // Call the Gemini service.
      const response = await getGroundedChatResponse(history, messageText, useMaps, resumeData);
      
      // Extract grounding sources (e.g., from Google Search) if they exist.
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks
        ?.map((chunk: any) => chunk.web || chunk.maps)
        .filter(Boolean)
        .map((source: any) => ({ uri: source.uri, title: source.title })) || [];

      // Add the model's response to the chat history.
      const modelMessage: ChatMessage = { role: 'model', text: response.text, sources };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles clicks on the prompt starter buttons.
  const handlePromptStarterClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-[70vh] p-4">
      {/* Message display area */}
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-amber-600 dark:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
              <p>{msg.text}</p>
              {/* Render sources if they exist */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <h4 className="text-xs font-bold mb-1 text-gray-500 dark:text-gray-400">Sources:</h4>
                  <ul className="text-xs space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline break-all">
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {/* Show Quick Actions only in the initial greeting message. */}
              {msg.role === 'model' && index === 0 && <QuickActions onAction={handleQuickAction} />}
            </div>
          </div>
        ))}
        
        {/* Show prompt starters only at the beginning of the conversation. */}
        {messages.length === 1 && !isLoading && (
            <div className="pt-4 space-y-2">
                 <h4 className="text-sm font-bold text-[var(--subtle-text)] mb-2 px-1">Or, try a prompt...</h4>
                {PROMPT_STARTERS.map((prompt, i) => (
                    <button 
                        key={i}
                        onClick={() => handlePromptStarterClick(prompt)}
                        className="w-full text-left p-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-md text-sm transition-colors text-[var(--text-color)]"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        )}

        {/* Show a spinner while the model is generating a response. */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg">
              <Spinner />
            </div>
          </div>
        )}
        {/* This div is the target for auto-scrolling. */}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500"
              disabled={isLoading}
            />
             <button
              onClick={handleToggleMaps}
              className={`p-2 rounded-md transition-colors ${useMaps ? 'bg-amber-600 dark:bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-600'}`}
              title="Toggle Google Maps Grounding"
            >
              <Map size={20} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || input.trim() === ''}
              className="bg-amber-600 dark:bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
      </div>
    </div>
  );
};

export default ChatBot;