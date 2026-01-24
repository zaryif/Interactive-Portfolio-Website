// This feature component provides a UI for generating images from text prompts
// using the Imagen model via the geminiService.

import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { Wand2 } from 'lucide-react';

// Defines the possible aspect ratios for the generated image.
type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ImageGenerator: React.FC = () => {
  // State for the user's text prompt.
  const [prompt, setPrompt] = useState('');
  // State for the selected aspect ratio.
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  // State to track if an image is currently being generated.
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any error messages.
  const [error, setError] = useState<string | null>(null);
  // State to hold the URL of the generated image (as a base64 data URL).
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Handles the "Generate" button click.
  const handleGenerate = async () => {
    // Basic validation to ensure a prompt is entered.
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    // Set loading state and clear previous results/errors.
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      // Call the image generation service.
      const response = await generateImage(prompt, aspectRatio);
      // Check if the response contains image data.
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        // Create a data URL from the base64 string and store it in state.
        setImageUrl(`data:image/png;base64,${base64ImageBytes}`);
      } else {
        setError('Failed to generate image. The response was empty.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Textarea for the user prompt. */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A pixel art animation of a developer coding at night, with a cat sleeping on the desk."
        className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-24"
        rows={3}
      />
      
      {/* Container for aspect ratio dropdown and generate button. */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Aspect Ratio</label>
          <select
            id="aspect-ratio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500"
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="3:4">3:4 (Tall)</option>
          </select>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-end flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Spinner /> : <Wand2 size={20} />}
          <span>Generate</span>
        </button>
      </div>

      {/* Display error message if any. */}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* Display loading indicator. */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-500/10 rounded-lg">
          <Spinner />
          <p className="mt-2 text-[var(--subtle-text)]">Generating your masterpiece...</p>
        </div>
      )}

      {/* Display the generated image if available. */}
      {imageUrl && (
        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <img src={imageUrl} alt={prompt} className="rounded-lg max-w-full mx-auto" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
