
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-3">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">
                    VoiceGen Studio
                </h1>
            </div>
        </header>
    );
};
