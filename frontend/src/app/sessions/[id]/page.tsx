'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Session, VibeRecord, EmotionScores } from '@/types';
import { EmotionChart } from '@/components/EmotionChart';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui';

export default function SessionDetail() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const [session, setSession] = useState<Session | null>(null);
    const [records, setRecords] = useState<VibeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const [sessionData, resultsData] = await Promise.all([
                    api.getSession(id),
                    api.getResults(id),
                ]);
                setSession(sessionData);
                setRecords(resultsData.records);
            } catch (error) {
                console.error('Failed to load session details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const summary = useMemo(() => {
        if (records.length === 0) return null;

        // Calculate most frequent dominant emotion
        const emotionCounts: Record<string, number> = {};
        let totalHappy = 0;

        records.forEach(r => {
            emotionCounts[r.dominant_emotion] = (emotionCounts[r.dominant_emotion] || 0) + 1;
            totalHappy += r.scores.happy;
        });

        const mostFrequentEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];
        const avgHappy = (totalHappy / records.length) * 100;

        return {
            mostFrequentEmotion,
            avgHappy: Math.round(avgHappy),
            frameCount: records.length,
        };
    }, [records]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    if (!session) return <div className="p-20 text-center"><h1 className="text-white">Session not found</h1><Button onClick={() => router.push('/')}>Back to Dashboard</Button></div>;

    const startedAt = new Date(session.started_at);
    const endedAt = session.ended_at ? new Date(session.ended_at) : null;
    const duration = endedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000) : null;

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <header className="mb-12">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mb-6">
                    ← Dashboard
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-4xl font-extrabold text-white">{session.title}</h1>
                            <Badge variant="ended">Completed</Badge>
                        </div>
                        <p className="text-white/40 font-medium">
                            {startedAt.toLocaleDateString()} at {startedAt.toLocaleTimeString()}
                            {duration !== null && ` • ${duration} minutes total`}
                        </p>
                    </div>
                    <Button onClick={() => router.push('/analyze?id=' + session.id)}>
                        Re-run Analysis
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-background-alt border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Overall Vibe</p>
                    <div className="flex items-center space-x-4">
                        <span className="text-3xl font-black text-white uppercase">{summary?.mostFrequentEmotion || 'N/A'}</span>
                        <div className="w-4 h-4 rounded-full blur-[2px]" style={{ backgroundColor: `var(--color-emotion-${summary?.mostFrequentEmotion})` }} />
                    </div>
                </Card>

                <Card className="bg-background-alt border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Happiness Index</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-black text-accent-cyan">{summary?.avgHappy}%</span>
                        <span className="text-xs text-white/20 mb-1">Average Score</span>
                    </div>
                </Card>

                <Card className="bg-background-alt border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Data Samples</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-black text-white">{summary?.frameCount}</span>
                        <span className="text-xs text-white/20 mb-1">Total Frames</span>
                    </div>
                </Card>
            </div>

            <Card className="mb-16 bg-background-alt/50">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Sentiment Timeline</h2>
                    <div className="flex space-x-4">
                        <div className="flex items-center text-[10px] uppercase font-bold text-white/30">
                            <div className="w-2 h-2 rounded-full bg-emotion-happy mr-2" /> Happy
                        </div>
                        <div className="flex items-center text-[10px] uppercase font-bold text-white/30">
                            <div className="w-2 h-2 rounded-full bg-emotion-sad mr-2" /> Sad
                        </div>
                    </div>
                </div>

                {records.length > 0 ? (
                    <EmotionChart records={records} />
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-white/20 italic">
                        No recording data found for this session.
                    </div>
                )}
            </Card>

            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-white/20 text-xs">
                    Session recorded using Meeting Vibe Checker Engine v1.0
                </p>
            </div>
        </main>
    );
}
