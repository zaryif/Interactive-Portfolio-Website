// This feature component serves as the main view for the "AI Playground" tab.
// It displays a list of available AI tools (Playground Apps) that the user can launch.

import React from 'react';
import { PLAYGROUND_APPS } from '../constants'; // Import the list of apps from the constants file.
import { PlaygroundAppCard } from '../components/GeminiAppCard'; // The card component for each app.

// Defines the props for the AIPlayground component.
interface AIPlaygroundProps {
    // A callback function that is called with the app's ID when a card is clicked.
    // This will be used by the parent component (App.tsx) to open the correct modal.
    onAppClick: (appId: string) => void;
}

const AIPlayground: React.FC<AIPlaygroundProps> = ({ onAppClick }) => {
  return (
    <section className="animate-fade-in">
        <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
            AI Playground
        </h2>
        <p className="mb-8 text-[var(--subtle-text)] max-w-3xl">
            This portfolio is more than just a document—it's an interactive showcase. Explore the power of AI through these custom-built mini-apps. Click on any card to launch the tool.
        </p>
        {/* The list of AI tools, displayed in a responsive grid. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Map over the PLAYGROUND_APPS array to render a card for each tool. */}
            {PLAYGROUND_APPS.map((app) => (
                <PlaygroundAppCard key={app.id} app={app} onClick={() => onAppClick(app.id)} />
            ))}
        </div>
    </section>
  );
};

export default AIPlayground;
