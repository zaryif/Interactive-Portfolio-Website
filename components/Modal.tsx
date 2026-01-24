// A reusable, accessible Modal component for displaying content in a focused overlay.

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Defines the props that the Modal component accepts.
interface ModalProps {
  isOpen: boolean;         // Controls whether the modal is visible.
  onClose: () => void;     // A callback function to close the modal.
  title: string;           // The title displayed in the modal's header.
  children: React.ReactNode; // The content to be rendered inside the modal.
  noPadding?: boolean;     // If true, removes the default padding from the main content area.
  size?: 'default' | 'fullscreen'; // Defines the size of the modal.
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, noPadding = false, size = 'default' }) => {
  // useEffect hook to add a keyboard event listener for the "Escape" key.
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Close the modal if "Escape" is pressed.
      }
    };
    window.addEventListener('keydown', handleEsc);
    // Cleanup function: remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  // Determine CSS classes based on the `size` prop.
  const wrapperClasses = size === 'fullscreen' ? 'p-0' : 'p-4';
  const panelClasses = size === 'fullscreen' 
    ? 'w-screen h-screen max-w-none max-h-none rounded-none' // Fullscreen styles
    : 'w-full max-w-3xl max-h-[90vh] rounded-xl';         // Default styles

  return (
    // The modal overlay, which covers the entire screen.
    // Clicking the overlay will close the modal.
    <div 
      className={`fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300 ${wrapperClasses}`}
      onClick={onClose}
    >
      {/* The modal panel itself. */}
      {/* `e.stopPropagation()` prevents a click inside the panel from closing the modal. */}
      <div 
        className={`bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl flex flex-col ${panelClasses}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)] flex-shrink-0">
          <h2 className="text-2xl font-pixel text-[var(--header-text)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-[var(--subtle-text)] hover:text-[var(--text-color)] hover:bg-gray-500/10 rounded-full p-1 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </header>
        {/* Modal Body */}
        {/* The `noPadding` prop controls whether the default 'p-6' is applied. */}
        <main className={`flex-1 ${noPadding ? '' : 'p-6'} overflow-y-auto text-[var(--text-color)]`}>
          {children}
        </main>
      </div>
    </div>
  );
};
