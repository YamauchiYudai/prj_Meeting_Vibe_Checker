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

    it('should set isReady to true after successful startCamera', async () => {
        const mockTrack = { stop: jest.fn() };
        const mockStream = {
            getTracks: jest.fn().mockReturnValue([mockTrack]),
        };
        (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

        const { result } = renderHook(() => useCamera());

        const mockVideo = document.createElement('video');
        Object.defineProperty(result.current.videoRef, 'current', {
            value: mockVideo,
            writable: true,
        });

        await act(async () => {
            await result.current.startCamera();
        });

        expect(result.current.isReady).toBe(true);
    });

    it('should handle getUserMedia error and set error state', async () => {
        (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
            new Error('Permission denied')
        );

        const { result } = renderHook(() => useCamera());

        await act(async () => {
            await result.current.startCamera();
        });

        expect(result.current.error).not.toBeNull();
        expect(result.current.isReady).toBe(false);
    });

    it('should stop tracks when stopCamera is called', async () => {
        const mockStop = jest.fn();
        const mockStream = {
            getTracks: jest.fn().mockReturnValue([{ stop: mockStop }]),
        };
        (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

        const { result } = renderHook(() => useCamera());

        await act(async () => {
            await result.current.startCamera();
        });

        act(() => {
            result.current.stopCamera();
        });

        expect(mockStop).toHaveBeenCalled();
    });
});
