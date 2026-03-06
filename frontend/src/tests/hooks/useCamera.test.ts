import { renderHook, act } from '@testing-library/react';
import { useCamera } from '@/hooks/useCamera';

describe('useCamera', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useCamera());
        expect(result.current.isReady).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should call getUserMedia when startCamera is called', async () => {
        const mockStream = {
            getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
        };
        (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

        const { result } = renderHook(() => useCamera());

        await act(async () => {
            await result.current.startCamera();
        });

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
});
