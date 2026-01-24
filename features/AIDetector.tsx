import React, { useState } from 'react';
import { detectAIText } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { ShieldCheck } from 'lucide-react';

// Define the type for the result object
interface DetectionResult {
  classification: 'AI-Generated' | 'Human-Written';
  confidence: number;
  reasoning: string;
}

const AIDetector: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await detectAIText(inputText);
      // The response text should be a valid JSON string.
      const parsedResult: DetectionResult = JSON.parse(response.text);
      setResult(parsedResult);
    } catch (e) {
      console.error(e);
      setError('An error occurred during detection. The model may have returned an invalid format.');
    } finally {
      setIsLoading(false);
    }
  };

  // A sub-component to render the confidence score as a progress bar.
  const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => (
    <div>
      <span className="text-sm font-medium text-[var(--subtle-text)]">Confidence: {value}%</span>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-[var(--subtle-text)]">
        Paste text into the box below to check if it's likely AI-generated or human-written.
      </p>
      
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text here..."
        className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-40"
        rows={8}
      />
      
      <button
        onClick={handleDetect}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : <ShieldCheck size={20} />}
        <span>Analyze Text</span>
      </button>

      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
      
      {isLoading && (
         <div className="flex flex-col items-center justify-center h-48 bg-gray-500/10 rounded-lg">
            <Spinner />
            <p className="mt-2 text-[var(--subtle-text)]">Analyzing...</p>
        </div>
      )}

      {result && (
        <div className="mt-6 border-t border-[var(--border-color)] pt-4 space-y-4">
          <h3 className="text-lg font-semibold">Analysis Result:</h3>
          <div className={`p-4 rounded-lg border ${
              result.classification === 'AI-Generated'
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <p className={`text-2xl font-bold ${
              result.classification === 'AI-Generated'
                ? 'text-red-500 dark:text-red-400'
                : 'text-emerald-500 dark:text-emerald-400'
            }`}>
              {result.classification}
            </p>
          </div>

          <ConfidenceBar value={result.confidence} />

          <div>
            <h4 className="font-semibold text-[var(--text-color)]">Reasoning:</h4>
            <p className="text-[var(--subtle-text)] bg-gray-500/10 p-3 rounded-md mt-1">{result.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDetector;
