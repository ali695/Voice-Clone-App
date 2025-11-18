import { GoogleGenAI, Modality } from "@google/genai";
import type { VoiceProfile } from '../types';

// IMPORTANT: This key is managed externally and will be provided in the execution environment.
// Do not modify this line or add any UI for key management.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this environment, we assume the key is always present.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// This function creates a detailed, context-aware prompt to guide the AI model
// into generating a voice that accurately matches the selected profile.
function constructPrompt(script: string, profile: VoiceProfile): string {
    const { name, category, settings, vibe, audioSampleUrl } = profile;

    if (audioSampleUrl) {
        // This is a cloned voice. Prioritize the user's voice identity above all else.
        const cloningInstruction = `CRITICAL INSTRUCTION: The user has provided a reference audio file for strict voice-to-voice cloning. Your highest priority is to generate the following script in a voice that EXACTLY matches the core vocal identity of the speaker from the user's reference file. This includes perfectly replicating their natural tone, timbre, accent, pacing, pitch, warmth, breathiness, and unique vocal characteristics. The generated audio must sound like the exact same person.`;
        const stylingInstruction = `The selected 'Personality & Vibe' of '${vibe}' should ONLY influence the intonation, mood, and emotional delivery of the speech. It must NOT alter the core sound or identity of the cloned voice. Style the performance on top of the user's voice; do not replace it with a preset model.`;
        
        return `${cloningInstruction} ${stylingInstruction} The script to be spoken is: "${script}"`;
    }

    let mainInstruction = '';
    const nameLower = name.toLowerCase();

    // Create highly specific instructions based on the category for maximum accuracy.
    switch (category) {
        case 'Ultra-Horror':
            const horrorPreamble = 'The voice should sound professionally sound-designed for a horror film or game. ';
            if (nameLower.includes('demonic')) mainInstruction = horrorPreamble + 'in a deep, layered, and distorted demonic voice with heavy, eerie reverb, low demonic harmonics, and a subtle, deep heartbeat bass tone in the background. The voice should have an echoing quality and include subtle, non-human growls.';
            else if (nameLower.includes('witch')) mainInstruction = horrorPreamble + 'in a high-pitched, cackling, and sinister witch-like voice, with sharp, cutting tones and a hint of a rasp.';
            else if (nameLower.includes('possessed')) mainInstruction = horrorPreamble + 'in a raspy, strained, close-mic whisper, as if possessed, with unsettling quiet moments and faint background whispers that have a subtle, eerie reverb and whisper echo. The performance should have sudden shifts in tone and pitch, and emphasize sharp inhales.';
            else if (nameLower.includes('ghost')) mainInstruction = horrorPreamble + 'in an ethereal, airy, and cold ghost voice. It must sound disembodied, with a noticeable eerie reverb and a sense of distant sorrow that echoes slightly.';
            else if (nameLower.includes('monster')) mainInstruction = horrorPreamble + 'in a very deep, guttural, and inhuman monster-like growl, with a rumbling, visceral quality and a hint of a wet, throaty sound, as if struggling to form words.';
            else mainInstruction = horrorPreamble + 'in the creepy, slow, and slightly shaky voice of an old man telling a terrifying horror story, emphasizing suspenseful pauses and a cracking, dry vocal quality.';
            break;
        
        case 'Characters':
            let charPerformanceNote = `The performance should be ${vibe.toLowerCase()}`;
            if (nameLower.includes('robot') || nameLower.includes('ai')) {
                 mainInstruction = `in the voice of a character: a synthetic AI. The performance should be clear and articulate, with a slightly processed, cybernetic quality. It should be mostly monotonous but with subtle intonations to match the '${vibe}' mood.`;
            } else if (nameLower.includes('wizard')) {
                mainInstruction = `in the voice of a character: a wise, ancient wizard. The voice should be deep, resonant, and slightly gravelly with age. The pacing is slow and deliberate, filled with gravitas. ${charPerformanceNote}.`;
            } else if (nameLower.includes('pirate')) {
                mainInstruction = `in the voice of a character: a boisterous pirate captain. The voice is gruff, hearty, and full of swagger, with a classic, exaggerated pirate accent. ${charPerformanceNote}.`;
            } else if (nameLower.includes('fairy')) {
                mainInstruction = `in the voice of a character: a magical fairy. The voice should be light, ethereal, and musical, with a soft, enchanting quality. ${charPerformanceNote}.`;
            } else if (nameLower.includes('epic sage')) {
                mainInstruction = `in the voice of a character: a fantasy epic sage. The voice is deep, wise, and ancient, perfect for narrating tales of myth and magic with a dramatic and powerful tone.`;
            } else {
                mainInstruction = `in the voice of a character: ${name}. The performance should be ${vibe.toLowerCase()}`;
            }
            break;

        case 'Soft Intimate Whisper':
            const asmrPreamble = 'Use a close-mic ASMR technique. The voice should be extremely soft, intimate, and relaxing. ';
            if (nameLower.includes('breathy') || nameLower.includes('soft girl')) mainInstruction = asmrPreamble + 'in an extremely soft, breathy, and airy young female whisper, focusing on gentle pacing and capturing the sound of every breath.';
            else if (nameLower.includes('deep') || nameLower.includes('velvet')) mainInstruction = asmrPreamble + 'in a very deep, resonant, and smooth female whisper, recorded extremely close to the microphone to capture rich, low-frequency tones and every subtle mouth sound.';
            else if (nameLower.includes('seductive') || nameLower.includes('sensual') || nameLower.includes('romantic')) mainInstruction = asmrPreamble + 'in a gentle, warm, and seductive female whisper, spoken slowly and closely with a tender, emotionally rich quality and soft, breathy exhales.';
            else if (nameLower.includes('ear-to-ear')) mainInstruction = asmrPreamble + 'in a binaural-style female whisper designed to create an immersive, ear-to-ear effect for the listener, with a feeling of extreme closeness.';
            else mainInstruction = asmrPreamble + 'in a warm, gentle, and emotionally close female whisper, designed to be comforting and soothing, perfect for relaxation or sleep.';
            break;

        case 'Motivational & Deep':
            const motivationalPreamble = 'The voice should have a cinematic and professional quality. ';
            if (nameLower.includes('deep') || nameLower.includes('epic') || nameLower.includes('powerful')) mainInstruction = motivationalPreamble + 'in a powerful, deep, resonant, and cinematic male voice with a strong chest resonance, suitable for a movie trailer or an epic motivational speech. The delivery must be confident and inspiring.';
            else if (nameLower.includes('calm') || nameLower.includes('therapist') || nameLower.includes('guide')) mainInstruction = motivationalPreamble + 'in a calm, gentle, slow, and deeply motivating voice for guidance or therapy, with exceptionally clear articulation and a reassuring, empathetic tone.';
            else if (nameLower.includes('wise man')) mainInstruction = motivationalPreamble + 'in a deep, slow, and resonant elderly male voice, full of wisdom and gravitas. The pacing is deliberate and thoughtful.';
            else mainInstruction = motivationalPreamble + 'in a strong, clear, and inspirational motivational voice with steady pacing and emotional depth, designed to uplift the listener.';
            break;
            
        case 'Accents':
             mainInstruction = `speaking clearly and naturally with a ${settings.accent.replace('EN', 'English')} accent`;
            break;
        
        case 'Relaxation':
            mainInstruction = `in a very calm, soothing, and deeply relaxing voice for meditation or sleep stories, with a slow, gentle rhythm and soft tone. Emphasize long, peaceful pauses.`;
            break;

        default:
            // Fallback for general categories using the vibe
            switch (vibe) {
                case 'Smooth Jazz DJ': mainInstruction = 'in the cool, velvety style of a late-night smooth jazz DJ'; break;
                case 'News Anchor': mainInstruction = 'in the clear, authoritative, and professional style of a news anchor'; break;
                case 'Calm Therapist': mainInstruction = 'in a calm, reassuring, and therapeutic voice'; break;
                case 'Horror Narrator': mainInstruction = 'in a scary, suspenseful horror narrator voice'; break;
                case 'Fairytale Teller': mainInstruction = 'in a gentle, warm, and magical fairytale storyteller voice'; break;
                case 'Action Narrator': mainInstruction = 'in an exciting, fast-paced action movie narrator voice'; break;
                case 'Bedtime Story': mainInstruction = 'in a very soothing, soft, and gentle bedtime story voice'; break;
                default: mainInstruction = `in a ${vibe.toLowerCase()} voice`; break;
            }
            break;
    }
    
    // Final prompt structure: "Say [modifier]: [script]"
    return `Say ${mainInstruction}: ${script}`;
}


export async function generateSpeech(
    script: string,
    profile: VoiceProfile
): Promise<string | null> {
    const fullPrompt = constructPrompt(script, profile);
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    // NOTE: The TTS API doesn't support all the detailed settings from the UI directly.
                    // We use pre-built voices. The intelligent prompt engineering above is the primary
                    // method for guiding the model's performance and achieving the desired voice style.
                    voiceConfig: {
                        // Using a consistent, high-quality female voice as a versatile base.
                        // The prompt instructions will shape its performance.
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio ?? null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Provide a more user-friendly error message
        if (error instanceof Error && error.message.includes('SAFETY')) {
             throw new Error("Generation failed due to safety filters. Please modify the script and try again.");
        }
        throw new Error("Failed to generate speech. The model may be unavailable or the request was blocked.");
    }
}