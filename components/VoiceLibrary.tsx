import React, { useState, useMemo, useEffect } from 'react';
import type { VoiceProfile } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { EditIcon } from './icons/EditIcon';
import { FolderPlusIcon } from './icons/FolderPlusIcon';
import { AccentIcon } from './icons/AccentIcon';
import { CharacterIcon } from './icons/CharacterIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { MotivationIcon } from './icons/MotivationIcon';
import { NarrationIcon } from './icons/NarrationIcon';
import { RelaxationIcon } from './icons/RelaxationIcon';
import { SocialMediaIcon } from './icons/SocialMediaIcon';
import { WhisperIcon } from './icons/WhisperIcon';
import { StorytellingIcon } from './icons/StorytellingIcon';
import { MyVoicesIcon } from './icons/MyVoicesIcon';
import { UltraHorrorIcon } from './icons/UltraHorrorIcon';
import { SearchIcon } from './icons/SearchIcon';


interface VoiceLibraryProps {
    profiles: VoiceProfile[];
    activeProfileId: string;
    customFolders: string[];
    onSelectProfile: (id: string) => void;
    onCreateProfile: () => void;
    onCreateFolder: (name: string) => boolean;
    onDeleteProfile: (id: string) => void;
    onUpdateProfile: (id: string, updates: Partial<VoiceProfile>) => void;
    onReorderProfiles: (reorderedProfiles: VoiceProfile[]) => void;
}

const categoryIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'Accents': AccentIcon,
    'Characters': CharacterIcon,
    'Languages': LanguageIcon,
    'Motivational & Deep': MotivationIcon,
    'Narration': NarrationIcon,
    'Relaxation': RelaxationIcon,
    'Social Media': SocialMediaIcon,
    'Soft Intimate Whisper': WhisperIcon,
    'Storytelling': StorytellingIcon,
    'Ultra-Horror': UltraHorrorIcon,
    'My Voices': MyVoicesIcon,
};

const VoiceItem: React.FC<{
    profile: VoiceProfile;
    isActive: boolean;
    isDragged: boolean;
    isDropTarget: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<VoiceProfile>) => void;
    dragAndDropProps: {
        draggable: boolean;
        onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
        onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
        onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    };
}> = ({ profile, isActive, isDragged, isDropTarget, onSelect, onDelete, onUpdate, dragAndDropProps }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);

    const handleSave = () => {
        if (name.trim() && name.trim() !== profile.name) {
            onUpdate({ name: name.trim() });
        }
        setIsEditing(false);
    };

    const combinedClassName = `p-3 rounded-xl cursor-pointer transition-all duration-200 group relative border
        ${isActive 
            ? 'bg-blue-500/10 dark:bg-slate-700/50 border-blue-500/30 dark:border-[var(--neon-blue)] shadow-md dark:shadow-lg dark:shadow-black/20' 
            : 'bg-slate-500/5 dark:bg-black/20 border-transparent hover:bg-slate-500/10 dark:hover:bg-black/40'
        } ${isDragged ? 'opacity-30' : 'opacity-100'} ${isDropTarget ? 'outline outline-2 outline-offset-2 outline-blue-500 dark:outline-[var(--neon-cyan)]' : ''}`;

    return (
        <div 
            onClick={onSelect} 
            className={combinedClassName} 
            role="button"
            aria-label={`Select voice profile: ${profile.name}`}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
            {...dragAndDropProps}
        >
            <div className="flex justify-between items-start">
                {isEditing ? (
                    <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-[var(--neon-cyan)] rounded px-2 py-1 -m-2"
                        autoFocus onClick={e => e.stopPropagation()}
                        aria-label={`Rename voice profile ${profile.name}`}
                    />
                ) : (
                    <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 truncate pr-16" onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                        {profile.name}
                    </h3>
                )}
                <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 rounded-md text-slate-500 hover:text-blue-500 dark:hover:text-[var(--neon-cyan)] hover:bg-blue-500/10 dark:hover:bg-cyan-500/10" aria-label={`Rename voice profile ${profile.name}`}><EditIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10" aria-label={`Delete voice profile ${profile.name}`}><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <p className="text-xs text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] mt-1 line-clamp-1 tracking-tight">{profile.description}</p>
        </div>
    );
};

export const VoiceLibrary: React.FC<VoiceLibraryProps> = ({
    profiles, activeProfileId, customFolders, onSelectProfile, onCreateProfile,
    onCreateFolder, onDeleteProfile, onUpdateProfile, onReorderProfiles
}) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['My Voices']));
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderError, setFolderError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const filteredProfiles = useMemo(() => {
        if (!searchQuery.trim()) return profiles;
        const lowercasedQuery = searchQuery.toLowerCase();
        return profiles.filter(p =>
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.description.toLowerCase().includes(lowercasedQuery)
        );
    }, [profiles, searchQuery]);

    const groupedProfiles = useMemo(() => {
        const groups = filteredProfiles.reduce((acc, profile) => {
            const category = profile.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(profile);
            return acc;
        }, {} as Record<string, VoiceProfile[]>);

        if (!searchQuery.trim()) { customFolders.forEach(folder => { if (!groups[folder]) groups[folder] = []; }); }

        const builtInOrder = ['My Voices', ...customFolders.sort(), 'Narration', 'Storytelling', 'Motivational & Deep', 'Social Media', 'Relaxation', 'Soft Intimate Whisper', 'Ultra-Horror', 'Characters', 'Accents', 'Languages'];
        const orderedGroups: Record<string, VoiceProfile[]> = {};
        builtInOrder.forEach(category => { if (groups[category] !== undefined) orderedGroups[category] = groups[category]; });
        Object.keys(groups).filter(cat => !orderedGroups[cat]).sort().forEach(cat => { orderedGroups[cat] = groups[cat]; });
        return orderedGroups;
    }, [filteredProfiles, customFolders, searchQuery]);
    
    useEffect(() => {
        const activeProfile = profiles.find(p => p.id === activeProfileId);
        if (activeProfile?.category && !expandedFolders.has(activeProfile.category)) {
            toggleFolder(activeProfile.category);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProfileId, profiles.length]);

    const toggleFolder = (category: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category); else newSet.add(category);
            return newSet;
        });
    };

    const handleSaveFolder = () => {
        setFolderError('');
        if (newFolderName.trim()) {
            const success = onCreateFolder(newFolderName);
            if (success) {
                setExpandedFolders(prev => new Set(prev).add(newFolderName.trim())); setIsCreatingFolder(false); setNewFolderName('');
            } else { setFolderError(`Folder "${newFolderName.trim()}" already exists.`); }
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, profileId: string) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', profileId); setDraggedItemId(profileId); };
    const handleDragEnd = () => { setDraggedItemId(null); setDropTargetId(null); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, profileId: string) => { e.preventDefault(); if (draggedItemId && draggedItemId !== profileId) setDropTargetId(profileId); };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropProfile: VoiceProfile) => {
        e.preventDefault();
        const draggedProfileId = e.dataTransfer.getData('text/plain');
        const draggedProfile = profiles.find(p => p.id === draggedProfileId);
        if (!draggedProfile || draggedProfile.id === dropProfile.id || draggedProfile.category !== dropProfile.category) { handleDragEnd(); return; }
        const reordered = [...profiles];
        const from = reordered.findIndex(p => p.id === draggedProfileId);
        const to = reordered.findIndex(p => p.id === dropProfile.id);
        if (from !== -1 && to !== -1) {
            const [removed] = reordered.splice(from, 1); reordered.splice(to, 0, removed); onReorderProfiles(reordered);
        }
        handleDragEnd();
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-6 space-y-4 border-b border-[var(--card-border-light)] dark:border-[var(--card-border-dark)]">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Library</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsCreatingFolder(p => !p)} className="p-2 rounded-lg bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all" aria-label="Create new folder"><FolderPlusIcon className="w-5 h-5" /></button>
                        <button 
                            onClick={onCreateProfile} 
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl text-white transition-all duration-300 hover:-translate-y-px 
                                       bg-[var(--btn-secondary-gradient-light)] shadow-[var(--btn-secondary-shadow-light)] hover:shadow-[var(--btn-secondary-shadow-hover-light)]
                                       dark:bg-[var(--control-bg-dark)] dark:border dark:border-[var(--neon-cyan)] dark:shadow-[var(--neon-cyan-glow)] dark:hover:bg-cyan-900/40" 
                            aria-label="Create new voice profile"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>New Voice</span>
                        </button>
                    </div>
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none"><SearchIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" /></span>
                    <input type="text" placeholder="Search voices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Search voice profiles" className="w-full bg-[var(--control-bg-light)] dark:bg-[var(--control-bg-dark)] rounded-lg border border-[var(--card-border-light)] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--neon-cyan)] dark:focus:border-[var(--neon-cyan)] focus:border-blue-500 transition text-base placeholder:text-slate-500 py-2.5 pl-10 pr-4 shadow-inner" />
                </div>
                {isCreatingFolder && (
                    <div className="flex flex-col gap-2 pt-2 animate-fade-in">
                         <div className="flex gap-2 items-center">
                            <input type="text" value={newFolderName} onChange={(e) => {setNewFolderName(e.target.value); setFolderError('')}} onKeyDown={(e) => e.key === 'Enter' && handleSaveFolder()} placeholder="New folder name..." className={`flex-grow bg-[var(--control-bg-light)] dark:bg-black/20 rounded-lg border transition text-sm px-3 py-1.5 w-full ${folderError ? 'border-red-500/50 ring-2 ring-red-500/30' : 'border-[var(--card-border-light)] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[var(--neon-cyan)] focus:border-blue-500 dark:focus:border-[var(--neon-cyan)]'}`} autoFocus />
                            <button onClick={handleSaveFolder} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 dark:bg-[var(--neon-blue)] text-white font-semibold hover:bg-blue-700 dark:hover:opacity-80 transition-opacity disabled:opacity-50" disabled={!newFolderName.trim()}>Save</button>
                        </div>
                        {folderError && <p className="text-xs text-red-500 dark:text-red-400 mt-1 px-1">{folderError}</p>}
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
                {Object.keys(groupedProfiles).length > 0 ? (
                    Object.entries(groupedProfiles).map(([category, voices]: [string, VoiceProfile[]]) => {
                        const isExpanded = expandedFolders.has(category);
                        const CategoryIcon = categoryIcons[category] || MyVoicesIcon;
                        return (
                            <div key={category} className="dark:bg-black/20 rounded-2xl transition-all duration-300 group">
                                <button 
                                    onClick={() => toggleFolder(category)} 
                                    className="w-full flex justify-between items-center p-4 text-left transition-all duration-300 rounded-2xl group-hover:dark:bg-slate-800/40 group-hover:-translate-y-0.5 group-hover:shadow-lg"
                                    aria-expanded={isExpanded}
                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category} category`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-200 dark:bg-slate-900/50 rounded-lg"><CategoryIcon className="w-6 h-6 text-slate-700 dark:text-[var(--neon-cyan)] flex-shrink-0" /></div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold text-base tracking-tight text-slate-800 dark:text-slate-100 leading-tight">{category}</span>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-1">{voices.length} {voices.length === 1 ? 'item' : 'items'}</span>
                                        </div>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 text-slate-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isExpanded && (
                                    <div className="px-3 pb-3 space-y-2 animate-fade-in" onDragOver={(e) => e.preventDefault()}>
                                        {voices.map(profile => (
                                            <VoiceItem key={profile.id} profile={profile} isActive={activeProfileId === profile.id} isDragged={draggedItemId === profile.id} isDropTarget={dropTargetId === profile.id} onSelect={() => onSelectProfile(profile.id)} onDelete={() => onDeleteProfile(profile.id)} onUpdate={(updates) => onUpdateProfile(profile.id, updates)}
                                                dragAndDropProps={{ draggable: true, onDragStart: (e) => handleDragStart(e, profile.id), onDragEnd: handleDragEnd, onDragOver: (e) => handleDragOver(e, profile.id), onDrop: (e) => handleDrop(e, profile), }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : profiles.length > 0 && searchQuery.trim() ? (
                    <div className="text-center py-10 text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)]"><p>No results found for "{searchQuery}".</p></div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-10 text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] h-full flex flex-col items-center justify-center"><p>Your library is empty.</p><p>Click the '+' button to begin.</p></div>
                ) : null}
            </div>
        </div>
    );
};