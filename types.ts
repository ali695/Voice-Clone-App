
export interface VoiceSettings {
    language: 'EN' | 'UR' | 'DE' | 'AR' | 'HI' | 'TR';
    speed: number;
    pitch: number;
    temperature: number;
    emotionalDepth: number;
    clarity: number;
    breathingLevel: number;
    stability: number;
    accent: string;
}

export type Vibe = 
    'Dramatic' | 'Friendly' | 'Sincere' | 'Pirate' | 'Smooth Jazz DJ' | 
    'Whispering' | 'Emotional' | 'Documentary' | 'Motivational' | 'Villain' | 
    'News Anchor' | 'Calm Therapist' | 'Soft ASMR';

export interface VoiceProfile {
    id: string;
    name: string;
    description: string;
    settings: VoiceSettings;
    vibe: Vibe;
    audioSampleUrl?: string; // For cloned voices
}
