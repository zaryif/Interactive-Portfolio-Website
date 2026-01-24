// This feature component implements a real-time voice conversation with a Gemini model.
// It handles microphone input, streaming audio to the API, receiving audio output,
// playing back the response, and displaying transcriptions.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Mic, MicOff, Bot } from 'lucide-react';
import { checkRateLimit } from '../services/geminiService';

// --- Audio Encoding/Decoding Utilities ---

/**
 * Encodes raw audio bytes (Uint8Array) into a base64 string.
 * This is necessary for sending audio data in the JSON payload.
 * @param {Uint8Array} bytes - The raw audio data.
 * @returns {string} The base64 encoded audio string.
 */
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string back into raw audio bytes (Uint8Array).
 * @param {string} base64 - The base64 encoded audio string from the API.
 * @returns {Uint8Array} The decoded raw audio data.
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer that can be played by the browser.
 * The browser's native `decodeAudioData` is for file formats like MP3/WAV, not raw PCM streams.
 * @param {Uint8Array} data - Raw PCM audio data.
 * @param {AudioContext} ctx - The Web Audio API AudioContext.
 * @param {number} sampleRate - The sample rate of the audio (e.g., 24000).
 * @param {number} numChannels - The number of audio channels (e.g., 1 for mono).
 * @returns {Promise<AudioBuffer>} An AudioBuffer ready for playback.
 */
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const LiveConvo: React.FC = () => {
  // --- State and Refs ---
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Idle. Press Start to talk.');
  const [transcripts, setTranscripts] = useState<{ speaker: 'user' | 'model'; text: string }[]>([]);
  
  // Refs to hold objects that should not trigger re-renders when they change.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Refs for accumulating transcription text within a single turn.
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // Refs for managing smooth audio playback.
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());

  // --- Core Functions ---

  /**
   * Stops the conversation and cleans up all resources (media streams, audio contexts, etc.).
   * Wrapped in useCallback to prevent re-creation on every render.
   */
  const stopConversation = useCallback(() => {
    // Close the API session.
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    // Stop microphone tracks.
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    // Disconnect audio processing nodes.
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    // Close audio contexts.
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        // Stop any currently playing audio.
        for(const source of sources.current.values()){
            source.stop();
        }
        sources.current.clear();
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    setIsListening(false);
    setStatus('Conversation ended.');
  }, []);

  /**
   * Starts a new conversation. Requests microphone access, sets up audio contexts,
   * and establishes a connection to the Gemini Live API.
   */
  const startConversation = async () => {
    if (isListening) return;

    // Check limits before starting a resource-intensive session.
    try {
        checkRateLimit();
    } catch (e: any) {
        setStatus(e.message);
        return;
    }

    setIsListening(true);
    setStatus('Connecting...');
    setTranscripts([]);

    try {
      // Get microphone access.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Web Audio API contexts for input (mic) and output (speaker).
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // Connect to the Gemini Live API.
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], // We expect audio back.
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},  // Enable transcription for user's speech.
          outputAudioTranscription: {}, // Enable transcription for model's speech.
          systemInstruction: "You are a friendly and helpful AI assistant demonstrating your capabilities for a portfolio website.",
        },
        callbacks: {
          // --- API Event Callbacks ---
          onopen: () => {
            setStatus('Connected. You can start speaking now.');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            // Use ScriptProcessorNode to get raw audio data from the microphone.
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            // This event fires repeatedly, giving us chunks of audio data.
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Send the audio chunk to the API.
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
              // Handle incoming transcriptions.
              if (message.serverContent?.outputTranscription) {
                  currentOutputTranscription.current += message.serverContent.outputTranscription.text;
              }
              if (message.serverContent?.inputTranscription) {
                  currentInputTranscription.current += message.serverContent.inputTranscription.text;
              }
              // When a full user/model turn is complete, update the transcript state.
              if(message.serverContent?.turnComplete) {
                  const fullInput = currentInputTranscription.current;
                  const fullOutput = currentOutputTranscription.current;
                  setTranscripts(prev => {
                      const newTranscripts: { speaker: 'user' | 'model'; text: string }[] = [];
                      if (fullInput) newTranscripts.push({ speaker: 'user', text: fullInput });
                      if (fullOutput) newTranscripts.push({ speaker: 'model', text: fullOutput });
                      return [...prev, ...newTranscripts];
                  });
                  // Reset for the next turn.
                  currentInputTranscription.current = '';
                  currentOutputTranscription.current = '';
              }
              // Handle incoming audio data from the model.
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
              if (base64Audio) {
                  // Schedule playback to ensure gapless audio.
                  nextStartTime.current = Math.max(nextStartTime.current, outputAudioContextRef.current!.currentTime);
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                  const sourceNode = outputAudioContextRef.current!.createBufferSource();
                  sourceNode.buffer = audioBuffer;
                  sourceNode.connect(outputNode);
                  sourceNode.addEventListener('ended', () => sources.current.delete(sourceNode));
                  sourceNode.start(nextStartTime.current);
                  nextStartTime.current += audioBuffer.duration;
                  sources.current.add(sourceNode);
              }
              // Handle interruptions (e.g., user speaks over the model).
              if(message.serverContent?.interrupted){
                for(const source of sources.current.values()){
                    source.stop();
                }
                sources.current.clear();
                nextStartTime.current = 0;
              }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            setStatus(`Error: ${e.message}. Please try again.`);
            stopConversation();
          },
          onclose: (e: CloseEvent) => {
            setStatus('Connection closed.');
            setIsListening(false);
          },
        },
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setStatus(`Error: ${error.message || 'Failed to access microphone'}`);
      setIsListening(false);
    }
  };

  // useEffect hook for cleanup: ensure conversation is stopped when the component unmounts.
  useEffect(() => {
    return () => {
        stopConversation();
    }
  },[stopConversation])

  return (
    <div className="flex flex-col h-[70vh]">
        {/* Start/Stop Button */}
        <div className="flex justify-center items-center gap-4 mb-4">
            <button
                onClick={isListening ? stopConversation : startConversation}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 text-white
                    ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'}`}
            >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                <span>{isListening ? 'Stop' : 'Start'} Conversation</span>
            </button>
        </div>
        {/* Status Display */}
        <p className="text-center text-[var(--header-text)] font-mono mb-4 h-6">{status}</p>
        {/* Transcription Display Area */}
        <div className="flex-grow bg-gray-500/10 rounded-lg p-4 overflow-y-auto space-y-4">
            {transcripts.map((t, i) => (
                <div key={i} className={`flex items-start gap-3 ${t.speaker === 'user' ? 'justify-end' : ''}`}>
                    {t.speaker === 'model' && <Bot className="w-6 h-6 text-[var(--header-text)] flex-shrink-0 mt-1" />}
                    <div className={`p-3 rounded-lg max-w-lg ${t.speaker === 'user' ? 'bg-amber-600 dark:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                        <p>{t.text}</p>
                    </div>
                </div>
            ))}
             {/* Placeholder when there are no transcripts. */}
             {!transcripts.length && !isListening && (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                    <p>Conversation transcripts will appear here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveConvo;