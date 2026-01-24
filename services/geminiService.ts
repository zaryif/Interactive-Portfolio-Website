// Developer Note: It is recommended to rename this file to 'aiService.ts' to better reflect its purpose.
// This service module centralizes all interactions with the AI API.
// Each function is a dedicated interface for a specific AI capability,
// making it easy to manage and reuse the AI logic throughout the application.

import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import type { ResumeData } from '../types';

// Define a daily request limit to prevent abuse and stay within free tier limits.
const DAILY_REQUEST_LIMIT = 50;

/**
 * Checks if the user has exceeded the daily request limit.
 * Throws an error if the limit is reached.
 * Uses localStorage to track usage per user.
 */
export const checkRateLimit = () => {
    const STORAGE_KEY_DATE = 'portfolio_ai_usage_date';
    const STORAGE_KEY_COUNT = 'portfolio_ai_usage_count';

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_DATE);
    let count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);

    // Reset counter if the date has changed.
    if (lastDate !== today) {
        count = 0;
        localStorage.setItem(STORAGE_KEY_DATE, today);
    }

    if (count >= DAILY_REQUEST_LIMIT) {
        throw new Error(`Daily demo limit reached (${DAILY_REQUEST_LIMIT} requests/day). Please come back tomorrow!`);
    }

    // Increment the counter.
    localStorage.setItem(STORAGE_KEY_COUNT, (count + 1).toString());
};

/**
 * Initializes and returns a new AI client instance.
 * This is the main entry point for the AI API.
 * @returns {GoogleGenAI} The initialized AI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getGenAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// --- Text and Chat ---

/**
 * Sends a chat message to the model with grounding capabilities.
 * "Grounding" means the model can use external tools like web search or maps
 * to provide more accurate and up-to-date answers.
 * @param {object[]} history - The previous chat history, used to maintain conversation context.
 * @param {string} newMessage - The new message from the user.
 * @param {boolean} useMaps - A flag to enable or disable the maps tool for location-based queries.
 * @param {ResumeData} resumeData - The user's portfolio data, used to construct a detailed context for the AI.
 * @returns {Promise<GenerateContentResponse>} The model's response, which includes the text and any source citations.
 */
export const getGroundedChatResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string, useMaps: boolean, resumeData: ResumeData): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();

    // System instruction to give the AI context about the user's portfolio.
    const systemInstruction = `You are ZOSO AI, an expert AI assistant for a software developer named ${resumeData.name}. 
Your goal is to answer questions about their skills, experience, and projects based on the provided resume data. 
You can also answer general tech questions. Be friendly, helpful, and professional.
Here is the resume data in JSON format: ${JSON.stringify(resumeData)}`;

    const tools: any[] = [{ googleSearch: {} }];
    if (useMaps) {
        tools.push({ googleMaps: {} });
    }
    
    const config: any = {
        systemInstruction,
        tools,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
        config,
    });

    return response;
};


// --- Image Generation ---

/**
 * Generates an image based on a text prompt using an image generation model.
 * @param {string} prompt - The text description of the image to generate.
 * @param {string} aspectRatio - The desired aspect ratio for the image.
 * @returns {Promise<any>} The model's response, containing the generated image data.
 */
export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4"): Promise<any> => {
    checkRateLimit();
    const ai = getGenAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio,
        },
    });
    return response;
};

// --- Video Generation ---

/**
 * Initiates a video generation task.
 * @param {string} prompt - The text prompt for the video.
 * @param {string} aspectRatio - The aspect ratio of the video.
 * @param {string} [imageBase64] - Optional base64 encoded image to animate.
 * @param {string} [imageMimeType] - The MIME type of the optional image.
 * @returns {Promise<any>} The initial operation object for the video generation task.
 */
export const generateVideo = async (prompt: string, aspectRatio: "16:9" | "9:16", imageBase64?: string, imageMimeType?: string): Promise<any> => {
    // Re-initializing to get the latest key, as per VideoGenerator requirements.
    // Note: We do NOT rate limit video generation as it requires the user to select their own API key.
    const ai = getGenAI();
    const requestPayload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        }
    };

    if (imageBase64 && imageMimeType) {
        requestPayload.image = {
            imageBytes: imageBase64,
            mimeType: imageMimeType,
        };
    }

    const operation = await ai.models.generateVideos(requestPayload);
    return operation;
};

/**
 * Fetches the status of an ongoing video generation operation.
 * @param {any} operation - The operation object returned from `generateVideo`.
 * @returns {Promise<any>} The updated operation object.
 */
export const getVideosOperation = async (operation: any): Promise<any> => {
    // Re-initializing to get the latest key.
    const ai = getGenAI();
    const updatedOperation = await ai.operations.getVideosOperation({ operation });
    return updatedOperation;
};

// --- Complex Problem Solving ---

/**
 * Solves a complex problem using a powerful model with a high thinking budget.
 * @param {string} prompt - The complex problem or question.
 * @returns {Promise<GenerateContentResponse>} The detailed solution from the model.
 */
export const getComplexSolution = async (prompt: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }, // Max budget for this model
        },
    });
    return response;
};


// --- Image Analysis and Editing ---

/**
 * Analyzes an image with a text prompt.
 * @param {string} prompt - The user's question or instruction about the image.
 * @param {string} imageBase64 - The base64 encoded image data.
 * @param {string} mimeType - The MIME type of the image.
 * @returns {Promise<GenerateContentResponse>} The model's analysis.
 */
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response;
};

/**
 * Edits an image based on a text prompt.
 * @param {string} prompt - The user's editing instruction.
 * @param {string} imageBase64 - The base64 encoded image data of the source image.
 * @param {string} mimeType - The MIME type of the source image.
 * @returns {Promise<GenerateContentResponse>} The model's response, containing the edited image.
 */
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    return response;
};

// --- Text Humanization & Analysis ---

/**
 * Rewrites text to sound more human-like.
 * @param {string} text - The input text to humanize.
 * @returns {Promise<GenerateContentResponse>} The rewritten text from the model.
 */
export const humanizeText = async (text: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const systemInstruction = `You are an advanced AI text humanizer. Your task is to rewrite the provided text to make it sound as if it were written by a human.
Focus on varying sentence structure, improving flow, eliminating AI hallmarks (like repetitive phrases and overly formal language), injecting personality, and enhancing word choice.
The output should ONLY be the rewritten text, with no preamble.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
            systemInstruction,
        },
    });
    return response;
};

/**
 * Analyzes text to determine if it's AI-generated or human-written.
 * @param {string} text - The text to analyze.
 * @returns {Promise<GenerateContentResponse>} A JSON response with classification, confidence, and reasoning.
 */
export const detectAIText = async (text: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const systemInstruction = `You are an expert AI text classifier. Your task is to analyze the following text and determine if it was likely written by a human or an AI.
    Provide a classification and a confidence score. Consider factors like sentence structure variety, word choice, repetitiveness, and common AI linguistic patterns.
    The output must be a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this text: "${text}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    classification: {
                        type: Type.STRING,
                        description: 'The classification of the text. Must be one of "AI-Generated" or "Human-Written".',
                    },
                    confidence: {
                        type: Type.NUMBER,
                        description: 'A confidence score between 0 and 100 representing the certainty of the classification.',
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: 'A brief explanation for the classification, highlighting the key indicators found in the text.'
                    }
                },
                required: ["classification", "confidence", "reasoning"],
            },
        },
    });
    return response;
};

/**
 * Expands a simple user prompt into a detailed, rich prompt.
 * @param {string} prompt - The user's simple prompt.
 * @returns {Promise<GenerateContentResponse>} The enhanced prompt from the model.
 */
export const enhancePrompt = async (prompt: string): Promise<GenerateContentResponse> => {
    checkRateLimit();
    const ai = getGenAI();
    const systemInstruction = `You are an expert prompt engineer for generative AI models. Your task is to take a user's simple prompt and expand it into a detailed, rich, and well-structured prompt that will produce a high-quality, creative, and specific output, particularly for image generation.
Analyze the user's core idea and add details about subject, composition, style, medium, lighting, atmosphere, color palette, and technical details.
The output should ONLY be the enhanced prompt text, without any explanation or preamble.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
        },
    });
    return response;
};