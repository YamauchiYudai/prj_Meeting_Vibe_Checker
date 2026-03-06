import React from 'react';
import Link from 'next/link';
import { Session } from '../types';
import { Card, Badge, Button } from './ui';

interface SessionCardProps {
    session: Session;
}

export const SessionCard = ({ session }: SessionCardProps) => {
    const startedAt = new Date(session.started_at);
    const formattedDate = startedAt.toLocaleDateString();
    const formattedTime = startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Card className="group hover:bg-white/[0.03]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors">
                        {session.title || 'Untitled Session'}
                    </h3>
                    <p className="text-white/40 text-xs font-medium">
                        {formattedDate} • {formattedTime}
                    </p>
                </div>
                <Badge variant={session.status}>
                    {session.status}
                </Badge>
            </div>

            <div className="flex items-center justify-between mt-6">
                <div className="flex -space-x-1">
                    {/* Dummy analytics avatars/stats could go here */}
                    <span className="text-xs text-white/30 font-medium">
                        {session.record_count || 0} frames analyzed
                    </span>
                </div>

                <Link href={`/sessions/${session.id}`} passHref>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Analysis
                    </Button>
                </Link>
            </div>
        </Card>
    );
};
