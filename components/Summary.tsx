// A reusable component to display the "About Me" summary section.
// It shows a profile picture alongside the summary text.

import React from 'react';

// Defines the props that the Summary component accepts.
interface SummaryProps {
  summary: string; // The summary text content.
  profilePictureUrl: string; // The URL for the user's profile picture.
}

export const Summary: React.FC<SummaryProps> = ({ summary, profilePictureUrl }) => {
  return (
    <section>
      {/* Section heading with a custom pixelated font. */}
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-4 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        About Me
      </h2>
      {/* Flex container for the image and text, with responsive direction. */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <img 
          src={profilePictureUrl} 
          alt="MD Zarif Azfar"
          className="w-32 h-32 rounded-full object-cover border-4 border-amber-500/20 dark:border-amber-500/20 shadow-lg flex-shrink-0"
        />
        <p className="text-[var(--text-color)] leading-relaxed">{summary}</p>
      </div>
    </section>
  );
};
