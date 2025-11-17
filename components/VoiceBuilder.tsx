import React, { useCallback, useState } from 'react';
import type { VoiceProfile, Vibe } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface VoiceBuilderProps {
    profile: VoiceProfile;
    onUpdate: (id: string, updates: Partial<VoiceProfile>) => void;
    addLog: (message: string) => void;
}

const VIBES: Vibe[] = [
    'Dramatic', 'Friendly', 'Sincere', 'Pirate', 'Smooth Jazz DJ', 'Whispering', 
    'Emotional', 'Documentary', 'Motivational', 'Villain', 'News Anchor', 'Calm Therapist', 'Soft ASMR',
    'Horror Narrator', 'Fairytale Teller', 'Action Narrator', 'Bedtime Story'
];

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3.75 3.75M12 9.75L8.25 13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25v2.25c0 1.518 1.232 2.75 2.75 2.75h13.5A2.75 2.75 0 0021 19.5V17.25" />
    </svg>
);

const FineTuneSlider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }> = ({ label, value, min, max, step, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
            <span>{label}</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">{value}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500 dark:accent-sky-400"
        />
    </div>
);


export const VoiceBuilder: React.FC<VoiceBuilderProps> = ({ profile, onUpdate, addLog }) => {
    
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [cloneSettings, setCloneSettings] = useState({
        timbre: 0.75,
        accent: 0.50,
        age: 35,
    });

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(profile.id, { description: e.target.value });
    };

    const handleVibeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVibe = e.target.value as Vibe;
        onUpdate(profile.id, { vibe: newVibe });
        addLog(`Vibe set to: ${newVibe}`);
    };
    
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size / 1024 / 1024 > 50) { // 50MB limit, approx 5 mins for WAV
                addLog('Error: File size should not exceed 50MB.');
                e.target.value = '';
                return;
            }
            setUploadedFile(file);
            addLog(`Uploaded ${file.name} for voice cloning.`);
        }
    }, [addLog]);

    const handleRemoveFile = () => {
        setUploadedFile(null);
        addLog('Removed uploaded file.');
        const input = document.getElementById('audio-upload') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-slate-100">Voice Builder</h2>
                <label htmlFor="voice-description" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Describe the voice you want to create:</label>
                <textarea
                    id="voice-description"
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 focus:border-transparent transition text-slate-800 dark:text-slate-200 p-3"
                    placeholder="e.g., A deep, calm male monk for meditation guides"
                    value={profile.description}
                    onChange={handleDescriptionChange}
                />
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Personality & Vibe</h3>
                <select 
                    value={profile.vibe} 
                    onChange={handleVibeChange}
                    className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 focus:border-transparent transition text-slate-800 dark:text-slate-200 p-2.5"
                >
                    {VIBES.map(vibe => (
                        <option key={vibe} value={vibe}>{vibe}</option>
                    ))}
                </select>
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Voice-to-Voice Cloning</h3>
                 {uploadedFile ? (
                    <div className="p-4 border-2 border-sky-500 bg-sky-50 dark:bg-sky-900/30 rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-center">
                        <p className="text-slate-700 dark:text-slate-200 font-semibold truncate w-full px-4">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        <button onClick={handleRemoveFile} className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                            <CloseIcon className="w-4 h-4" />
                            Remove file
                        </button>
                    </div>
                ) : (
                    <label
                        htmlFor="audio-upload"
                        className="group cursor-pointer p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-center transition-colors duration-300 flex flex-col items-center justify-center"
                    >
                        <UploadIcon className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-sky-400 transition-colors mb-3" />
                        <p className="text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                           <span className="text-sky-500 dark:text-sky-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Upload audio sample (up to 5 mins)</p>
                        <input
                            type="file"
                            id="audio-upload"
                            className="hidden"
                            accept=".mp3,.wav,.ogg"
                            onChange={handleFileUpload}
                        />
                    </label>
                )}
            </div>

            {uploadedFile && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                    <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200">Fine-Tune Cloned Voice (Demonstration)</h4>
                    <FineTuneSlider 
                        label="Timbre Similarity" 
                        value={cloneSettings.timbre} 
                        min={0} max={1} step={0.05} 
                        onChange={v => setCloneSettings(s => ({...s, timbre: v}))} 
                    />
                    <FineTuneSlider 
                        label="Accent Strength" 
                        value={cloneSettings.accent} 
                        min={0} max={1} step={0.05} 
                        onChange={v => setCloneSettings(s => ({...s, accent: v}))} 
                    />
                    <FineTuneSlider 
                        label="Estimated Age" 
                        value={cloneSettings.age} 
                        min={10} max={80} step={1} 
                        onChange={v => setCloneSettings(s => ({...s, age: v}))} 
                    />
                </div>
            )}
        </div>
    );
};