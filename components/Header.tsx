import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ChatIcon } from './icons/ChatIcon';

const AudioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 12H5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 12H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.5 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.5 12H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.5 12H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    activeTab: 'audio' | 'chat';
    setActiveTab: (tab: 'audio' | 'chat') => void;
}

const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    ariaLabel: string;
}> = ({ isActive, onClick, icon, label, ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--bg-dark)] focus-visible:ring-[var(--neon-blue)]
            ${isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
    >
        {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-20 dark:opacity-50"></div>
        )}
         <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isActive 
                ? 'bg-white/80 dark:bg-slate-800/60'
                : 'bg-transparent'
        }`}></div>
        <div className="relative flex items-center gap-2.5">
            {icon}
            <span>{label}</span>
        </div>
    </button>
);


export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, activeTab, setActiveTab }) => {
    return (
        <header className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] backdrop-blur-2xl rounded-2xl border border-[var(--card-border-light)] dark:border-[var(--card-border-dark)] shadow-[var(--card-shadow-light)] dark:shadow-[var(--card-shadow-dark)] flex-shrink-0 z-10">
            <div className="flex items-center justify-between p-1.5">
                <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-black/20 rounded-full">
                    <TabButton 
                        isActive={activeTab === 'audio'}
                        onClick={() => setActiveTab('audio')}
                        icon={<AudioIcon className="w-5 h-5" />}
                        label="Audio Generator"
                        ariaLabel="Switch to Audio Generator"
                    />
                     <TabButton 
                        isActive={activeTab === 'chat'}
                        onClick={() => setActiveTab('chat')}
                        icon={<ChatIcon className="w-5 h-5" />}
                        label="Chatbot"
                        ariaLabel="Switch to Chatbot"
                    />
                </div>
                 <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full text-slate-500 dark:text-slate-300 bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 border border-transparent dark:hover:border-[var(--card-border-dark)] dark:hover:shadow-[var(--neon-cyan-glow)]"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};