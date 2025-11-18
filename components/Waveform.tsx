import React, { useRef, useEffect } from 'react';

interface WaveformProps {
    isPlaying: boolean;
    analyserNode: AnalyserNode | null;
    theme: 'light' | 'dark';
}

const NUM_BARS = 64;

export const Waveform: React.FC<WaveformProps> = ({ isPlaying, analyserNode, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const resetCanvas = () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            context.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = canvas.width / (NUM_BARS * 1.5);
            const barSpacing = barWidth / 2;
            let x = 0;
            context.fillStyle = theme === 'dark' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(100, 116, 139, 0.2)';
            for (let i = 0; i < NUM_BARS; i++) {
                context.beginPath();
                const rectArgs: [number, number, number, number, number] = [x, canvas.height / 2 - 1, barWidth, 2, 2];
                // @ts-ignore
                if (context.roundRect) context.roundRect(...rectArgs); else context.rect(rectArgs[0], rectArgs[1], rectArgs[2], rectArgs[3]);
                context.fill();
                x += barWidth + barSpacing;
            }
        };

        if (!isPlaying || !analyserNode) {
            resetCanvas();
            return;
        }

        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

        const draw = () => {
            if (!analyserNode || !canvasRef.current) return;
            
            analyserNode.getByteFrequencyData(dataArray);
            context.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / (NUM_BARS * 1.5);
            const barSpacing = barWidth / 2;
            let x = 0;

            if (theme === 'dark') {
                const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#67e8f9'); // cyan-300
                gradient.addColorStop(0.7, '#22d3ee'); // cyan-400
                context.fillStyle = gradient;
                context.shadowColor = 'rgba(34, 211, 238, 0.7)';
                context.shadowBlur = 10;
            } else {
                context.fillStyle = '#1e3a8a'; // blue-900
                context.shadowColor = 'transparent';
                context.shadowBlur = 0;
            }

            for (let i = 0; i < NUM_BARS; i++) {
                const barHeight = Math.pow(dataArray[i] / 255, 2) * canvas.height;
                context.beginPath();
                const rectArgs: [number, number, number, number, number] = [x, (canvas.height - barHeight) / 2, barWidth, barHeight, barWidth / 2];
                 // @ts-ignore
                if (context.roundRect) context.roundRect(...rectArgs); else context.rect(rectArgs[0], rectArgs[1], rectArgs[2], rectArgs[3]);
                context.fill();
                x += barWidth + barSpacing;
            }
            animationFrameId.current = requestAnimationFrame(draw);
        };

        draw();

        return () => { if (animationFrameId.current) { cancelAnimationFrame(animationFrameId.current); } };
    }, [isPlaying, analyserNode, theme]);

    return <canvas ref={canvasRef} width="600" height="96" className="w-full h-24" />;
};