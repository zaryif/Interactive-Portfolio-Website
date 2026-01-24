// A reusable component to display the Extracurricular & Volunteer Activities section.
// It iterates over a list of activity items and renders them.

import React from 'react';
import type { ActivityItem } from '../types';

// Defines the props that the Activities component accepts.
interface ActivitiesProps {
  activities: ActivityItem[]; // An array of activity objects.
}

export const Activities: React.FC<ActivitiesProps> = ({ activities }) => {
  return (
    <section>
      {/* Section heading with a custom pixelated font. */}
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Extracurricular & Volunteer
      </h2>
      <div className="space-y-6">
        {/* Map over the activities array to render each item. */}
        {activities.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-color)]">
                {item.organization}: <span className="font-normal">{item.role}</span>
              </h3>
              {/* Conditionally render details (bullet points) if they exist. */}
              {item.details.length > 0 && (
                 <ul className="list-disc list-inside mt-2 text-[var(--subtle-text)] max-w-2xl">
                    {item.details.map((detail, i) => <li key={i}>{detail}</li>)}
                </ul>
              )}
            </div>
            {/* Display the duration on the right side. */}
            <p className="text-[var(--header-text)] font-semibold mt-1 sm:mt-0 flex-shrink-0">{item.duration}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
