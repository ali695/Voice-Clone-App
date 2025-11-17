
import React, { useState } from 'react';
import type { VoiceProfile } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface VoiceLibraryProps {
    profiles: VoiceProfile[];
    activeProfileId: string;
    onSelectProfile: (id: string) => void;
    onCreateProfile: () => void;
    onDeleteProfile: (id: string) => void;
    onUpdateProfile: (id: string, updates: Partial<VoiceProfile>) => void;
}

export const VoiceLibrary: React.FC<VoiceLibraryProps> = ({
    profiles,
    activeProfileId,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onUpdateProfile
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleStartEdit = (profile: VoiceProfile) => {
        setEditingId(profile.id);
        setEditingName(profile.name);
    };

    const handleSaveEdit = (id: string) => {
        if (editingName.trim()) {
            onUpdateProfile(id, { name: editingName.trim() });
        }
        setEditingId(null);
        setEditingName('');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200">Voice Library</h2>
                <button
                    onClick={onCreateProfile}
                    className="p-2 rounded-md bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 transition-colors"
                    title="Create New Voice"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        onClick={() => onSelectProfile(profile.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${activeProfileId === profile.id ? 'bg-sky-500/20 border border-sky-400' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                    >
                        <div className="flex justify-between items-center">
                            {editingId === profile.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => handleSaveEdit(profile.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(profile.id)}
                                    className="bg-gray-800 text-white w-full text-md font-semibold focus:outline-none focus:ring-1 focus:ring-sky-400 rounded px-1"
                                    autoFocus
                                />
                            ) : (
                                <h3 className="text-md font-semibold text-gray-100 truncate" onDoubleClick={() => handleStartEdit(profile)}>{profile.name}</h3>
                            )}
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}
                                    className="p-1 rounded-md text-red-400 hover:bg-red-500/20"
                                    title="Delete Voice"
                                >
                                    <DeleteIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 truncate">{profile.description}</p>
                    </div>
                ))}
                {profiles.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No voice profiles yet.</p>
                        <p>Click the '+' button to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
