// The main component that orchestrates the entire application.
// It manages the overall state, routing between tabs, and rendering of modals.

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { PLAYGROUND_APPS } from './constants';
import { Spinner } from './components/Spinner';
import { FloatingChatButton } from './components/FloatingChatButton';
import type { ResumeData, Tab } from './types';

// Lazy load feature components to improve initial page load time.
// Components are only downloaded by the browser when they are first needed.
const ChatBot = lazy(() => import('./features/ChatBot'));
const ImageGenerator = lazy(() => import('./features/ImageGenerator'));
const VideoGenerator = lazy(() => import('./features/VideoGenerator'));
const LiveConvo = lazy(() => import('./features/LiveConvo'));
const ComplexSolver = lazy(() => import('./features/ComplexSolver'));
const ProjectAnalyzer = lazy(() => import('./features/ProjectAnalyzer'));
const Humanizer = lazy(() => import('./features/Humanizer'));
const AIDetector = lazy(() => import('./features/AIDetector'));
const PromptEnhancer = lazy(() => import('./features/PromptEnhancer'));
const Timeline = lazy(() => import('./features/Timeline'));
const Resume = lazy(() => import('./features/Resume'));
const Projects = lazy(() => import('./features/Projects'));
const AIPlayground = lazy(() => import('./features/AIPlayground'));
const Contact = lazy(() => import('./features/Contact'));
const Documentation = lazy(() => import('./features/Documentation'));


// Define the possible theme types
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // State to manage which AI tool modal is currently open. `null` means no modal is open.
  const [activeApp, setActiveApp] = useState<string | null>(null);
  // State to manage the visibility of the floating AI assistant chat modal.
  const [isChatOpen, setIsChatOpen] = useState(false);
  // State to manage the visibility of the project documentation modal.
  const [isDocOpen, setIsDocOpen] = useState(false);
  // State for the current theme ('light' or 'dark'). Defaults to 'dark'.
  const [theme, setTheme] = useState<Theme>('dark');
  // State to hold the portfolio data fetched from the JSON file.
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  // State to manage which main tab is currently active. Defaults to 'Resume'.
  const [activeTab, setActiveTab] = useState<Tab>('Resume');

  // useEffect hook to run side effects after component mounts.
  useEffect(() => {
    // Fetch the main portfolio data from the public JSON file.
    fetch('/portfolio-data.json')
      .then(response => response.json())
      .then(data => setResumeData(data))
      .catch(error => console.error("Failed to load portfolio data:", error));

    // Initialize the theme based on what's saved in localStorage or default to 'dark'.
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    // Apply the theme class to the root HTML element.
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
  }, []); // The empty dependency array `[]` ensures this runs only once on mount.

  // Function to toggle the theme between light and dark.
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save the new theme preference.
    // Update the class on the root HTML element to apply new CSS variables.
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  // Renders the component for the currently active AI tool inside a modal.
  const renderActiveAppComponent = () => {
    if (!resumeData) return <Spinner />; // Show spinner if data isn't loaded yet.
    switch (activeApp) {
      case 'chatbot':
        return <ChatBot resumeData={resumeData} setActiveTab={setActiveTab} onClose={() => setActiveApp(null)} />;
      case 'imageGen':
        return <ImageGenerator />;
      case 'videoGen':
        return <VideoGenerator />;
      case 'liveConvo':
        return <LiveConvo />;
      case 'complexSolver':
        return <ComplexSolver />;
      case 'projectAnalyzer':
        return <ProjectAnalyzer />;
      case 'humanizer':
        return <Humanizer />;
      case 'aiDetector':
        return <AIDetector />;
      case 'promptEnhancer':
        return <PromptEnhancer />;
      default:
        return null; // No app selected.
    }
  };

  // Define the order and names of the main navigation tabs.
  const TABS: Tab[] = ['Resume', 'Projects', 'Timeline', 'AI Playground', 'Contact'];

  // Renders the content for the currently active main tab.
  const renderTabContent = () => {
    if (!resumeData) return <Spinner />;
    // Fallback UI to show while a lazy-loaded component is loading.
    const fallback = <div className="flex justify-center p-8"><Spinner /></div>;
    
    switch (activeTab) {
      case 'Resume':
        return <Suspense fallback={fallback}><Resume resumeData={resumeData} /></Suspense>;
      case 'Timeline':
        return <Suspense fallback={fallback}><Timeline resumeData={resumeData} /></Suspense>;
      case 'Projects':
        return <Suspense fallback={fallback}><Projects resumeData={resumeData} onOpenDoc={() => setIsDocOpen(true)} /></Suspense>;
      case 'AI Playground':
        return <Suspense fallback={fallback}><AIPlayground onAppClick={setActiveApp} /></Suspense>;
      case 'Contact':
        return <Suspense fallback={fallback}><Contact resumeData={resumeData} /></Suspense>;
      default:
        return null;
    }
  };


  // Show a full-page spinner while waiting for the initial portfolio data to load.
  if (!resumeData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // Determines if the modal should have padding. Some modals (like chat) manage their own spacing.
  const modalNeedsPadding = !['chatbot', 'liveConvo'].includes(activeApp || '');

  return (
    // Main container with padding and transition for theme changes.
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      {/* Main card-like layout with backdrop blur, shadow, and border. */}
      <div className="max-w-7xl mx-auto bg-[var(--card-bg)] backdrop-blur-3xl rounded-2xl shadow-2xl shadow-amber-500/10 dark:shadow-amber-500/10 p-4 sm:p-8 border border-[var(--border-color)]">
        {/* Renders the top header with name, contact info, and theme toggle. */}
        <Header data={resumeData} theme={theme} toggleTheme={toggleTheme} />
        
        {/* Main navigation bar for switching between tabs. */}
        <nav className="my-8 border-b-2 border-amber-500/10 dark:border-amber-500/10">
          <ul className="flex items-center justify-between sm:justify-start w-full sm:w-auto sm:gap-8 -mb-px text-sm sm:text-base">
            {TABS.map(tab => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  // Dynamically sets the style for active vs. inactive tabs.
                  className={`px-1 py-3 font-semibold whitespace-nowrap transition-colors duration-300
                    ${activeTab === tab 
                      ? 'border-b-2 border-[var(--header-text)] text-[var(--header-text)]' 
                      : 'text-[var(--subtle-text)] hover:text-[var(--text-color)] border-b-2 border-transparent'}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* The main content area where the active tab's component is rendered. */}
        <main>
          {renderTabContent()}
        </main>
      </div>

      {/* Modal for displaying the selected AI tool. */}
      {activeApp && (
        <Modal
          isOpen={!!activeApp}
          onClose={() => setActiveApp(null)}
          title={PLAYGROUND_APPS.find(app => app.id === activeApp)?.name || 'AI Tool'}
          noPadding={!modalNeedsPadding}
        >
          {/* Suspense is used here again for the lazy-loaded modal content. */}
          <Suspense fallback={<div className="flex justify-center items-center h-64"><Spinner /></div>}>
            {renderActiveAppComponent()}
          </Suspense>
        </Modal>
      )}

      {/* Modal for Project Documentation. */}
      {isDocOpen && (
        <Modal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} title="Project Documentation" size="fullscreen">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><Spinner /></div>}>
            <Documentation />
          </Suspense>
        </Modal>
      )}

      {/* Floating Action Button to open the AI Chat Assistant. */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
       {/* Modal for the AI Chat Assistant. */}
       {isChatOpen && resumeData && (
        <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="ZOSO AI" noPadding={true}>
          <Suspense fallback={<div className="flex justify-center items-center h-64"><Spinner /></div>}>
            {/* The ChatBot component is rendered inside the modal. */}
            <ChatBot resumeData={resumeData} setActiveTab={setActiveTab} onClose={() => setIsChatOpen(false)}/>
          </Suspense>
        </Modal>
      )}
    </div>
  );
};

export default App;
