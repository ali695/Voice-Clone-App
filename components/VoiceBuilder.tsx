import React, { useCallback, useState, useRef, useEffect } from 'react';
import type { VoiceProfile, Vibe } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SaveIcon } from './icons/SaveIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface VoiceBuilderProps {
    profile: VoiceProfile;
    onUpdate: (id: string, updates: Partial<VoiceProfile>) => void;
    addLog: (message: string) => void;
}

const VIBES: Vibe[] = [
    'Friendly', 'Sincere', 'Dramatic', 'Emotional', 'Motivational', 'Whispering', 
    'Soft ASMR', 'Documentary', 'News Anchor', 'Calm Therapist', 'Smooth Jazz DJ',
    'Horror Narrator', 'Fairytale Teller', 'Action Narrator', 'Bedtime Story',
    'Villain', 'Pirate',
];

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3.75 3.75M12 9.75L8.25 13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25v2.25c0 1.518 1.232 2.75 2.75 2.75h13.5A2.75 2.75 0 0021 19.5V17.25" />
    </svg>
);

const FineTuneSlider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }> = ({ id, label, value, min, max, step, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] mb-2 flex justify-between tracking-tight">
            <span>{label}</span>
            <span className="font-mono">{label === 'Estimated Age' ? Math.round(value) : value.toFixed(2)}</span>
        </label>
        <input
            id={id}
            type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-black/20 rounded-full appearance-none cursor-pointer accent-blue-600 dark:accent-[var(--neon-cyan)]"
        />
    </div>
);


export const VoiceBuilder: React.FC<VoiceBuilderProps> = ({ profile, onUpdate, addLog }) => {
    const [localDescription, setLocalDescription] = useState(profile.description);
    const [localVibe, setLocalVibe] = useState(profile.vibe);
    const [isSaved, setIsSaved] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileAnalysis, setFileAnalysis] = useState<{
        quality: 'Excellent' | 'Good' | 'Fair';
        duration: number | null;
        warnings: string[];
        fileName: string;
    } | null>(null);

    const [cloneSettings, setCloneSettings] = useState({ timbre: 0.75, accent: 0.50, age: 35 });
    const [isVibeOpen, setIsVibeOpen] = useState(false);
    const vibeMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAudioDuration = (file: File): Promise<number> => new Promise((resolve) => {
        const audio = document.createElement('audio'); audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', () => { URL.revokeObjectURL(audio.src); resolve(audio.duration); });
    });

    const analyzeFile = useCallback(async (file: File) => {
        const duration = await getAudioDuration(file);
        const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
        const warnings: string[] = []; let quality: 'Excellent' | 'Good' | 'Fair' = 'Good';

        if (['wav', 'flac'].includes(fileType)) quality = 'Excellent';
        else if (['mp3', 'm4a', 'aac', 'ogg'].includes(fileType)) { quality = 'Good'; warnings.push(`Compressed format (${fileType.toUpperCase()}) detected. Use WAV or FLAC for best quality.`); } 
        else { quality = 'Fair'; warnings.push(`Uncommon format (.${fileType}) may produce unpredictable results.`); }
        if (duration < 5) warnings.push('Sample is too short (< 5s). Longer samples provide better cloning accuracy.');
        if (duration > 300) warnings.push('Sample is very long (> 5min). The first minute is typically sufficient.');
        setFileAnalysis({ quality, duration, warnings, fileName: file.name });
    }, []);
    
    useEffect(() => {
        setLocalDescription(profile.description); setLocalVibe(profile.vibe);
        setIsUploading(false); setUploadProgress(0);
        if (!profile.audioSampleUrl) { setFileAnalysis(null); if (fileInputRef.current) fileInputRef.current.value = ''; } 
        else { setFileAnalysis({ quality: 'Good', duration: null, warnings: ["A reference audio is saved to this profile. Upload a new file to replace it."], fileName: profile.audioSampleUrl }); }
    }, [profile]);

    useEffect(() => { if (isSaved) { const timer = setTimeout(() => setIsSaved(false), 2000); return () => clearTimeout(timer); } }, [isSaved]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (vibeMenuRef.current && !vibeMenuRef.current.contains(event.target as Node)) setIsVibeOpen(false); };
        document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSave = () => { onUpdate(profile.id, { description: localDescription, vibe: localVibe }); setIsSaved(true); addLog(`Saved changes to "${profile.name}"`); };
    const hasUnsavedChanges = localDescription !== profile.description || localVibe !== profile.vibe;
    const handleVibeChange = (newVibe: Vibe) => { setLocalVibe(newVibe); setIsVibeOpen(false); };
    
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size / 1024 / 1024 > 50) { addLog('Error: File size should not exceed 50MB.'); e.target.value = ''; return; }
            setIsUploading(true); setUploadProgress(0); setFileAnalysis(null);
            const interval = setInterval(() => setUploadProgress(p => p >= 100 ? 100 : p + 10), 50);
            await new Promise(res => setTimeout(res, 600));
            clearInterval(interval); setUploadProgress(100);
            await analyzeFile(file); onUpdate(profile.id, { audioSampleUrl: file.name }); addLog(`Uploaded ${file.name} for voice cloning.`);
            setIsUploading(false);
        }
    }, [addLog, onUpdate, profile.id, analyzeFile]);

    const handleRemoveFile = () => { setFileAnalysis(null); onUpdate(profile.id, { audioSampleUrl: undefined }); addLog('Removed uploaded file.'); if (fileInputRef.current) fileInputRef.current.value = ''; };
    const isFileActive = !!profile.audioSampleUrl;

    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-extrabold tracking-tight">Voice Builder</h2>
                    <button onClick={handleSave} disabled={!hasUnsavedChanges || isSaved} 
                        aria-label={isSaved ? 'Changes saved successfully' : 'Save changes to voice profile'}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 transform-gpu
                        ${isSaved 
                            ? 'bg-green-500 text-white' 
                            : hasUnsavedChanges 
                                ? 'text-white bg-[var(--btn-secondary-gradient-light)] shadow-[var(--btn-secondary-shadow-light)] hover:shadow-[var(--btn-secondary-shadow-hover-light)] hover:-translate-y-px dark:bg-[var(--control-bg-dark)] dark:border dark:border-[var(--neon-cyan)] dark:shadow-[var(--neon-cyan-glow)] dark:hover:bg-cyan-900/40' 
                                : 'bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] cursor-not-allowed'
                        }`}>
                        <SaveIcon className="w-4 h-4" /><span>{isSaved ? 'Saved!' : 'Save'}</span>
                    </button>
                </div>
                <label htmlFor="voice-description" className="block text-sm font-medium text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] mb-2">Describe the voice you want to create:</label>
                <textarea id="voice-description" rows={3} className="w-full bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-lg border border-[var(--card-border-light)] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--neon-cyan)] dark:focus:border-[var(--neon-cyan)] focus:border-blue-500 transition text-base p-3 shadow-inner" placeholder="e.g., A deep, calm male monk for meditation guides" value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} />
            </div>

            <div className="relative" ref={vibeMenuRef}>
                <h3 className="text-md font-semibold mb-2">Personality & Vibe</h3>
                <button 
                    onClick={() => setIsVibeOpen(p => !p)} 
                    className="w-full flex justify-between items-center bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-lg border border-[var(--card-border-light)] dark:border-slate-700 p-3 transition-all duration-200 shadow-sm hover:border-blue-500/50 dark:hover:border-[var(--neon-cyan)]"
                    aria-haspopup="true"
                    aria-expanded={isVibeOpen}
                >
                    <span className="font-semibold">{localVibe}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isVibeOpen ? 'rotate-180' : ''}`} />
                </button>
                {isVibeOpen && (
                    <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-20 animate-fade-in">
                        {VIBES.map(vibe => (<button key={vibe} onClick={() => handleVibeChange(vibe)} className={`w-full text-left px-4 py-2 text-sm transition-colors relative group ${localVibe === vibe ? 'text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'}`}>
                           {localVibe === vibe && <div className="absolute inset-0 bg-blue-600 dark:bg-[var(--neon-blue)]"></div>}
                           <span className="relative">{vibe}</span>
                        </button>))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-md font-semibold mb-3">Voice-to-Voice Cloning</h3>
                {!isFileActive && !isUploading && (
                    <label htmlFor="audio-upload" className="group cursor-pointer p-6 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-[var(--neon-cyan)] bg-gray-200/30 dark:bg-black/20 hover:bg-blue-500/5 dark:hover:bg-cyan-900/20 rounded-lg text-center transition-colors duration-300 flex flex-col items-center justify-center dark:shadow-[var(--neon-cyan-glow)] dark:shadow-transparent">
                        <UploadIcon className="w-10 h-10 text-gray-400 dark:text-slate-500 group-hover:text-blue-400 dark:group-hover:text-[var(--neon-cyan)] transition-colors mb-3" />
                        <p className="mb-1 font-semibold"><span className="text-blue-600 dark:text-[var(--neon-cyan)]">Click to upload</span> or drag and drop</p>
                        <p className="text-sm text-gray-500 dark:text-slate-500">WAV, FLAC, MP3, M4A, AAC, OGG (Max 50MB)</p>
                        <input ref={fileInputRef} type="file" id="audio-upload" className="hidden" accept=".mp3,.wav,.ogg,.m4a,.flac,.aac" onChange={handleFileUpload} />
                    </label>
                )}
                {isUploading && (
                    <div className="p-4 border border-blue-500/50 dark:border-[var(--neon-cyan)]/50 bg-blue-500/10 dark:bg-cyan-900/20 rounded-lg text-center"><p className="font-semibold mb-2">Processing file...</p><div className="w-full bg-gray-300 dark:bg-black/20 rounded-full h-2.5"><div className="bg-blue-600 dark:bg-[var(--neon-cyan)] h-2.5 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.1s' }}></div></div></div>
                )}
                {isFileActive && fileAnalysis && (
                    <div className="p-4 rounded-lg bg-gray-200/30 dark:bg-black/20 border border-[var(--card-border-light)] dark:border-slate-700 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-start"><h4 className="font-semibold">File Analysis</h4><button onClick={handleRemoveFile} aria-label={`Remove uploaded file ${fileAnalysis.fileName}`} className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400 hover:underline flex-shrink-0"><CloseIcon className="w-3.5 h-3.5" />Remove</button></div>
                        <div className="flex flex-col sm:flex-row gap-4 text-center">
                            <div className="flex-1 p-2 bg-gray-300/40 dark:bg-black/20 rounded-md"><p className="text-xs font-medium text-gray-500 dark:text-slate-400">Quality</p><p className={`font-bold ${fileAnalysis.quality === 'Excellent' ? 'text-green-500' : fileAnalysis.quality === 'Good' ? 'text-blue-500 dark:text-sky-400' : 'text-yellow-400'}`}>{fileAnalysis.quality}</p></div>
                            <div className="flex-1 p-2 bg-gray-300/40 dark:bg-black/20 rounded-md"><p className="text-xs font-medium text-gray-500 dark:text-slate-400">Duration</p><p className="font-bold">{fileAnalysis.duration ? `${fileAnalysis.duration.toFixed(1)}s` : 'N/A'}</p></div>
                        </div>
                        {fileAnalysis.warnings.length > 0 && (<div className="space-y-2">{fileAnalysis.warnings.map((w, i) => (<div key={i} className={`p-2 rounded-md flex items-start gap-2.5 text-xs ${w.includes('short') || w.includes('long') ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300' : 'bg-blue-500/10 text-blue-600 dark:text-sky-300'}`}>{w.includes('short') || w.includes('long') ? <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />}<span>{w}</span></div>))}</div>)}
                    </div>
                )}
            </div>

            {isFileActive && (
                <div className="space-y-4 pt-6 mt-6 border-t border-[var(--card-border-light)] dark:border-slate-800 animate-fade-in">
                    <h4 className="text-md font-semibold">Fine-Tune Cloned Voice (Demonstration)</h4>
                    <FineTuneSlider id="timbre-slider" label="Timbre Similarity" value={cloneSettings.timbre} min={0} max={1} step={0.05} onChange={v => setCloneSettings(s => ({...s, timbre: v}))} />
                    <FineTuneSlider id="accent-slider" label="Accent Strength" value={cloneSettings.accent} min={0} max={1} step={0.05} onChange={v => setCloneSettings(s => ({...s, accent: v}))} />
                    <FineTuneSlider id="age-slider" label="Estimated Age" value={cloneSettings.age} min={10} max={80} step={1} onChange={v => setCloneSettings(s => ({...s, age: v}))} />
                </div>
            )}
        </div>
    );
};