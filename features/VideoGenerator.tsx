// This feature component handles AI video generation.
// It includes logic for API key selection, handling text prompts and optional image uploads,
// and polling for the result of the long-running video generation process.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateVideo, getVideosOperation } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { Film, Upload, KeyRound } from 'lucide-react';

// Defines the possible aspect ratios for the generated video.
type AspectRatio = "16:9" | "9:16";

const VideoGenerator: React.FC = () => {
    // State for user inputs.
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // State for the generation process and results.
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // State and refs for API key management and polling.
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const pollIntervalRef = useRef<number | null>(null);

    // Checks if the user has selected an API key using the aistudio helper.
    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
            return hasKey;
        }
        return false;
    }, []);

    // Effect to check for the API key on component mount and clean up polling on unmount.
    useEffect(() => {
        checkApiKey();
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [checkApiKey]);

    // Opens the aistudio dialog for the user to select their API key.
    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success immediately to improve UX and avoid race conditions.
            setApiKeySelected(true);
        }
    };

    // Handles file selection, reads the file as a base64 string, and creates a preview URL.
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setImageBase64(result.split(',')[1]); // Remove the "data:..." prefix.
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Polls the video generation operation status every 10 seconds.
    const pollOperation = (operation: any) => {
        pollIntervalRef.current = window.setInterval(async () => {
            try {
                const updatedOperation = await getVideosOperation(operation);
                // If the operation is done, process the result.
                if (updatedOperation.done) {
                    clearInterval(pollIntervalRef.current!);
                    pollIntervalRef.current = null;
                    const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink && process.env.API_KEY) {
                        // Fetch the video data from the returned URI (requires API key).
                        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const blob = await videoResponse.blob();
                        setVideoUrl(URL.createObjectURL(blob)); // Create a local URL for the video player.
                    } else {
                        setError("Video generated, but download link was missing.");
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                 console.error(err);
                 clearInterval(pollIntervalRef.current!);
                 pollIntervalRef.current = null;
                 setIsLoading(false);
                 setError("Error checking video status. Please try again.");
            }
        }, 10000); // Poll every 10 seconds
    };

    // Starts the video generation process.
    const handleGenerate = async () => {
        if (!prompt.trim() && !imageFile) {
            setError('Please enter a prompt or upload an image.');
            return;
        }

        const hasKey = await checkApiKey();
        if (!hasKey) {
            setError("Please select an API key first.");
            return;
        }
        
        // Reset state and start loading.
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage('Initializing video generation...');

        try {
            // Call the service to start the generation.
            const operation = await generateVideo(prompt, aspectRatio, imageBase64 ?? undefined, imageFile?.type ?? undefined);
            setLoadingMessage('Video generation in progress... This can take a few minutes. Please wait.');
            // Start polling for the result.
            pollOperation(operation);
        } catch (e: any) {
            console.error(e);
            // Handle common API key errors.
            if (e.message?.includes("Requested entity was not found")) {
                setError("API Key error. Please re-select your API key.");
                setApiKeySelected(false);
            } else {
                setError('An error occurred while starting the video generation.');
            }
            setIsLoading(false);
        }
    };

    // If no API key is selected, render a prompt for the user to select one.
    if (!apiKeySelected) {
        return (
            <div className="text-center p-4">
                <h3 className="text-lg font-semibold text-[var(--text-color)]">API Key Required</h3>
                <p className="text-[var(--subtle-text)] my-2">The advanced video generation model requires you to select your own API key.</p>
                <p className="text-sm text-gray-500 mb-4">
                    Please note that charges may apply. For details, see the 
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[var(--header-text)] hover:underline ml-1">billing documentation</a>.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 mx-auto"
                >
                    <KeyRound size={20} />
                    Select API Key
                </button>
                 {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        );
    }

    // Main UI for the video generator.
    return (
        <div className="space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video to generate. e.g., A developer celebrating after fixing a bug, cinematic."
                className="w-full bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 h-24"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--subtle-text)] mb-2">Upload an image to animate (optional)</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2">
                            <Upload size={16} />
                            <span>Choose Image</span>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                        {previewUrl && <img src={previewUrl} alt="Preview" className="h-12 w-12 object-cover rounded" />}
                        {imageFile && <span className="text-sm text-[var(--subtle-text)]">{imageFile.name}</span>}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-[var(--subtle-text)] mb-1">Aspect Ratio</label>
                    <select
                        id="aspect-ratio-video"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 border-transparent rounded-md px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500"
                    >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-end flex items-center justify-center gap-2 bg-amber-600 dark:bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 dark:hover:bg-amber-700 disabled:bg-amber-400 dark:disabled:bg-amber-800 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <Spinner /> : <Film size={20} />}
                    <span>Generate Video</span>
                </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-500/10 rounded-lg">
                    <Spinner />
                    <p className="mt-2 text-[var(--subtle-text)] text-center">{loadingMessage}</p>
                </div>
            )}
            {videoUrl && (
                <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                    <h3 className="text-lg font-semibold mb-2">Result:</h3>
                    <video controls src={videoUrl} className="rounded-lg w-full" />
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
