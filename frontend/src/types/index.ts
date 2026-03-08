export type EmotionScores = {
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  fearful: number;
  disgusted: number;
  neutral: number;
};

export type SessionStatus = 'active' | 'ended';

export type Session = {
  id: string;
  title: string;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  record_count?: number;
};

export type VibeRecord = {
  recorded_at: string;
  dominant_emotion: string;
  scores: EmotionScores;
};

export type AnalysisResponse = {
  dominant_emotion: string;
  scores: EmotionScores;
};

export type SessionResultsResponse = {
  session_id: string;
  records: VibeRecord[];
};
