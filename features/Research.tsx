// This feature component displays a detailed "deep dive" into the portfolio project itself.
// It is styled similarly to a timeline post to maintain a consistent look and feel.

import React from 'react';
import type { ResumeData } from '../types';
import { Github, FileText } from 'lucide-react';

// Defines the props for the Research component.
interface ResearchProps {
  resumeData: ResumeData;
  onOpenDoc: () => void;
}

export const Research: React.FC<ResearchProps> = ({ resumeData, onOpenDoc }) => {
  // Find the specific project data for this portfolio from the main data object.
  const portfolioProject = resumeData.projects.find(p => p.id === 1);

  // If the project data isn't found, render nothing.
  if (!portfolioProject) return null;

  return (
    <section>
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 pb-2">
        Project Deep Dive
      </h2>
      {/* Using the same flex layout as the timeline for consistency. */}
      <div className="flex gap-4">
        {/* Left column: Profile Picture & Vertical connecting line */}
        <div className="flex flex-col items-center flex-shrink-0">
          <img src={resumeData.profilePictureUrl} alt={resumeData.name} className="w-12 h-12 rounded-full object-cover" />
          <div className="w-px flex-grow bg-amber-500/20 mt-2"></div>
        </div>
        {/* Right column: Project Details Card */}
        <div className="flex-1 pb-8 min-w-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg shadow-black/5 p-5">
            <h3 className="font-bold text-[var(--text-color)]">{resumeData.name}</h3>
            <p className="text-xs text-[var(--subtle-text)] font-mono mb-3">Project Documentation</p>
            <h4 className="font-bold text-lg text-[var(--text-color)] mb-2">{portfolioProject.title}</h4>
            <p className="text-sm text-[var(--subtle-text)] mb-4 leading-relaxed">{portfolioProject.description}</p>
            {/* Tech Stack Section */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-[var(--text-color)] mb-2">Tech Stack:</h5>
              <div className="flex flex-wrap gap-2">
                {portfolioProject.technologies.map(tech => (
                  <span key={tech} className="bg-amber-500/10 text-[var(--header-text)] text-xs font-mono px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            {/* GitHub Link & Documentation Button */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-amber-500/10">
                {portfolioProject.links.github && (
                    <a href={portfolioProject.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors">
                        <Github size={16} />
                        View source on GitHub
                    </a>
                )}
                 <button onClick={onOpenDoc} className="inline-flex items-center gap-2 text-sm text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors">
                    <FileText size={16} />
                    Project Documentation
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
