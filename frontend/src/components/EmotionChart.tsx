'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { VibeRecord, EmotionScores } from '../types';

interface EmotionChartProps {
    records: VibeRecord[];
}

const EMOTIONS = [
    { key: 'happy', label: 'Happy', color: '#FFD700' },
    { key: 'sad', label: 'Sad', color: '#4169E1' },
    { key: 'angry', label: 'Angry', color: '#FF4500' },
    { key: 'surprised', label: 'Surprised', color: '#FFA500' },
    { key: 'fearful', label: 'Fearful', color: '#9370DB' },
    { key: 'disgusted', label: 'Disgusted', color: '#2E8B57' },
    { key: 'neutral', label: 'Neutral', color: '#808080' },
];

export const EmotionChart = ({ records }: EmotionChartProps) => {
    const chartData = records.map((record) => {
        const time = new Date(record.recorded_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return {
            time,
            ...record.scores,
        };
    });

    return (
        <div className="w-full h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#ffffff40"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#ffffff40"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0d1530',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)',
                        }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {EMOTIONS.map((emotion) => (
                        <Line
                            key={emotion.key}
                            type="monotone"
                            dataKey={emotion.key}
                            name={emotion.label}
                            stroke={emotion.color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={2000}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
