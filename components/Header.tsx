// A reusable component for the main header of the portfolio.
// It displays the user's name, contact information, and a theme toggle button.

import React from 'react';
import type { ResumeData } from '../types';
import { Mail, Phone, MapPin, Sun, Moon } from 'lucide-react';

// Defines the props that the Header component accepts.
interface HeaderProps {
  data: ResumeData; // The main portfolio data object.
  theme: 'light' | 'dark'; // The current theme.
  toggleTheme: () => void; // A function to switch the theme.
}

export const Header: React.FC<HeaderProps> = ({ data, theme, toggleTheme }) => {
  // Split the name for a responsive layout on mobile.
  const nameParts = data.name.split(' ');
  const lastNamePart = nameParts.pop() || '';
  const firstNamePart = nameParts.join(' ');

  return (
    <header className="border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-6 relative">
      {/* Theme toggle button positioned at the top right corner. */}
      <button
        onClick={toggleTheme}
        className="absolute top-0 right-0 p-2 rounded-full text-[var(--subtle-text)] hover:bg-gray-500/10 transition-colors"
        aria-label="Toggle theme"
      >
        {/* Conditionally renders the Moon or Sun icon based on the current theme. */}
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Centered content block for name and contact info. */}
      <div className="text-center">
        {/* Main name heading with a custom pixelated font and responsive line break. */}
        <h1 className="text-6xl sm:text-7xl font-pixel text-[var(--text-color)] leading-tight sm:leading-normal">
          {/* Mobile view: "MD ZARIF" on line 1, "AZFAR" on line 2 */}
          <span className="sm:hidden">
            {firstNamePart}
            <br />
            {lastNamePart}
          </span>
          {/* Desktop view: "MD ZARIF AZFAR" on a single line */}
          <span className="hidden sm:inline">
            {data.name}
          </span>
        </h1>
        {/* Flex container for contact details, allowing wrapping on small screens. */}
        <div className="mt-4 flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-[var(--header-text)]">
          <span className="flex items-center gap-2"><MapPin size={16} />{data.contact.location}</span>
          <a href={`tel:${data.contact.phone}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Phone size={16} />{data.contact.phone}
          </a>
          <a href={`mailto:${data.contact.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Mail size={16} />{data.contact.email}
          </a>
        </div>
      </div>
    </header>
  );
};