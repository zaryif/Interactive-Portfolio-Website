// This feature component serves as the main view for the "Projects" tab.
// It composes two sub-components: the "Project Deep Dive" (Research) and the list of GitHub projects.

import React from 'react';
import type { ResumeData } from '../types';
import { GitHubProjects } from './GitHubProjects';
import { Research } from './Research';

// Defines the props for the Projects component.
interface ProjectsProps {
  resumeData: ResumeData;
  onOpenDoc: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ resumeData, onOpenDoc }) => {
  // Extract GitHub username. 
  // We prioritize the handle from the resume data but default to 'zaryif' 
  // to ensures the correct profile is loaded even if the data parsing fails.
  const getGithubUsername = () => {
    const githubLink = resumeData.additionalInfo.socialMedia.find(
      s => s.platform.toLowerCase() === 'github'
    );
    
    // Explicitly check for 'zaryif' in the handle to confirm identity, 
    // or return the handle found.
    if (githubLink && githubLink.handle) {
      const handle = githubLink.handle.replace('@', '').trim();
      // If the handle is 'zaryif' (case-insensitive), return it.
      // This is just to be absolutely sure we match the user's request.
      if (handle.toLowerCase() === 'zaryif') return 'zaryif';
      return handle;
    }
    
    // Default fallback to 'zaryif' as requested by the user.
    return 'zaryif';
  };

  return (
    // The `animate-fade-in` class provides a simple fade-in animation on load.
    <div className="space-y-12 animate-fade-in">
      {/* The Research component displays a detailed look at the portfolio project itself. */}
      <Research resumeData={resumeData} onOpenDoc={onOpenDoc} />
      {/* The GitHubProjects component fetches and displays other projects from GitHub. 
          We pass `resumeData.projects` as a fallback so the UI never breaks. */}
      <GitHubProjects 
        username={getGithubUsername()} 
        fallbackProjects={resumeData.projects}
      />
    </div>
  );
};

export default Projects;