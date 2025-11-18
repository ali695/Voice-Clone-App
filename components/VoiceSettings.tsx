import React, { useState, useRef, useEffect } from 'react';
import type { VoiceSettings as VoiceSettingsType, ViralAccent } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface VoiceSettingsProps {
    settings: VoiceSettingsType;
    onUpdate: (newSettings: Partial<VoiceSettingsType>) => void;
}

const ACCENT_PRESETS: ViralAccent[] = [
    'Neutral EN', 'British Warm', 'American Reels Style', 'German Soft', 
    'Turkish Soft Emotional', 'Urdu Emotional', 'Arabic Velvet', 
    'Indian Cinematic', 'Deep Documentary', 'Viral Short-Form', 'Whisper Accent', 'Gentle Therapist'
];

const StudioSlider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }> = ({ id, label, value, min, max, step, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] mb-2 flex justify-between tracking-tight">
            <span>{label}</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">{value.toFixed(2)}</span>
        </label>
        <input
            id={id}
            type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-full appearance-none cursor-pointer accent-blue-600 dark:accent-[var(--neon-cyan)]"
        />
    </div>
);


const CustomSelect: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: any) => void;
}> = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <label className="block text-sm font-medium text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] mb-2">{label}</label>
            <button 
                onClick={() => setIsOpen(p => !p)} 
                className="w-full flex justify-between items-center bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-lg border border-[var(--card-border-light)] dark:border-slate-700 p-2.5 transition-all duration-200 shadow-sm hover:border-blue-500/50 dark:hover:border-[var(--neon-cyan)]"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={`${label}, Current value: ${value}`}
            >
                <span className="font-medium text-sm">{value}</span>
                <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full max-h-48 overflow-y-auto bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-20">
                    {options.map(option => (
                        <button key={option} onClick={() => { onChange(option); setIsOpen(false); }} className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === option ? 'bg-blue-600 dark:bg-[var(--neon-blue)] text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'}`}>{option}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ settings, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="p-6">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isOpen}
                aria-controls="voice-settings-panel"
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} Voice Settings`}
            >
                <h2 className="text-xl font-extrabold tracking-tight">Voice Settings</h2>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div id="voice-settings-panel" className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomSelect label="Language" value={settings.language} options={['EN', 'UR', 'DE', 'AR', 'HI', 'TR', 'ES', 'FR', 'JA', 'RU', 'ZH']} onChange={(v) => onUpdate({ language: v as VoiceSettingsType['language'] })} />
                            <CustomSelect label="Accent Preset" value={settings.accent} options={ACCENT_PRESETS} onChange={(v) => onUpdate({ accent: v })} />
                        </div>
                        <StudioSlider id="speed-slider" label="Speed" value={settings.speed} min={0.5} max={2.0} step={0.05} onChange={v => onUpdate({ speed: v })} />
                        <StudioSlider id="pitch-slider" label="Pitch" value={settings.pitch} min={0.5} max={1.5} step={0.05} onChange={v => onUpdate({ pitch: v })} />
                        <StudioSlider id="stability-slider" label="Stability" value={settings.stability} min={0} max={1} step={0.05} onChange={v => onUpdate({ stability: v })} />
                        <StudioSlider id="clarity-slider" label="Clarity + Articulation" value={settings.clarity} min={0} max={1} step={0.05} onChange={v => onUpdate({ clarity: v })} />
                        <StudioSlider id="emotional-depth-slider" label="Emotional Depth" value={settings.emotionalDepth} min={0} max={1} step={0.05} onChange={v => onUpdate({ emotionalDepth: v })} />
                        <StudioSlider id="breathing-level-slider" label="Breathing Level" value={settings.breathingLevel} min={0} max={1} step={0.05} onChange={v => onUpdate({ breathingLevel: v })} />
                    </div>
                </div>
            </div>
        </div>
    );
};