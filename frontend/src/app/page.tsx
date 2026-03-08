'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Session } from '@/types';
import { Button, LoadingSpinner } from '@/components/ui';
import { SessionCard } from '@/components/SessionCard';

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await api.listSessions();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setFetchError('セッションの取得に失敗しました。再読み込みしてください。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleStartSession = async () => {
    setIsCreating(true);
    try {
      const title = prompt('Enter session title:', 'New Meeting') || 'New Meeting';
      const session = await api.createSession(title);
      router.push(`/analyze?id=${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-gradient">
            Meeting Vibe Checker
          </h1>
          <p className="text-white/40 text-lg font-medium">
            Analyze and visualize collective emotion in real-time.
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleStartSession}
          isLoading={isCreating}
          className="shadow-xl"
        >
          Start New Session
        </Button>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white/80">Recent Sessions</h2>
          <span className="text-white/30 text-sm font-mono">{sessions.length} total</span>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : fetchError ? (
          <div className="glass rounded-3xl p-20 text-center border border-red-500/20">
            <p className="text-red-400 font-medium">{fetchError}</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-20 text-center border-dashed border-2 border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
            <p className="text-white/40 mb-8 max-w-sm mx-auto">
              Ready to start your first analysis? Click the button above to begin capturing meeting vibes.
            </p>
            <Button variant="secondary" onClick={handleStartSession}>
              Create Session
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
