import React from 'react';
import { EmotionScores } from '../types';
import { Badge } from './ui';

interface VibeGaugeProps {
    scores: EmotionScores;
    dominant?: string | null;
}

const EMOTIONS = [
    { key: 'happy', label: 'Happy', color: 'var(--color-emotion-happy)' },
    { key: 'sad', label: 'Sad', color: 'var(--color-emotion-sad)' },
    { key: 'angry', label: 'Angry', color: 'var(--color-emotion-angry)' },
    { key: 'surprised', label: 'Surprised', color: 'var(--color-emotion-surprised)' },
    { key: 'fearful', label: 'Fearful', color: 'var(--color-emotion-fearful)' },
    { key: 'disgusted', label: 'Disgusted', color: 'var(--color-emotion-disgusted)' },
    { key: 'neutral', label: 'Neutral', color: 'var(--color-emotion-neutral)' },
];

export const VibeGauge = ({ scores, dominant }: VibeGaugeProps) => {
    return (
        <div className="space-y-4">
            {EMOTIONS.map((emotion) => {
                const score = scores[emotion.key as keyof EmotionScores] || 0;
                const percentage = Math.round(score * 100);
                const isActive = dominant === emotion.key;

                return (
                    <div key={emotion.key} className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                                {emotion.label}
                            </span>
                            <span className="text-xs font-mono text-white/40">
                                {percentage}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full transition-all duration-700 ease-out rounded-full"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: emotion.color,
                                    boxShadow: isActive ? `0 0 10px ${emotion.color}80` : 'none',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
