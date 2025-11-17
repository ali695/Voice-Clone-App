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
            <div className="flex justify-between items-center mb-4 px-6 pt-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Voice Library</h2>
                <button
                    onClick={onCreateProfile}
                    className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-teal-500/80 to-sky-500/80 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300"
                    title="Create New Voice"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 p-6 pt-0">
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        onClick={() => onSelectProfile(profile.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group relative border ${activeProfileId === profile.id ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-400 dark:border-sky-500' : 'bg-slate-100 dark:bg-slate-700/40 border-transparent hover:bg-slate-200/70 dark:hover:bg-slate-700/80'}`}
                    >
                        <div className="flex justify-between items-start">
                            {editingId === profile.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => handleSaveEdit(profile.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(profile.id)}
                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full text-md font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 rounded px-2 py-1 -m-2"
                                    autoFocus
                                />
                            ) : (
                                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate pr-8" onDoubleClick={() => handleStartEdit(profile)}>{profile.name}</h3>
                            )}
                            <div className="absolute top-3 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}
                                    className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                                    title="Delete Voice"
                                >
                                    <DeleteIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{profile.description}</p>
                    </div>
                ))}
                {profiles.length === 0 && (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-500 h-full flex flex-col items-center justify-center">
                        <p>No voice profiles found.</p>
                        <p>Click the '+' button to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};