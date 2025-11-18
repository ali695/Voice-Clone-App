import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { VoiceProfile } from '../types';
import { generateSpeech } from '../services/geminiService';
import { createWavBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { Waveform } from './Waveform';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ScriptEditorProps {
    profile: VoiceProfile;
    addLog: (message: string) => void;
    generationLog: string[];
    theme: 'light' | 'dark';
}

type ExportFormat = 'wav' | 'mp3' | 'ogg';

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ profile, addLog, generationLog, theme }) => {
    const [script, setScript] = useState('Hello, this is a test of my custom generated voice. With this new interface, creating high-quality audio is more intuitive than ever.');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('wav');
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const formatMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!audioContextRef.current) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = context;
            analyserRef.current = context.createAnalyser();
            analyserRef.current.fftSize = 256;
        }
        return () => { if (audioSourceRef.current) audioSourceRef.current.stop(); };
    }, []);
    
    useEffect(() => { stopPlayback(); setAudioBuffer(null); }, [profile.id]);
    useEffect(() => { if(logContainerRef.current) logContainerRef.current.scrollTop = 0; }, [generationLog]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (formatMenuRef.current && !formatMenuRef.current.contains(event.target as Node)) setIsFormatMenuOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGenerate = async () => {
        if (!script.trim() || isGenerating) return;
        setIsGenerating(true); setIsPlaying(false); setAudioBuffer(null);
        addLog(`Generating audio for "${profile.name}"...`); setIsLogOpen(true);
        try {
            const base64Audio = await generateSpeech(script, profile);
            addLog('Audio data received. Decoding...');
            if (base64Audio && audioContextRef.current) {
                const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                setAudioBuffer(buffer); addLog('Audio generated and decoded successfully.');
            } else { throw new Error("Received empty audio data from API."); }
        } catch (error) {
            console.error('Generation failed:', error);
            addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally { setIsGenerating(false); }
    };

    const stopPlayback = useCallback(() => {
        if (audioSourceRef.current) { audioSourceRef.current.stop(); audioSourceRef.current.disconnect(); audioSourceRef.current = null; }
        setIsPlaying(false);
    }, []);

    const playPlayback = useCallback(() => {
        if (audioBuffer && audioContextRef.current && analyserRef.current) {
            stopPlayback(); 
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
            source.onended = () => { setIsPlaying(false); if(source === audioSourceRef.current) audioSourceRef.current = null; };
            source.start(0); audioSourceRef.current = source;
            setIsPlaying(true);
        }
    }, [audioBuffer, stopPlayback]);

    const handlePlayPause = () => { if (isPlaying) stopPlayback(); else playPlayback(); };

    const handleDownload = async () => {
        if (!audioBuffer) return;
        addLog(`Preparing download for ${exportFormat.toUpperCase()} format...`); setIsLogOpen(true);
        const blob = createWavBlob(audioBuffer); // Note: MP3/OGG are simulated
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.style.display = 'none'; a.href = url;
        a.download = `${profile.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
        addLog(`Download started: ${a.download}`);
    };

    return (
        <div className="h-full flex flex-col space-y-4 p-6">
            <h2 className="text-xl font-extrabold tracking-tight flex-shrink-0">Script & Preview</h2>
            <div className="flex-shrink-0">
                <textarea rows={5} className="w-full bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] font-mono rounded-lg border border-[var(--card-border-light)] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--neon-cyan)] dark:focus:border-[var(--neon-cyan)] focus:border-blue-500 transition text-base p-4 leading-relaxed shadow-inner" placeholder="Enter text..." value={script} onChange={(e) => setScript(e.target.value)} />
            </div>

            <div className="flex items-center justify-center bg-[var(--control-bg-light)] dark:bg-black/20 p-4 rounded-xl flex-shrink-0 shadow-inner border border-[var(--card-border-light)] dark:border-slate-800">
                <Waveform isPlaying={isPlaying} analyserNode={analyserRef.current} theme={theme} />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handlePlayPause} 
                        disabled={!audioBuffer || isGenerating} 
                        className="p-3 rounded-full bg-slate-200 dark:bg-slate-900/50 text-slate-700 dark:text-white transition-all duration-200 transform-gpu hover:scale-110 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md border border-slate-300 dark:border-white/10 dark:hover:border-[var(--neon-cyan)] dark:hover:shadow-[var(--neon-cyan-glow)]"
                        aria-label={isPlaying ? "Pause playback" : "Play generated audio"}
                        aria-pressed={isPlaying}
                    >
                        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 text-blue-600 dark:text-[var(--neon-cyan)]" />}
                    </button>
                    <button 
                        onClick={stopPlayback} 
                        disabled={!isPlaying} 
                        className="p-3 rounded-full bg-slate-200 dark:bg-slate-900/50 text-slate-700 dark:text-white transition-all duration-200 transform-gpu hover:scale-110 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md border border-slate-300 dark:border-white/10"
                        aria-label="Stop playback"
                    >
                        <StopIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow w-full sm:w-auto"></div>
                {audioBuffer && !isGenerating && (
                     <div className="flex items-center gap-2">
                        <div className="relative" ref={formatMenuRef}>
                            <button 
                                onClick={() => setIsFormatMenuOpen(p => !p)} 
                                className="flex items-center justify-between w-32 px-3 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 transition-colors shadow-md border border-slate-300 dark:border-white/10"
                                aria-haspopup="true"
                                aria-expanded={isFormatMenuOpen}
                                aria-label={`Select download format. Current format: ${exportFormat.toUpperCase()}`}
                            >
                                <span className="tracking-widest">{exportFormat.toUpperCase()}</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFormatMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFormatMenuOpen && (<div className="absolute bottom-full mb-2 w-full bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10 animate-fade-in">{([ 'wav', 'mp3', 'ogg'] as const).map(f => (<button key={f} onClick={() => { setExportFormat(f); setIsFormatMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-800/50">{f.toUpperCase()}</button>))}</div>)}
                        </div>
                        <button 
                            onClick={handleDownload} 
                            className="p-3 rounded-lg bg-[var(--btn-primary-gradient-light)] dark:bg-[var(--generate-gradient)] text-white transition-all duration-300 transform-gpu hover:-translate-y-px shadow-[var(--btn-primary-shadow-light)] dark:shadow-[var(--generate-shadow)] dark:hover:shadow-[var(--generate-shadow-hover)]" 
                            aria-label={`Download audio as ${exportFormat.toUpperCase()} file`}
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <button onClick={handleGenerate} disabled={isGenerating || !script.trim()} className={`relative overflow-hidden w-full py-3.5 px-4 rounded-xl bg-[var(--btn-primary-gradient-light)] dark:bg-[var(--generate-gradient)] text-white font-bold text-lg transition-all duration-300 transform-gpu hover:-translate-y-1 disabled:opacity-60 disabled:cursor-wait disabled:transform-none shadow-[var(--btn-primary-shadow-light)] hover:shadow-[var(--btn-primary-shadow-hover-light)] dark:shadow-[var(--generate-shadow)] dark:hover:shadow-[var(--generate-shadow-hover)] ${isGenerating ? 'dark:animate-[pulse-glow-dark_2s_ease-in-out_infinite] animate-[pulse-glow-light_2s_ease-in-out_infinite]' : ''}`}>
                <span className="relative z-10">{isGenerating ? 'Generating...' : 'Generate Audio'}</span>
                {!isGenerating && <div className="absolute inset-0 bg-white opacity-10 mix-blend-lighten pointer-events-none group-hover:animate-[shine_1s_ease-in-out]"></div>}
            </button>
            
            <div className="flex-grow bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-lg overflow-hidden flex flex-col shadow-inner border border-[var(--card-border-light)] dark:border-slate-800">
                <button 
                    onClick={() => setIsLogOpen(p => !p)} 
                    className="w-full flex justify-between items-center text-left p-3 flex-shrink-0 hover:bg-slate-300/30 dark:hover:bg-white/5 transition-colors"
                    aria-expanded={isLogOpen}
                    aria-controls="generation-log-panel"
                    aria-label={`${isLogOpen ? 'Collapse' : 'Expand'} Generation Log`}
                >
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Generation Log</h3>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isLogOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLogOpen && (<div id="generation-log-panel" ref={logContainerRef} className="flex-grow overflow-y-auto space-y-1.5 text-xs text-[var(--text-light-secondary)] dark:text-slate-400 font-mono pr-1 px-3 pb-3 animate-fade-in">{generationLog.map((log, i) => (<p key={i} className="whitespace-pre-wrap break-words leading-relaxed">{log}</p>))}</div>)}
            </div>
        </div>
    );
};