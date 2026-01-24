// This feature component allows users to upload an image (like a UI mockup)
// and either get AI-powered analysis and feedback on it or request an AI-powered edit.

import React, { useState } from 'react';
import { analyzeImage, editImage } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { Upload, ScanLine, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProjectAnalyzer: React.FC = () => {
  // State for user inputs.
  const [prompt, setPrompt] = useState('Analyze this UI. What can be improved?');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // State for the generation process and results.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The result can be either text (from analysis) or an image URL (from editing).
  const [result, setResult] = useState<{ text?: string; imageUrl?: string } | null>(null);

  // Handles file selection, validates file size, and converts the image to base64.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple client-side validation for file size.
      if(file.size > 4 * 1024 * 1024) {
          setError("File size should not exceed 4MB.");
          return;
      }
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        setImageBase64(res.split(',')[1]); // Remove "data:..." prefix.
        setPreviewUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handles both "Analyze" and "Edit" button clicks.
  const handleSubmit = async (mode: 'analyze' | 'edit') => {
    if (!imageFile || !imageBase64) {
      setError('Please upload an image.');
      return;
    }
    // Set loading state and clear previous results.
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        let response;
        if(mode === 'analyze') {
            // Call the analysis service and set the text result.
            response = await analyzeImage(prompt, imageBase64, imageFile.type);
            setResult({ text: response.text });
        } else {
            // Call the editing service and set the image URL result.
            response = await editImage(prompt, imageBase64, imageFile.type);
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                const newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setResult({ imageUrl: newImageUrl });
            } else {
                setError("Could not edit the image. The model didn't return an image.");
            }
        }
    } catch (e) {
      console.error(e);
      setError('An error occurred during the process.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File upload button and preview area. */}
      <div>
        <label className="cursor-pointer bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2">
            <Upload size={16} />
            <span>Upload UI Mockup / Screenshot</span>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
        {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 max-h-64 object-contain rounded-md border border-[var(--border-color)]" />}
      </div>
      
      {/* Textarea for the user's prompt (analysis question or editing instruction). */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your request. e.g., 'Make this design more modern' or 'Add a dark mode version'"
        className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-24"
      />
      
      {/* Action buttons. */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button onClick={() => handleSubmit('analyze')} disabled={isLoading || !imageFile} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors">
            {isLoading ? <Spinner /> : <ScanLine size={20} />}
            <span>Analyze</span>
        </button>
        <button onClick={() => handleSubmit('edit')} disabled={isLoading || !imageFile} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-600 dark:bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-yellow-700 dark:hover:bg-amber-600 disabled:bg-yellow-400 dark:disabled:bg-amber-700 disabled:cursor-not-allowed transition-colors">
            {isLoading ? <Spinner /> : <Pencil size={20} />}
            <span>Edit</span>
        </button>
      </div>

      {/* Display error message if any. */}
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Display loading state or the final result. */}
      {(isLoading || result) && (
        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          {isLoading && !result && (
             <div className="flex flex-col items-center justify-center h-48 bg-gray-500/10 rounded-lg">
                <Spinner />
                <p className="mt-2 text-[var(--subtle-text)]">Processing...</p>
            </div>
          )}
          {/* Conditionally render text result (Markdown). */}
          {result?.text && (
            <div className="prose prose-sm sm:prose-base max-w-none prose-pre:bg-gray-200 dark:prose-pre:bg-gray-800 prose-headings:text-[var(--text-color)] prose-p:text-[var(--subtle-text)] prose-a:text-[var(--header-text)] prose-strong:text-[var(--text-color)] prose-code:text-amber-700 dark:prose-code:text-amber-400 bg-gray-500/10 p-4 rounded-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.text}</ReactMarkdown>
            </div>
          )}
           {/* Conditionally render image result. */}
           {result?.imageUrl && (
            <img src={result.imageUrl} alt="Edited result" className="rounded-lg max-w-full mx-auto" />
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectAnalyzer;
