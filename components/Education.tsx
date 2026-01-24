// A reusable component to display the Education section of the resume.
// It iterates over a list of education items and renders them.

import React from 'react';
import type { EducationItem } from '../types';

// Defines the props that the Education component accepts.
interface EducationProps {
  education: EducationItem[]; // An array of education objects.
}

export const Education: React.FC<EducationProps> = ({ education }) => {
  return (
    <section>
      {/* Section heading with a custom pixelated font. */}
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Education
      </h2>
      <div className="space-y-6">
        {/* Map over the education array to render each item. */}
        {education.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-color)]">{item.degree}</h3>
              <p className="text-[var(--subtle-text)]">{item.institution}</p>
              {/* Conditionally render details if they exist (e.g., GPA, Group). */}
              {item.details && (
                <ul className="list-disc list-inside mt-2 text-[var(--subtle-text)]">
                  {item.details.map((detail, i) => <li key={i}>{detail}</li>)}
                </ul>
              )}
            </div>
            {/* Display the duration on the right side. */}
            <p className="text-[var(--header-text)] font-semibold mt-1 sm:mt-0">{item.duration}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
