// A reusable card component for displaying an AI tool in the "AI Playground".
// It shows the tool's icon, name, and description, and is clickable to launch the tool.

import React from 'react';
import type { PlaygroundApp } from '../types';

// Defines the props that the PlaygroundAppCard component accepts.
interface PlaygroundAppCardProps {
  app: PlaygroundApp;     // The PlaygroundApp object containing the tool's metadata.
  onClick: () => void; // A callback function to execute when the card is clicked.
}

export const PlaygroundAppCard: React.FC<PlaygroundAppCardProps> = ({ app, onClick }) => {
  return (
    <div 
      onClick={onClick}
      // Styling for the card, including hover effects and transitions.
      className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col cursor-pointer
                 backdrop-blur-lg
                 hover:border-amber-500/20 dark:hover:border-amber-500/20
                 transition-all duration-300 group shadow-lg shadow-black/5"
    >
      {/* Top section with icon and name. */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-amber-500/10 dark:bg-amber-500/10 p-3 rounded-lg group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/20 transition-colors">
          {/* Dynamically render the icon component provided in the app object. */}
          <app.icon className="w-6 h-6 text-[var(--header-text)]" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-color)]">{app.name}</h3>
      </div>
      {/* Description text that fills the remaining space. */}
      <p className="text-[var(--subtle-text)] text-sm flex-grow">{app.description}</p>
    </div>
  );
};
