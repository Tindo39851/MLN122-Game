export type RoomStatus = "waiting" | "active" | "ended";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface CurrentQuestion {
  round: number;
  title: string;
  scenario: string;
  prompt: string;
  options: QuestionOption[];
  timeLimitSec: number;
}

export interface PublicAnswer {
  round: number;
  correctAnswer: string;
  explanation: string;
  revealedAt: number;
  distribution?: Record<string, number>;
  answeredCount?: number;
  totalPlayers?: number;
}

export interface Player {
  uid: string;
  displayName: string;
  joinedAt: number;
  score: number;
  correctCount: number;
  streak?: number;
  phase?: number;
  bossHp?: number;
  bossesDefeated?: number;
  clearedAt?: number | null;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  correctCount: number;
  streak?: number;
  phase?: number;
  bossHp?: number;
  bossesDefeated?: number;
  clearedAt?: number | null;
  rank: number;
}

export interface PublicRoom {
  code: string;
  status: RoomStatus;
  currentRound: number;
  totalRounds: number;
  maxPlayers?: number;
  createdAt: number;
  endedAt?: number;
  roundStartedAt?: number;
  roundEndsAt?: number;
  answeredCount?: number;
  players?: Record<string, Player>;
  leaderboard?: Record<string, LeaderboardEntry>;
  currentQuestion?: CurrentQuestion;
  publicAnswer?: PublicAnswer;
}

export interface PlayerResult {
  round: number;
  answer: string | null;
  correct: boolean;
  points: number;
  speedBonus: number;
  streakBonus: number;
  streak: number;
  answeredInMs: number | null;
}
