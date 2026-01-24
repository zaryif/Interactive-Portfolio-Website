// This file contains TypeScript type definitions for the data structures used throughout the application.
// Centralizing types helps ensure data consistency and improves code readability and maintainability.

import type React from 'react';

/**
 * Defines the structure for a structured link with a URL and a title.
 * Used for comments/links on timeline posts.
 */
export interface Link {
  url: string;
  title: string;
}

// Defines the structure for a file attachment, which can be an image or a PDF.
export interface Attachment {
  type: 'image' | 'pdf'; // The type of the file.
  name: string;          // The original filename.
  url: string;           // The base64 encoded data URL for previewing.
}

// Defines the structure for a single blog or timeline post.
export interface BlogPost {
  id: number;              // Unique identifier for the post.
  title: string;           // The title of the post.
  date: string;            // The publication date in ISO format.
  content: string;         // The main content of the post (can be Markdown).
  links?: Link[];          // An array of optional structured links/comments.
  attachments?: Attachment[]; // An array of optional file attachments.
  imageUrl?: string;         // An optional cover image URL (used in older components).
}

// Defines the structure for a single project.
export interface Project {
  id: number;                // Unique identifier for the project.
  title: string;             // The name of the project.
  imageUrl: string;          // A URL for the project's cover image.
  description: string;       // A detailed description of the project.
  technologies: string[];    // A list of technologies used.
  links: {
    github?: string;         // An optional link to the GitHub repository.
    live?: string;           // An optional link to a live demo.
  };
}

// Defines the main data structure for the entire portfolio.
// This is fetched from `portfolio-data.json`.
export interface ResumeData {
  name: string;              // The owner's full name.
  profilePictureUrl: string; // URL for the profile picture.
  resumePdfUrl: string;      // URL for the resume PDF.
  contact: {
    location: string;
    phone: string;
    email: string;
  };
  summary: string;           // The "About Me" summary text.
  education: EducationItem[];// An array of educational experiences.
  activities: ActivityItem[];// An array of extracurricular activities.
  additionalInfo: {
    skills: string[];
    languages: string[];
    socialMedia: SocialLink[];
  };
  projects: Project[];       // An array of featured projects.
  blogPosts: BlogPost[];     // An array of blog/timeline posts.
}

// Defines the structure for an item in the education section.
export interface EducationItem {
  degree: string;
  institution: string;
  duration: string;
  details?: string[];      // Optional bullet points (like GPA, group).
}

// Defines the structure for an item in the activities section.
export interface ActivityItem {
  role: string;
  organization: string;
  duration: string;
  details: string[];       // Bullet points describing responsibilities.
}

// Defines the structure for a social media link.
export interface SocialLink {
  platform: string;        // The name of the platform (e.g., 'Linkedin').
  handle: string;          // The user handle (e.g., '@zaryif').
  url: string;             // The full URL to the profile.
}

// Defines the structure for an AI tool in the AI Playground.
export interface PlaygroundApp {
  id: string;              // A unique ID for the app (used for rendering).
  name: string;            // The display name of the app.
  description: string;     // A short description of what the app does.
  icon: React.ElementType; // The Lucide icon component to display.
}

// Defines the structure for a single message in the AI Chat.
export interface ChatMessage {
  role: 'user' | 'model';  // Who sent the message.
  text: string;            // The content of the message.
  sources?: { uri: string; title: string }[]; // Optional sources from grounded generation.
}

// Defines the structure for a repository fetched from the GitHub API.
export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  fork: boolean;           // Whether the repository is a fork of another.
}

// Defines the possible values for the main navigation tabs.
// Using a union type provides type safety when setting the active tab.
export type Tab = 'Resume' | 'Projects' | 'Timeline' | 'AI Playground' | 'Contact';
