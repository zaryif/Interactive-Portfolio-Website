// This feature component displays a social media-style timeline of posts.
// It renders the blog posts defined in the portfolio data.

import React from 'react';
import type { ResumeData, BlogPost } from '../types';
import { FileText, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Defines the props for the main Timeline component.
interface TimelineProps {
  resumeData: ResumeData;
}

// Defines the props for the TimelinePost sub-component.
interface TimelinePostProps {
  post: BlogPost;
  profile: { name: string, imageUrl: string };
}

// A sub-component for rendering a single post in the timeline.
const TimelinePost: React.FC<TimelinePostProps> = ({ post, profile }) => {
  // Filter attachments into separate arrays for images and PDFs.
  const imageAttachments = post.attachments?.filter(a => a.type === 'image') || [];
  const pdfAttachments = post.attachments?.filter(a => a.type === 'pdf') || [];
  
  return (
    <div className="flex gap-4">
      {/* Left column: Profile Picture & Vertical connecting line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <img src={profile.imageUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="w-px flex-grow bg-amber-500/20 mt-2"></div>
      </div>

      {/* Right column: Post Content */}
      <div className="flex-1 pb-8 min-w-0">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg shadow-black/5 p-5">
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--text-color)] truncate">{post.title}</h3>
                    </div>
                    <p className="text-xs text-[var(--subtle-text)] font-mono mb-3">{new Date(post.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            
            {/* Post content, rendered as Markdown */}
            <div className="prose prose-sm max-w-none prose-p:text-[var(--subtle-text)] prose-a:text-[var(--header-text)] mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
            
            {/* Image Attachments Grid */}
            {imageAttachments.length > 0 && (
              <div className="my-3 grid grid-cols-2 gap-2">
                {imageAttachments.map((img, index) => (
                  <img key={index} src={img.url} alt={img.name} className="rounded-lg object-cover w-full h-full" />
                ))}
              </div>
            )}

            {/* PDF Attachments List */}
            {pdfAttachments.length > 0 && (
              <div className="my-3 space-y-2">
                {pdfAttachments.map((pdf, index) => (
                  <a href={pdf.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-3 p-2 bg-gray-500/5 hover:bg-gray-500/10 rounded-lg transition-colors">
                    <FileText className="w-6 h-6 text-[var(--header-text)] flex-shrink-0" />
                    <span className="text-sm text-[var(--subtle-text)] truncate">{pdf.name}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Links / Comments Section */}
            {post.links && post.links.length > 0 && (
              <div className="mt-4 border-t border-[var(--border-color)] pt-3 space-y-2">
                {post.links.map((link, index) => (
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={index}
                    className="flex items-start gap-3 p-2 text-sm text-[var(--subtle-text)] hover:bg-gray-500/5 rounded-lg transition-colors"
                  >
                    <LinkIcon size={16} className="text-[var(--header-text)] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-color)]">{link.title}</p>
                      <p className="text-xs truncate">{link.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ resumeData }) => {
  // Initialize posts from props, sorted by date descending.
  const posts = [...resumeData.blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-pixel text-[var(--header-text)] border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
                Timeline
            </h2>
        </div>

        <div className="relative border-l-2 border-amber-500/20 ml-6 space-y-8">
            {posts.map(post => (
                <TimelinePost 
                    key={post.id} 
                    post={post} 
                    profile={{ name: resumeData.name, imageUrl: resumeData.profilePictureUrl }} 
                />
            ))}
             {posts.length === 0 && (
                <div className="text-[var(--subtle-text)] italic ml-4">No posts yet.</div>
            )}
        </div>
    </div>
  );
};

export default Timeline;