import { api } from '@/lib/api';

describe('api client', () => {
    beforeEach(() => {
        // Reset any state if necessary
        jest.clearAllMocks();
    });

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
