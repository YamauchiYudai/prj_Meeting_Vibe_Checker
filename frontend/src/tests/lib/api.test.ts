// Set env var BEFORE any module is imported so the module-level USE_MOCK
// constant reads the correct value at initialization time.
const _originalUseMock = process.env.NEXT_PUBLIC_USE_MOCK;
process.env.NEXT_PUBLIC_USE_MOCK = 'true';

import { api } from '@/lib/api';

afterAll(() => {
    // Restore the original value to avoid polluting other test suites
    if (_originalUseMock === undefined) {
        delete process.env.NEXT_PUBLIC_USE_MOCK;
    } else {
        process.env.NEXT_PUBLIC_USE_MOCK = _originalUseMock;
    }
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
