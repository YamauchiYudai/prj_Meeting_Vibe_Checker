import React from 'react';
import { Card } from './ui';

interface CameraPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isReady: boolean;
    error: string | null;
}

export const CameraPreview = ({ videoRef, isReady, error }: CameraPreviewProps) => {
    return (
        <Card className="p-2 aspect-video flex items-center justify-center bg-black/40 overflow-hidden group">
            {!isReady && !error && (
                <div className="flex flex-col items-center space-y-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-cyan/20 border-t-accent-cyan border-spin" />
                    <span className="text-white/40 text-sm font-medium tracking-wide font-sans">Wait camera...</span>
                </div>
            )}

            {error && (
                <div className="text-center p-6">
                    <p className="text-emotion-angry text-sm font-medium mb-2">{error}</p>
                    <span className="text-white/40 text-xs">Allow camera permission</span>
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-xl transition-opacity duration-500 scale-x-[-1] ${isReady ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-accent-cyan/40 rounded-tl-lg pointer-events-none group-hover:border-accent-cyan transition-colors" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-accent-cyan/40 rounded-tr-lg pointer-events-none group-hover:border-accent-cyan transition-colors" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-accent-cyan/40 rounded-bl-lg pointer-events-none group-hover:border-accent-cyan transition-colors" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-accent-cyan/40 rounded-br-lg pointer-events-none group-hover:border-accent-cyan transition-colors" />

            {/* Recording indicator */}
            {isReady && (
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-emotion-angry rounded-full animate-red-pulse" />
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">Live Analysis</span>
                </div>
            )}

            <style jsx>{`
        @keyframes red-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-red-pulse {
          animation: red-pulse 1.5s infinite ease-in-out;
        }
      `}</style>
        </Card>
    );
};
