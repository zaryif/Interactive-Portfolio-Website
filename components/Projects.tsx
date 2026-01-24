// A reusable component to display a grid of "Featured Projects".
// Note: This component renders projects from the local `portfolio-data.json` file.
// The main "Projects" tab currently uses `features/Projects.tsx` which integrates a GitHub feed instead.
// This component is kept for potential future use or alternative layouts.

import React from 'react';
import type { Project } from '../types';
import { Github, ExternalLink } from 'lucide-react';

// Defines the props that the main Projects component accepts.
interface ProjectsProps {
  projects: Project[]; // An array of project objects.
}

// A sub-component for rendering a single project as a card.
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden
                 backdrop-blur-lg transition-all duration-300 shadow-lg shadow-black/5">
    <img src={project.imageUrl} alt={project.title} className="w-full h-56 object-cover" />
    <div className="p-6">
      <h3 className="text-xl font-bold text-[var(--text-color)] mb-3">{project.title}</h3>
      <p className="text-sm text-[var(--subtle-text)] mb-4 leading-relaxed">{project.description}</p>
      {/* Technologies Used Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-[var(--text-color)] mb-2">Technologies Used:</h4>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map(tech => (
            <span key={tech} className="bg-amber-500/10 text-[var(--header-text)] text-xs font-mono px-2 py-1 rounded">
              {tech}
            </span>
          ))}
        </div>
      </div>
      {/* Project Links (GitHub, Live Demo) */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-amber-500/10">
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors">
            <Github size={18} />
            <span>GitHub</span>
          </a>
        )}
        {project.links.live && (
          <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors">
            <ExternalLink size={18} />
            <span>Live Demo</span>
          </a>
        )}
      </div>
    </div>
  </div>
);

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section>
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map over the projects array to render a card for each one. */}
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
