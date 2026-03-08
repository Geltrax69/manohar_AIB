import { useState, useCallback } from 'react';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { useToast } from '../components/Toast';

const SELECTED_MODEL = "Qwen2-0.5B-Instruct-q4f16_1-MLC";

let engineInstance = null;
let isInitializing = false;

export function useLocalAITutor() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const toast = useToast();

    const checkWebGPU = async () => {
        if (!navigator.gpu) {
            console.error("WebGPU is not supported.");
            return false;
        }
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch (e) {
            return false;
        }
    };

    const initLocalModels = useCallback(async () => {
        if (engineInstance) {
            setIsLoaded(true);
            return;
        }
        if (isInitializing) return;

        try {
            console.log("[AI TUTOR] Initializing...");
            isInitializing = true;

            const hasWebGPU = await checkWebGPU();
            if (!hasWebGPU) {
                toast.error("WebGPU not supported. Falling back to static hints.", { duration: 5000 });
                isInitializing = false;
                return;
            }

            toast.info('Bringing AI Tutor online...', { duration: 3000 });

            const engine = await CreateMLCEngine(
                SELECTED_MODEL,
                {
                    initProgressCallback: (progress) => {
                        setLoadingProgress(Math.round(progress.progress * 100));
                        setLoadingText(progress.text);
                        if (progress.progress === 1) {
                            setIsLoaded(true);
                            toast.success('AI Tutor is Ready! 🚀');
                        }
                    }
                }
            );

            engineInstance = engine;
            console.log("[AI TUTOR] Ready.");
        } catch (error) {
            console.error("[AI TUTOR] Init Error:", error);
            toast.error('AI Tutor failed to start.');
            isInitializing = false;
        }
    }, [toast]);

    const getHint = async (code, targetLang, scenarioHint) => {
        if (!engineInstance || !isLoaded) {
            return scenarioHint || "Keep coding! You're doing great.";
        }

        setIsThinking(true);
        try {
            const langNames = {
                'en': 'English',
                'hi': 'Hindi',
                'te': 'Telugu',
                'ta': 'Tamil'
            };
            const langName = langNames[targetLang] || 'English';

            let systemPrompt = `You are a helpful and encouraging Python tutor. 
            Your goal is to provide a 1-2 sentence hint about the code logic. 
            CRITICAL: Your entire response MUST be in ${langName}. 
            If the language is Hindi, Telugu, or Tamil, use the native script. 
            Do NOT provide the complete solution code.`;

            const reply = await engineInstance.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Current Code:\n${code}\n\nPlease provide a short hint in ${langName}.` }
                ],
                temperature: 0.7,
                max_tokens: 150,
            });

            return reply.choices[0].message.content;
        } catch (error) {
            console.error("[AI TUTOR] Generation Error:", error);
            return scenarioHint || "Check your logic and try again!";
        } finally {
            setIsThinking(false);
        }
    };

    return { isLoaded, loadingProgress, loadingText, isThinking, initLocalModels, getHint };
}
