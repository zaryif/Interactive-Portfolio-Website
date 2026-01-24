// A reusable component to display the "Additional Info" section,
// including skills, languages, and social media links.

import React from 'react';
import type { ResumeData } from '../types';
import { Linkedin, Instagram, Facebook, Github, Mail } from 'lucide-react';

// A mapping from social media platform names (lowercase) to their corresponding Lucide icon components.
// This allows for dynamic icon rendering based on the data.
const platformIcons: { [key: string]: React.ElementType } = {
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
    github: Github,
    gmail: Mail,
};

// Defines the props that the AdditionalInfo component accepts.
interface AdditionalInfoProps {
  info: ResumeData['additionalInfo']; // The 'additionalInfo' part of the main resume data.
}

export const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ info }) => {
  return (
    <section>
      {/* Section heading with a custom pixelated font. */}
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Additional Info
      </h2>
      <div className="space-y-4">
        {/* Skills Section */}
        <div>
          <h3 className="font-semibold text-[var(--text-color)]">Skills:</h3>
          <p className="text-[var(--subtle-text)]">{info.skills.join(', ')}</p>
        </div>
        {/* Languages Section */}
        <div>
          <h3 className="font-semibold text-[var(--text-color)]">Languages:</h3>
          <p className="text-[var(--subtle-text)]">{info.languages.join(', ')}</p>
        </div>
        {/* Social Media Section */}
        <div>
          <h3 className="font-semibold text-[var(--text-color)]">Social Media:</h3>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-2">
            {/* Map over the socialMedia array to render each link. */}
            {info.socialMedia.map((social) => {
                // Look up the correct icon component from the `platformIcons` map.
                const Icon = platformIcons[social.platform.toLowerCase()];
                return (
                    <a 
                        key={social.platform} 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors"
                        title={social.platform}
                        aria-label={`Link to my ${social.platform} profile`}
                    >
                        {/* Render the icon if it was found. */}
                        {Icon && <Icon size={20} />}
                        <span className="font-mono text-sm">{social.handle}</span>
                    </a>
                );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
