'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useAnalysis } from '@/hooks/useAnalysis';
import { api } from '@/lib/api';
import { CameraPreview } from '@/components/CameraPreview';
import { VibeGauge } from '@/components/VibeGauge';
import { Button, Card, Badge } from '@/components/ui';

export default function AnalyzePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');
    const [sessionTitle, setSessionTitle] = useState('Active Session');
    const [isEnding, setIsEnding] = useState(false);

    const { videoRef, isReady, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera();
    const {
        isAnalyzing,
        currentScores,
        dominantEmotion,
        analyzeCount,
        startAnalysis,
        stopAnalysis
    } = useAnalysis(sessionId, captureFrame);

    useEffect(() => {
        if (!sessionId) {
            router.push('/');
            return;
        }

        const loadSession = async () => {
            try {
                const session = await api.getSession(sessionId);
                setSessionTitle(session.title);
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        };

        loadSession();
        startCamera();

        return () => {
            stopCamera();
            stopAnalysis();
        };
    }, [sessionId, router, startCamera, stopCamera, stopAnalysis]);

    const handleToggleAnalysis = () => {
        if (isAnalyzing) {
            stopAnalysis();
        } else {
            startAnalysis();
        }
    };

    const handleEndSession = async () => {
        if (!sessionId) return;
        setIsEnding(true);
        try {
            stopAnalysis();
            stopCamera();
            await api.endSession(sessionId);
            router.push(`/sessions/${sessionId}`);
        } catch (error) {
            console.error('Failed to end session:', error);
            alert('Error ending session. Redirecting to results...');
            router.push(`/sessions/${sessionId}`);
        } finally {
            setIsEnding(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-7xl h-screen flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                        ← Exit
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        {sessionTitle}
                    </h1>
                    <Badge variant="active">Live</Badge>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Frames Analyzed</p>
                        <p className="text-xl font-mono font-bold text-accent-cyan">{analyzeCount}</p>
                    </div>
                    <Button
                        variant={isAnalyzing ? 'secondary' : 'primary'}
                        onClick={handleToggleAnalysis}
                        className="w-40"
                    >
                        {isAnalyzing ? '⏸ Pause' : '▶ Resume'}
                    </Button>
                    <Button variant="danger" onClick={handleEndSession} isLoading={isEnding}>
                        End Session
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden min-h-0">
                <div className="lg:col-span-8 flex flex-col h-full bg-black/20 rounded-3xl overflow-hidden border border-white/5 relative">
                    <CameraPreview videoRef={videoRef} isReady={isReady} error={cameraError} />

                    {dominantEmotion && (
                        <div className="absolute bottom-10 left-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Dominant Emotion</p>
                            <div className="flex items-center space-x-4">
                                <span className="text-5xl font-black uppercase text-white drop-shadow-2xl tracking-tighter">
                                    {dominantEmotion}
                                </span>
                                <div
                                    className="w-6 h-6 rounded-full blur-[4px] animate-pulse"
                                    style={{ backgroundColor: `var(--color-emotion-${dominantEmotion})` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                    <Card className="flex-1 bg-background-alt">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center">
                            <span className="mr-2">📊</span>
                            Emotion Spectrum
                        </h2>

                        {currentScores ? (
                            <VibeGauge scores={currentScores} dominant={dominantEmotion} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
                                    ?
                                </div>
                                <p className="text-xs uppercase tracking-widest font-bold">Awaiting Analysis</p>
                                <p className="text-[10px] mt-2 max-w-[180px]">Start analysis to begin capturing emotional data from the camera.</p>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-white/60">Camera Sync</span>
                                    <Badge variant={isReady ? 'active' : 'neutral'}>{isReady ? 'Online' : 'Offline'}</Badge>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-xs text-white/60">Engine Load</span>
                                    <span className="text-xs font-mono text-white/40">{isAnalyzing ? 'Processing...' : 'Standby'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </main>
    );
}
