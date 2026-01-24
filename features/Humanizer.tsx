import React, { useState } from 'react';
import { humanizeText } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { Feather, Copy, Check } from 'lucide-react';

const Humanizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to humanize.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputText('');
    setIsCopied(false);

    try {
      const response = await humanizeText(inputText);
      setOutputText(response.text);
    } catch (e) {
      console.error(e);
      setError('An error occurred while humanizing the text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="space-y-4">
      <p className="text-[var(--subtle-text)]">
        Paste your text below. The AI will rewrite it using advanced techniques to vary sentence structure, improve flow, and eliminate common AI patterns, making it sound completely human-written.
      </p>
      
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your AI-generated or formal text here..."
        className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-32"
        rows={6}
      />
      
      <button
        onClick={handleHumanize}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : <Feather size={20} />}
        <span>Humanize</span>
      </button>

      {error && <p className="text-red-500">{error}</p>}
      
      {(isLoading || outputText) && (
        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Result:</h3>
            {outputText && (
               <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm text-[var(--subtle-text)] hover:text-[var(--text-color)] transition-colors">
                 {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                 {isCopied ? 'Copied!' : 'Copy'}
               </button>
            )}
          </div>
          {isLoading && !outputText && (
             <div className="flex flex-col items-center justify-center h-32 bg-gray-500/10 rounded-lg">
                <Spinner />
                <p className="mt-2 text-[var(--subtle-text)]">Rewriting...</p>
            </div>
          )}
          {outputText && (
            <div className="bg-gray-500/10 p-4 rounded-md text-[var(--subtle-text)] whitespace-pre-wrap">
              {outputText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Humanizer;
