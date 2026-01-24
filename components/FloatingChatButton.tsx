// A reusable Floating Action Button (FAB) component.
// It is used to provide a persistent, easily accessible button to open the AI chat assistant.

import React from 'react';
import { MessageSquare } from 'lucide-react';

// Defines the props for the FloatingChatButton component.
interface FloatingChatButtonProps {
    onClick: () => void; // A callback function to execute when the button is clicked.
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // Styling for the button, positioning it in the bottom-right corner.
      // Includes hover and focus effects for better user experience.
      className="fixed bottom-6 right-6 bg-amber-600 dark:bg-amber-600 text-white rounded-full p-4 shadow-lg hover:bg-amber-700 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110 z-40"
      aria-label="Open AI Assistant"
    >
      <MessageSquare size={28} />
    </button>
  );
};
