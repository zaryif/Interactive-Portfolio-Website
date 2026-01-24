// This feature component serves as the main view for the "Resume" tab.
// It assembles all the individual resume sections (Summary, Education, etc.)
// and provides buttons to view or download the resume PDF.

import React from 'react';
import type { ResumeData } from '../types';
import { Education } from '../components/Education';
import { Activities } from '../components/Activities';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Download, Eye } from 'lucide-react';
import { Summary } from '../components/Summary';

// Defines the props for the Resume component.
interface ResumeProps {
  resumeData: ResumeData;
}

const Resume: React.FC<ResumeProps> = ({ resumeData }) => {
  // Logic to construct direct view and download links from various Google Drive URL formats.
  // This ensures that whether the user provides a "view" link or a "download" link in the JSON,
  // the UI buttons will function correctly.
  let viewUrl = resumeData.resumePdfUrl;
  let downloadUrl = resumeData.resumePdfUrl;

  try {
    // Regex to find the File ID in standard view URLs (e.g., .../file/d/FILE_ID/...)
    const matchView = resumeData.resumePdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    // Regex to find the File ID in download parameters (e.g., ...?id=FILE_ID)
    const matchId = resumeData.resumePdfUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    // Extract the ID from either match.
    const fileId = matchView?.[1] || matchId?.[1];

    if (fileId) {
        // Construct the specific URLs using the extracted ID.
        viewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  } catch(e) {
    // If parsing fails, fall back to the original URL for both.
    console.error("Could not construct customized Drive URLs, falling back to original.", e);
  }

  return (
      <div className="space-y-12 animate-fade-in">
        <section>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <h2 className="text-4xl font-pixel text-[var(--header-text)]">
                  Resume
              </h2>
              {/* Action buttons for viewing and downloading the PDF. */}
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <a 
                    href={viewUrl} 
                    target="_blank" // Opens in a new tab.
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm bg-gray-500/10 hover:bg-gray-500/20 px-4 py-2 rounded-md transition-colors"
                  >
                      <Eye size={16} /> View PDF
                  </a>
                  <a 
                    href={downloadUrl} 
                    download="MD_ZARIF_AZFAR_Resume.pdf" // Specifies the default filename for the downloaded file.
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm bg-amber-600/10 hover:bg-amber-600/20 text-[var(--header-text)] px-4 py-2 rounded-md transition-colors"
                  >
                      <Download size={16} /> Download
                  </a>
              </div>
          </div>
          {/* Container for all the resume content sections. */}
          <div className="border-t-2 border-amber-500/10 dark:border-amber-500/10 pt-8 space-y-12">
              <Summary summary={resumeData.summary} profilePictureUrl={resumeData.profilePictureUrl} />
              <Education education={resumeData.education} />
              <Activities activities={resumeData.activities} />
              <AdditionalInfo info={resumeData.additionalInfo} />
          </div>
        </section>
      </div>
  );
};

export default Resume;