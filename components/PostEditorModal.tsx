// A modal component for creating and editing timeline posts.
// It includes fields for title, content, a link, and multiple file attachments.

import React, { useState, useEffect } from 'react';
import type { BlogPost, Attachment, Link } from '../types';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { Save, Image as ImageIcon, FileText, X } from 'lucide-react';

// Defines the props for the PostEditorModal component.
interface PostEditorModalProps {
  isOpen: boolean;    // Controls whether the modal is visible.
  onClose: () => void; // A callback function to close the modal.
  // A callback function to save the post data.
  onSave: (post: Omit<BlogPost, 'id' | 'date'> & { id?: number }) => void;
  postToEdit: BlogPost | null; // The post to edit, or null if creating a new post.
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({ isOpen, onClose, onSave, postToEdit }) => {
  // State for each form field.
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [currentLink, setCurrentLink] = useState<Link>({ url: '', title: '' });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // useEffect hook to populate the form when editing a post.
  useEffect(() => {
    if (isOpen) {
        if (postToEdit) {
            // If `postToEdit` is provided, fill the form with its data.
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setLinks(postToEdit.links || []);
            setAttachments(postToEdit.attachments || []);
        } else {
            // If creating a new post, reset the form to be empty.
            setTitle('');
            setContent('');
            setLinks([]);
            setAttachments([]);
        }
        // Reset the temporary input for a new link whenever the modal is opened.
        setCurrentLink({ url: '', title: '' });
    }
  }, [postToEdit, isOpen]); // Reruns when the modal is opened or the post to edit changes.

  // Handles new file uploads for attachments.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Process each selected file.
      // FIX: Explicitly type `file` as `File` to resolve type inference issues.
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newAttachment: Attachment = {
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'pdf',
            url: reader.result as string, // The file content as a base64 data URL.
          };
          setAttachments(prev => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Removes an attachment from the preview list.
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Adds the current link from the input fields to the list of links.
  const handleAddLink = () => {
    // Basic validation for the link.
    if (currentLink.url.trim() && currentLink.title.trim()) {
      setLinks(prev => [...prev, currentLink]);
      // Reset the input fields for the next link.
      setCurrentLink({ url: '', title: '' });
    }
  };

  // Removes a link from the list.
  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };


  // Handles the save button click.
  const handleSave = async () => {
    setIsSaving(true);
    
    // Call the onSave callback with the current form data.
    onSave({
      id: postToEdit?.id,
      title,
      content,
      links,
      attachments,
    });
    
    // Simulate a short delay for UX purposes.
    await new Promise(res => setTimeout(res, 300));
    setIsSaving(false);
    onClose(); // Close the modal after saving.
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={postToEdit ? 'Edit Post' : 'Create New Post'}>
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Post title"
          />
        </div>
        {/* Content Textarea (Markdown supported) */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Content*</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Write your post content here. Markdown is supported..."
          ></textarea>
        </div>
        
        {/* Attachment Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Attachments</label>
          <input type="file" multiple onChange={handleFileChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-500/10 p-1.5 rounded-full text-sm">
                {file.type === 'image' ? <ImageIcon size={16} className="text-[var(--header-text)]" /> : <FileText size={16} className="text-[var(--header-text)]" />}
                <span className="max-w-xs truncate text-[var(--subtle-text)]">{file.name}</span>
                <button onClick={() => removeAttachment(index)} className="p-0.5 rounded-full hover:bg-red-500/10 text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Link Input */}
        <div>
            <label className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Add a Link</label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={currentLink.title} onChange={e => setCurrentLink(p => ({...p, title: e.target.value}))} placeholder="Link Title" className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md px-3 py-1.5 text-sm" />
                <input type="url" value={currentLink.url} onChange={e => setCurrentLink(p => ({...p, url: e.target.value}))} placeholder="https://example.com" className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md px-3 py-1.5 text-sm" />
                <button onClick={handleAddLink} className="sm:w-auto text-sm bg-gray-500/10 hover:bg-gray-500/20 px-4 py-1.5 rounded-md transition-colors">Add</button>
            </div>
            <div className="mt-2 space-y-1">
                {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-500/5 p-1.5 rounded">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-500 hover:underline truncate">{link.title}</a>
                        <button onClick={() => handleRemoveLink(index)} className="p-0.5 rounded-full hover:bg-red-500/10 text-red-500 ml-2"><X size={14} /></button>
                    </div>
                ))}
            </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
          <button onClick={handleSave} disabled={isSaving || !content.trim()} className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed">
            {isSaving ? <Spinner /> : <Save size={20} />}
            <span>{isSaving ? 'Saving...' : 'Save Post'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
