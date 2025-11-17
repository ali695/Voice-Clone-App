
import React, { useCallback } from 'react';
import type { VoiceProfile, Vibe } from '../types';

interface VoiceBuilderProps {
    profile: VoiceProfile;
    onUpdate: (id: string, updates: Partial<VoiceProfile>) => void;
    addLog: (message: string) => void;
}

const VIBES: Vibe[] = [
    'Dramatic', 'Friendly', 'Sincere', 'Pirate', 'Smooth Jazz DJ', 'Whispering', 
    'Emotional', 'Documentary', 'Motivational', 'Villain', 'News Anchor', 'Calm Therapist', 'Soft ASMR'
];

export const VoiceBuilder: React.FC<VoiceBuilderProps> = ({ profile, onUpdate, addLog }) => {
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(profile.id, { description: e.target.value });
    };

    const handleVibeClick = (vibe: Vibe) => {
        onUpdate(profile.id, { vibe });
        addLog(`Vibe set to: ${vibe}`);
    };
    
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size / 1024 / 1024 > 5) {
                addLog('Error: File size should not exceed 5MB.');
                return;
            }
            addLog(`Uploaded ${file.name} for voice cloning. (Feature is a demonstration)`);
            // In a real app, you would process this file.
            // For now, we'll just log it. This feature is for UI demonstration.
        }
    }, [addLog]);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-200">Voice Builder</h2>
                <label htmlFor="voice-description" className="block text-sm font-medium text-gray-400 mb-1">Describe the voice you want to create:</label>
                <textarea
                    id="voice-description"
                    rows={3}
                    className="w-full bg-gray-700/50 rounded-md border border-gray-600 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition text-gray-200 p-2"
                    placeholder="e.g., A deep, calm male monk for meditation guides"
                    value={profile.description}
                    onChange={handleDescriptionChange}
                />
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Voice Personality & Vibe</h3>
                <div className="flex flex-wrap gap-2">
                    {VIBES.map(vibe => (
                        <button
                            key={vibe}
                            onClick={() => handleVibeClick(vibe)}
                            className={`px-3 py-1 text-sm rounded-full transition-all ${profile.vibe === vibe ? 'bg-sky-500 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >
                            {vibe}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Voice-to-Voice Cloning</h3>
                <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                    <p className="text-gray-400 mb-2">Upload a 5-60 second audio sample (.mp3, .wav)</p>
                     <input
                        type="file"
                        id="audio-upload"
                        className="hidden"
                        accept=".mp3,.wav,.ogg"
                        onChange={handleFileUpload}
                    />
                    <label
                        htmlFor="audio-upload"
                        className="cursor-pointer inline-block bg-teal-500/80 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition"
                    >
                        Upload Audio
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Note: This is a UI demonstration. Voice cloning requires a dedicated backend.</p>
                </div>
            </div>
        </div>
    );
};
