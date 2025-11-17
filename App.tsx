
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { VoiceBuilder } from './components/VoiceBuilder';
import { VoiceSettings } from './components/VoiceSettings';
import { ScriptEditor } from './components/ScriptEditor';
import { VoiceLibrary } from './components/VoiceLibrary';
import type { VoiceProfile, VoiceSettings as VoiceSettingsType } from './types';

const App: React.FC = () => {
    const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([
        {
            id: 'vp_1',
            name: 'Narrator',
            description: 'A clear, deep male voice for documentary narration.',
            settings: {
                language: 'EN',
                speed: 1.0,
                pitch: 1.0,
                temperature: 0.7,
                emotionalDepth: 0.8,
                clarity: 0.9,
                breathingLevel: 0.2,
                stability: 0.8,
                accent: 'American',
            },
            vibe: 'Documentary',
        }
    ]);
    const [activeProfileId, setActiveProfileId] = useState<string>('vp_1');
    const [generationLog, setGenerationLog] = useState<string[]>([]);

    const activeProfile = voiceProfiles.find(p => p.id === activeProfileId);

    const addLog = (message: string) => {
        setGenerationLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 100));
    };

    const handleUpdateProfile = useCallback((id: string, updates: Partial<VoiceProfile>) => {
        setVoiceProfiles(prevProfiles =>
            prevProfiles.map(p => p.id === id ? { ...p, ...updates } : p)
        );
    }, []);
    
    const handleUpdateSettings = useCallback((id: string, newSettings: Partial<VoiceSettingsType>) => {
        setVoiceProfiles(prevProfiles =>
            prevProfiles.map(p =>
                p.id === id ? { ...p, settings: { ...p.settings, ...newSettings } } : p
            )
        );
    }, []);

    const handleCreateNewProfile = useCallback(() => {
        const newId = `vp_${Date.now()}`;
        const newProfile: VoiceProfile = {
            id: newId,
            name: `New Voice ${voiceProfiles.length + 1}`,
            description: 'A new custom voice.',
            settings: {
                language: 'EN',
                speed: 1.0,
                pitch: 1.0,
                temperature: 0.5,
                emotionalDepth: 0.5,
                clarity: 0.75,
                breathingLevel: 0.1,
                stability: 0.75,
                accent: 'None',
            },
            vibe: 'Friendly',
        };
        setVoiceProfiles(prev => [...prev, newProfile]);
        setActiveProfileId(newId);
        addLog(`Created new voice profile: ${newProfile.name}`);
    }, [voiceProfiles.length]);

    const handleDeleteProfile = useCallback((id: string) => {
        setVoiceProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) {
            setActiveProfileId(voiceProfiles.length > 1 ? voiceProfiles.filter(p=>p.id !== id)[0].id : '');
        }
        addLog(`Deleted voice profile.`);
    }, [activeProfileId, voiceProfiles]);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header />
            <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                <div className="xl:col-span-3 bg-gray-800/50 rounded-lg p-4 flex flex-col overflow-y-auto">
                    <VoiceLibrary
                        profiles={voiceProfiles}
                        activeProfileId={activeProfileId}
                        onSelectProfile={setActiveProfileId}
                        onCreateProfile={handleCreateNewProfile}
                        onDeleteProfile={handleDeleteProfile}
                        onUpdateProfile={handleUpdateProfile}
                    />
                </div>

                <div className="xl:col-span-5 bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                    {activeProfile ? (
                        <>
                            <VoiceBuilder profile={activeProfile} onUpdate={handleUpdateProfile} addLog={addLog} />
                            <VoiceSettings settings={activeProfile.settings} onUpdate={(newSettings) => handleUpdateSettings(activeProfile.id, newSettings)} />
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-gray-400">Select or create a voice profile to begin.</p>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-4 bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                    {activeProfile ? (
                        <ScriptEditor profile={activeProfile} addLog={addLog} generationLog={generationLog} />
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-gray-400">Select a profile to use the script editor.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
