
import React from 'react';
import type { VoiceSettings as VoiceSettingsType } from '../types';

interface VoiceSettingsProps {
    settings: VoiceSettingsType;
    onUpdate: (newSettings: Partial<VoiceSettingsType>) => void;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }> = ({ label, value, min, max, step, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 flex justify-between">
            <span>{label}</span>
            <span>{value.toFixed(2)}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
    </div>
);

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ settings, onUpdate }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Voice Settings</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Language</label>
                        <select 
                            value={settings.language} 
                            onChange={(e) => onUpdate({ language: e.target.value as VoiceSettingsType['language'] })}
                            className="w-full mt-1 bg-gray-700/50 rounded-md border border-gray-600 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition text-gray-200 p-2"
                        >
                            <option>EN</option>
                            <option>UR</option>
                            <option>DE</option>
                            <option>AR</option>
                            <option>HI</option>
                            <option>TR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Accent (Informational)</label>
                        <input 
                            type="text"
                            value={settings.accent}
                            onChange={(e) => onUpdate({ accent: e.target.value })}
                            placeholder="e.g., British, Australian"
                            className="w-full mt-1 bg-gray-700/50 rounded-md border border-gray-600 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition text-gray-200 p-2"
                        />
                    </div>
                </div>
                <Slider label="Speed" value={settings.speed} min={0.5} max={2.0} step={0.05} onChange={v => onUpdate({ speed: v })} />
                <Slider label="Pitch" value={settings.pitch} min={0.5} max={1.5} step={0.05} onChange={v => onUpdate({ pitch: v })} />
                <Slider label="Stability" value={settings.stability} min={0} max={1} step={0.05} onChange={v => onUpdate({ stability: v })} />
                <Slider label="Clarity + Articulation" value={settings.clarity} min={0} max={1} step={0.05} onChange={v => onUpdate({ clarity: v })} />
                <Slider label="Emotional Depth" value={settings.emotionalDepth} min={0} max={1} step={0.05} onChange={v => onUpdate({ emotionalDepth: v })} />
                <Slider label="Breathing Level" value={settings.breathingLevel} min={0} max={1} step={0.05} onChange={v => onUpdate({ breathingLevel: v })} />
            </div>
        </div>
    );
};
