
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

// This function simulates more advanced voice settings by modifying the text prompt.
// The actual Gemini TTS API has limited direct controls.
function constructPrompt(script: string, profile: VoiceProfile): string {
    const { settings, description, vibe } = profile;
    
    let promptParts: string[] = [];

    // Voice description
    promptParts.push(`In the voice of ${description},`);

    // Vibe/Style
    promptParts.push(`speaking in a ${vibe.toLowerCase()} style,`);

    // Settings modifiers
    if (settings.speed < 0.9) promptParts.push('speaking slowly');
    if (settings.speed > 1.1) promptParts.push('speaking quickly');
    if (settings.pitch < 0.9) promptParts.push('with a low pitch');
    if (settings.pitch > 1.1) promptParts.push('with a high pitch');
    if (settings.emotionalDepth > 0.7) promptParts.push('with deep emotion');
    if (settings.clarity > 0.8) promptParts.push('with clear articulation');
    if (settings.breathingLevel > 0.5) promptParts.push('with audible breathing');
    
    // Add the main script
    promptParts.push(`say: "${script}"`);

    return promptParts.join(' ');
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
                    // We use pre-built voices. The prompt engineering above is a simulation to guide the model's performance.
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using a consistent, high-quality voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio ?? null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate speech. Please check your connection or API key.");
    }
}
