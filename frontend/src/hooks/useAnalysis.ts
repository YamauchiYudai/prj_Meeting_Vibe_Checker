import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { EmotionScores } from '../types';

export const useAnalysis = (sessionId: string | null, captureFrame: () => string | null) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentScores, setCurrentScores] = useState<EmotionScores | null>(null);
    const [dominantEmotion, setDominantEmotion] = useState<string | null>(null);
    const [analyzeCount, setAnalyzeCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // Ref to always call the latest performAnalysis, avoiding stale closures in setInterval
    const performAnalysisRef = useRef<() => Promise<void>>(async () => { });

    const performAnalysis = useCallback(async () => {
        if (!sessionId) return;

        const frame = captureFrame();
        if (!frame) return;

        try {
            const response = await api.analyzeFrame(sessionId, frame);
            setCurrentScores(response.scores);
            setDominantEmotion(response.dominant_emotion);
            setAnalyzeCount((prev) => prev + 1);
            setError(null);
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze frame');
        }
    }, [sessionId, captureFrame]);

    // Keep ref updated so setInterval always invokes the latest callback
    useEffect(() => {
        performAnalysisRef.current = performAnalysis;
    }, [performAnalysis]);

    const startAnalysis = useCallback(() => {
        if (!sessionId || isAnalyzing) return;

        setIsAnalyzing(true);
        // Initial analysis
        performAnalysis();

        // Set 2000ms interval; use ref to avoid stale closures
        intervalRef.current = setInterval(() => performAnalysisRef.current(), 2000);
    }, [sessionId, isAnalyzing, performAnalysis]);

    const stopAnalysis = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsAnalyzing(false);
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        isAnalyzing,
        currentScores,
        dominantEmotion,
        analyzeCount,
        error,
        startAnalysis,
        stopAnalysis,
    };
};
