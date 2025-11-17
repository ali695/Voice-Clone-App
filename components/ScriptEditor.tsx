
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { VoiceProfile } from '../types';
import { generateSpeech } from '../services/geminiService';
import { createWavBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { Waveform } from './Waveform';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ScriptEditorProps {
    profile: VoiceProfile;
    addLog: (message: string) => void;
    generationLog: string[];
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ profile, addLog, generationLog }) => {
    const [script, setScript] = useState('Hello, this is a test of my custom generated voice.');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // Initialize AudioContext on user interaction (e.g., when component mounts)
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        // Cleanup audio source on component unmount
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
        };
    }, []);
    
    // Stop audio when profile changes
    useEffect(() => {
        stopPlayback();
        setAudioBuffer(null);
        setAudioUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile.id]);

    const handleGenerate = async () => {
        if (!script.trim() || isGenerating) return;

        setIsGenerating(true);
        setIsPlaying(false);
        setAudioBuffer(null);
        if(audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        addLog(`Generating audio for "${profile.name}"...`);

        try {
            const base64Audio = await generateSpeech(script, profile);
            addLog('Audio data received. Decoding...');

            if (base64Audio && audioContextRef.current) {
                const audioData = decode(base64Audio);
                const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
                setAudioBuffer(buffer);

                const wavBlob = createWavBlob(buffer);
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);

                addLog('Audio generated successfully.');
            } else {
                throw new Error("Received empty audio data from API.");
            }
        } catch (error) {
            console.error('Generation failed:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Error generating audio: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const stopPlayback = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playPlayback = useCallback(() => {
        if (audioBuffer && audioContextRef.current) {
            stopPlayback(); 
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
                audioSourceRef.current = null;
            };
            source.start(0);
            audioSourceRef.current = source;
            setIsPlaying(true);
        }
    }, [audioBuffer, stopPlayback]);

    const handlePlayPause = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            playPlayback();
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-gray-200">Script & Preview</h2>
            <div>
                <textarea
                    rows={6}
                    className="w-full bg-gray-700/50 rounded-md border border-gray-600 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition text-gray-200 p-2"
                    placeholder="Enter text to be spoken..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-center bg-gray-900/50 p-4 rounded-lg">
                <Waveform playing={isPlaying} />
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePlayPause}
                    disabled={!audioBuffer || isGenerating}
                    className="p-3 rounded-full bg-sky-500/80 hover:bg-sky-500 text-white transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                 <button
                    onClick={stopPlayback}
                    disabled={!isPlaying}
                    className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition disabled:opacity-50"
                >
                    <StopIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow"></div>
                {audioUrl && (
                    <a
                        href={audioUrl}
                        download={`${profile.name.replace(' ', '_')}_${new Date().toISOString()}.wav`}
                        className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition"
                        title="Download WAV"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </a>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
            >
                {isGenerating ? 'Generating...' : 'Generate Audio'}
            </button>
            
            <div className="flex-grow bg-gray-900/70 rounded-lg p-3 overflow-y-auto">
                <h3 className="text-md font-semibold text-gray-300 mb-2">Generation Log</h3>
                <div className="space-y-1 text-sm text-gray-400 font-mono">
                    {generationLog.map((log, index) => (
                        <p key={index} className="whitespace-pre-wrap break-words">{log}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};
