
import React from 'react';

interface WaveformProps {
    playing: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ playing }) => {
    const bars = Array.from({ length: 50 }, (_, i) => {
        const height = Math.random() * 80 + 10;
        const animationDelay = `${Math.random() * 0.5}s`;
        const animationDuration = `${0.5 + Math.random() * 0.5}s`;
        return { height, animationDelay, animationDuration };
    });

    return (
        <div className="w-full h-20 flex items-center justify-center gap-1">
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className="w-1 bg-sky-400/50 rounded-full"
                    style={{
                        height: `${playing ? bar.height : 10}%`,
                        animation: playing ? `wave ${bar.animationDuration} infinite alternate` : 'none',
                        animationDelay: bar.animationDelay,
                        transition: 'height 0.3s ease-out',
                    }}
                />
            ))}
            <style>
                {`
                @keyframes wave {
                    from { transform: scaleY(0.2); }
                    to { transform: scaleY(1); }
                }
                `}
            </style>
        </div>
    );
};
