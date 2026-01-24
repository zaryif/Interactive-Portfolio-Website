// A simple, reusable SVG spinner component to indicate loading states.

import React from 'react';

export const Spinner: React.FC = () => (
  // The SVG uses CSS animations for the spinning effect.
  // The color is inherited from the parent's text color via `text-[var(--header-text)]`.
  <svg 
    className="animate-spin h-8 w-8 text-[var(--header-text)]" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    ></circle>
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
