import React from 'react';

interface WaveformProps {
    playing: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ playing }) => {
    const bars = Array.from({ length: 60 }, (_, i) => {
        const height = Math.random() * 80 + 10;
        const animationDelay = `${Math.random() * -0.8}s`;
        const animationDuration = `${0.6 + Math.random() * 0.5}s`;
        return { height, animationDelay, animationDuration };
    });

    return (
        <div className="w-full h-24 flex items-center justify-center gap-1">
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-sky-500 to-teal-300 rounded-full"
                    style={{
                        height: `10%`,
                        transform: `scaleY(${playing ? bar.height / 100 : 1})`,
                        animation: playing ? `wave ${bar.animationDuration} infinite alternate` : 'none',
                        animationDelay: bar.animationDelay,
                        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                />
            ))}
            <style>
                {`
                @keyframes wave {
                    from { transform: scaleY(0.1); }
                    to { transform: scaleY(1); }
                }
                `}
            </style>
        </div>
    );
};