import React from 'react';
import { render, screen } from '@testing-library/react';
import { VibeGauge } from '@/components/VibeGauge';
import { EmotionScores } from '@/types';

const mockScores: EmotionScores = {
    happy: 0.8,
    sad: 0.1,
    angry: 0.05,
    surprised: 0.05,
    fearful: 0,
    disgusted: 0,
    neutral: 0.8,
};

describe('VibeGauge', () => {
    it('renders all emotion labels', () => {
        render(<VibeGauge scores={mockScores} />);
        expect(screen.getByText('Happy')).toBeInTheDocument();
        expect(screen.getByText('Sad')).toBeInTheDocument();
        expect(screen.getByText('Angry')).toBeInTheDocument();
    });

    it('highlights dominant emotion when provided', () => {
        const { container } = render(<VibeGauge scores={mockScores} dominant="happy" />);
        // Check if Happy label has the active class (text-white instead of text-white/60)
        const happyLabel = screen.getByText('Happy');
        expect(happyLabel).toHaveClass('text-white');
    });
});
