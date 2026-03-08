import { Session, VibeRecord, EmotionScores, AnalysisResponse, SessionResultsResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_SESSIONS: Session[] = [
    { id: '1', title: 'Weekly Sync', started_at: new Date().toISOString(), ended_at: null, status: 'active' },
    { id: '2', title: 'Design Review', started_at: new Date(Date.now() - 3600000).toISOString(), ended_at: new Date().toISOString(), status: 'ended' },
];

const mockApi = {
    createSession: async (title: string): Promise<Session> => {
        await sleep(500);
        return {
            id: Math.random().toString(36).slice(2, 11),
            title,
            started_at: new Date().toISOString(),
            ended_at: null,
            status: 'active',
        };
    },
    endSession: async (id: string): Promise<Session> => {
        await sleep(500);
        return {
            id,
            title: 'Mock Session',
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
            status: 'ended',
        };
    },
    listSessions: async (): Promise<Session[]> => {
        await sleep(500);
        return MOCK_SESSIONS;
    },
    getSession: async (id: string): Promise<Session> => {
        await sleep(300);
        return MOCK_SESSIONS.find(s => s.id === id) || MOCK_SESSIONS[0];
    },
    analyzeFrame: async (id: string, frameBase64: string): Promise<AnalysisResponse> => {
        await sleep(300);
        const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];
        const scores: EmotionScores = {
            happy: Math.random(),
            sad: Math.random(),
            angry: Math.random(),
            neutral: Math.random(),
            surprised: Math.random(),
            fearful: Math.random(),
            disgusted: Math.random(),
        };
        // Normalize roughly to 1
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        const normalizedScores = Object.fromEntries(
            Object.entries(scores).map(([k, v]) => [k, v / total])
        ) as EmotionScores;

        const dominant = emotions[Math.floor(Math.random() * emotions.length)];
        return { dominant_emotion: dominant, scores: normalizedScores };
    },
    getResults: async (id: string): Promise<SessionResultsResponse> => {
        await sleep(800);
        const records: VibeRecord[] = Array.from({ length: 10 }).map((_, i) => {
            const scores: EmotionScores = {
                happy: Math.random(),
                sad: Math.random(),
                angry: Math.random(),
                neutral: Math.random(),
                surprised: Math.random(),
                fearful: Math.random(),
                disgusted: Math.random(),
            };
            const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];
            return {
                recorded_at: new Date(Date.now() - (10 - i) * 2000).toISOString(),
                dominant_emotion: emotions[Math.floor(Math.random() * emotions.length)],
                scores,
            };
        });
        return { session_id: id, records };
    },
};

const realApi = {
    createSession: async (title: string): Promise<Session> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error('Failed to create session');
        return res.json();
    },
    endSession: async (id: string): Promise<Session> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/end`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error('Failed to end session');
        return res.json();
    },
    listSessions: async (): Promise<Session[]> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions`);
        if (!res.ok) throw new Error('Failed to list sessions');
        return res.json();
    },
    getSession: async (id: string): Promise<Session> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${id}`);
        if (!res.ok) throw new Error('Failed to get session');
        return res.json();
    },
    analyzeFrame: async (id: string, frameBase64: string): Promise<AnalysisResponse> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: frameBase64 }),
        });
        if (!res.ok) throw new Error('Failed to analyze frame');
        return res.json();
    },
    getResults: async (id: string): Promise<SessionResultsResponse> => {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/results`);
        if (!res.ok) throw new Error('Failed to get results');
        return res.json();
    },
};

export const api = USE_MOCK ? mockApi : realApi;
