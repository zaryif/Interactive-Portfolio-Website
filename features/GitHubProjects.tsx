// This feature component fetches and displays a list of public repositories
// from a specified GitHub user's profile.

import React, { useState, useEffect } from 'react';
import type { GitHubRepo, Project } from '../types';
import { Spinner } from '../components/Spinner';
import { Star, GitFork, ExternalLink, AlertTriangle, WifiOff } from 'lucide-react';

// Defines the props for the main component.
interface GitHubProjectsProps {
  username: string; // The GitHub username to fetch repositories for.
  fallbackProjects?: Project[]; // Optional list of local projects to use if API fails.
}

// A sub-component for rendering a single repository as a clickable card.
const ProjectCard: React.FC<{ repo: GitHubRepo }> = ({ repo }) => (
    <a 
        href={repo.html_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5
                   backdrop-blur-lg
                   hover:border-amber-500/20 dark:hover:border-amber-500/20
                   transition-all duration-300 group flex flex-col h-full shadow-lg shadow-black/5"
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-md font-bold text-[var(--text-color)] pr-4 break-words">{repo.name}</h3>
            <ExternalLink size={18} className="text-[var(--subtle-text)] group-hover:text-[var(--header-text)] transition-colors flex-shrink-0" />
        </div>
        <p className="text-sm text-[var(--subtle-text)] flex-grow mb-4 line-clamp-3">
            {repo.description || 'No description provided.'}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 font-mono">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                <span>{repo.language || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                    <Star size={14} /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                    <GitFork size={14} /> {repo.forks_count}
                </span>
            </div>
        </div>
    </a>
);

export const GitHubProjects: React.FC<GitHubProjectsProps> = ({ username, fallbackProjects }) => {
  // State to store the fetched repositories.
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  // State to track the loading status.
  const [isLoading, setIsLoading] = useState(true);
  // State to store any errors that occur during fetching.
  const [error, setError] = useState<string | null>(null);
  // State to indicate if we are showing fallback data.
  const [usingFallback, setUsingFallback] = useState(false);

  // useEffect hook to fetch data from the GitHub API when the component mounts.
  useEffect(() => {
    const fetchRepos = async () => {
      // Reset state when username changes
      setIsLoading(true);
      setError(null);
      setUsingFallback(false);
      setRepos([]);

      if (!username) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch repositories, sorted by the last pushed date.
        // We use 'zaryif' if the username passed is 'zaryif', otherwise use the prop.
        const targetUser = username.toLowerCase() === 'zaryif' ? 'zaryif' : username;
        const response = await fetch(`https://api.github.com/users/${targetUser}/repos?sort=pushed`);
        
        if (response.status === 403) {
             throw new Error("GitHub API rate limit exceeded. Showing local projects instead.");
        }
        if (response.status === 404) {
             throw new Error(`GitHub user '${targetUser}' not found.`);
        }
        if (!response.ok) {
          throw new Error(`GitHub API Error (${response.status})`);
        }

        const data: GitHubRepo[] = await response.json();
        // Filter out forked repositories and sort the remaining ones by the number of stars.
        const sortedRepos = data.filter(repo => !repo.fork).sort((a, b) => b.stargazers_count - a.stargazers_count);
        setRepos(sortedRepos);
      } catch (err) {
        console.warn("GitHub API failed, attempting fallback.", err);
        
        // Fallback Logic: If API fails, try to use the provided fallback projects.
        if (fallbackProjects && fallbackProjects.length > 0) {
            const mappedRepos: GitHubRepo[] = fallbackProjects
                .filter(p => p.links.github) // Only use projects with GitHub links
                .map(p => ({
                    id: p.id,
                    name: p.title,
                    html_url: p.links.github!,
                    description: p.description,
                    stargazers_count: 0, // Fallback data doesn't have live stats
                    forks_count: 0,
                    language: p.technologies[0] || 'Project',
                    fork: false
                }));
            
            if (mappedRepos.length > 0) {
                setRepos(mappedRepos);
                setUsingFallback(true);
                // We successfully fell back, so we do NOT set the error state to visible UI.
                setIsLoading(false);
                return;
            }
        }
        // If no fallback available, show the error.
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();
  }, [username, fallbackProjects]); // The effect depends on the username and fallback data.

  if (!username) return null;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
          <h2 className="text-4xl font-pixel text-[var(--header-text)]">
            More on GitHub
          </h2>
          {/* Show a subtle indicator if we are using fallback data due to API limits */}
          {usingFallback && (
              <span className="text-xs text-[var(--subtle-text)] flex items-center gap-1 opacity-75 bg-amber-500/10 px-2 py-1 rounded-full">
                  <WifiOff size={12} />
                  Offline Mode / API Limited
              </span>
          )}
      </div>

       {/* Display a spinner while data is being fetched. */}
       {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Spinner />
        </div>
      )}
      
      {/* Display an error message if the fetch fails AND no fallback was available. */}
      {error && (
        <div className="flex flex-col items-center justify-center h-40 bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg p-4 text-center border border-red-500/20">
            <AlertTriangle size={32} className="mb-2" />
            <p className="font-semibold">Unable to load projects</p>
            <p className="text-sm px-4 opacity-80">{error}</p>
        </div>
      )}
      
      {/* Display a message if no repos found */}
      {!isLoading && !error && repos.length === 0 && (
         <div className="text-center text-[var(--subtle-text)] py-8">
            No public repositories found for {username}.
         </div>
      )}
      
      {/* Display the project cards once data is loaded successfully. */}
      {!isLoading && !error && repos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display up to the first 6 repositories. */}
          {repos.slice(0, 6).map((repo) => (
            <ProjectCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  );
};