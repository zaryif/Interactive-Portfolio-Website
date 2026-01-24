// This feature component provides a UI for solving complex problems.
// It uses a more powerful Gemini model with an increased "thinking budget" for better reasoning.

import React, { useState } from 'react';
import { getComplexSolution } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ComplexSolver: React.FC = () => {
  // State for the user's complex problem/prompt.
  const [prompt, setPrompt] = useState('');
  // State to track if a solution is currently being generated.
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any error messages.
  const [error, setError] = useState<string | null>(null);
  // State to hold the generated solution text (in Markdown format).
  const [solution, setSolution] = useState<string | null>(null);

  // Handles the "Generate Solution" button click.
  const handleSolve = async () => {
    // Basic validation.
    if (!prompt.trim()) {
      setError('Please enter a problem or question.');
      return;
    }
    // Set loading state and clear previous results.
    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      // Call the Gemini service for complex solutions.
      const response = await getComplexSolution(prompt);
      setSolution(response.text);
    } catch (e) {
      console.error(e);
      setError('An error occurred while solving the problem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[var(--subtle-text)]">
        Using an advanced reasoning model with a maximum thinking budget for enhanced performance on complex tasks.
      </p>
      {/* Textarea for the user prompt. */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., Explain the architecture of a scalable microservices-based e-commerce platform, including database choices and CI/CD pipeline."
        className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-32"
        rows={4}
      />
      
      <button
        onClick={handleSolve}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : <BrainCircuit size={20} />}
        <span>Generate Solution</span>
      </button>

      {/* Display error message if any. */}
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Display loading state or the final solution. */}
      {(isLoading || solution) && (
        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
          <h3 className="text-lg font-semibold mb-2">Solution:</h3>
          {/* Show a spinner while loading and no solution is available yet. */}
          {isLoading && !solution && (
             <div className="flex flex-col items-center justify-center h-48 bg-gray-500/10 rounded-lg">
                <Spinner />
                <p className="mt-2 text-[var(--subtle-text)]">Thinking...</p>
            </div>
          )}
          {/* Render the solution as Markdown when it's available. */}
          {solution && (
            <div className="prose prose-sm sm:prose-base max-w-none prose-pre:bg-gray-200 dark:prose-pre:bg-gray-800 prose-headings:text-[var(--text-color)] prose-p:text-[var(--subtle-text)] prose-a:text-[var(--header-text)] prose-strong:text-[var(--text-color)] prose-code:text-amber-700 dark:prose-code:text-amber-400 bg-gray-500/10 p-4 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{solution}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplexSolver;
