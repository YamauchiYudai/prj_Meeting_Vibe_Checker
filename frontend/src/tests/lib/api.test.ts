import { api } from '@/lib/api';

// Explicitly control USE_MOCK for test isolation
beforeAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = 'true';
});

afterAll(() => {
    delete process.env.NEXT_PUBLIC_USE_MOCK;
});

describe('api client', () => {
    it('listSessions should return mock data when USE_MOCK is true', async () => {
        const sessions = await api.listSessions();
        expect(sessions.length).toBeGreaterThan(0);
        expect(sessions[0]).toHaveProperty('id');
        expect(sessions[0]).toHaveProperty('title');
    });

    it('analyzeFrame should return scores and dominant_emotion', async () => {
        const result = await api.analyzeFrame('1', 'data:image/jpeg;base64,mock');
        expect(result).toHaveProperty('dominant_emotion');
        expect(result).toHaveProperty('scores');
        expect(typeof result.dominant_emotion).toBe('string');
    });
});
