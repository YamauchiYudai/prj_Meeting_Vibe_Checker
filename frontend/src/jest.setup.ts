import '@testing-library/jest-dom';

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
        getUserMedia: jest.fn(),
    },
});

// Mock HTMLCanvasElement
// @ts-ignore
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    drawImage: jest.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,mock');
