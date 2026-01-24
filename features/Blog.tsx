// This feature component is a simple presentation component for displaying a grid of blog posts.
// Note: This component is currently not used in the main App.tsx, as the Timeline feature has superseded it.
// It remains as a potential alternative layout for posts.

import React from 'react';
import type { BlogPost } from '../types';
import { ExternalLink } from 'lucide-react';

// Defines the props for the main Blog component.
interface BlogProps {
  posts: BlogPost[];
}

// A sub-component for rendering a single blog post as a card.
const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <div
        className="block bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl
                   backdrop-blur-lg
                   transition-all duration-300 flex flex-col h-full shadow-lg shadow-black/5 overflow-hidden"
    >
        {/* Conditionally render an image if one is provided. */}
        {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover" />
        )}
        <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-md font-bold text-[var(--text-color)] pr-4">{post.title}</h3>
                {/* Conditionally render an external link icon if a link is provided. */}
                {/* FIX: Corrected property access from 'post.link' to 'post.links' and checked for array content. */}
                {post.links && post.links.length > 0 && (
                     <a href={post.links[0].url} target="_blank" rel="noopener noreferrer" className="text-[var(--subtle-text)] hover:text-[var(--header-text)] transition-colors flex-shrink-0">
                        <ExternalLink size={18} />
                     </a>
                )}
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mb-3">{post.date}</p>
            <p className="text-sm text-[var(--subtle-text)] flex-grow">
                {post.content}
            </p>
        </div>
    </div>
);


export const Blog: React.FC<BlogProps> = ({ posts }) => {
  // If there are no posts, don't render anything.
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        My Thoughts & Updates
      </h2>
      {/* Grid layout for the blog post cards. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};
