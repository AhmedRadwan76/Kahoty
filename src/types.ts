export type OptionColor = 'red' | 'blue' | 'yellow' | 'green' | 'indigo' | 'pink';
export type OptionShape = 'triangle' | 'diamond' | 'circle' | 'square';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  color: OptionColor;
  shape: OptionShape;
}

export type QuestionType = 'multiple_choice' | 'true_false';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  timeLimit: number; // in seconds e.g. 10, 20, 30
  pointsMultiplier: number; // base points e.g. 1000
  options: Option[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon?: string;
  questions: Question[];
  createdAt: string;
}

export interface PlayerAnswer {
  questionIndex: number;
  optionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeSec: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  answers: Record<number, PlayerAnswer>;
  isConnected: boolean;
  lastAnsweredIndex?: number;
}

export type GameStage =
  | 'LOBBY'
  | 'QUESTION_INTRO'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_RESULT'
  | 'PODIUM';

export interface GameSession {
  pin: string;
  quizId: string;
  quizTitle: string;
  stage: GameStage;
  currentQuestionIndex: number;
  questionStartTime?: number;
  questions: Question[];
  players: Record<string, Player>;
  createdAt: number;
}

export interface QuizReportData {
  pin: string;
  quizTitle: string;
  date: string;
  totalPlayers: number;
  totalQuestions: number;
  averageScore: number;
  averageAccuracy: number;
  players: {
    rank: number;
    nickname: string;
    avatar: string;
    score: number;
    correctCount: number;
    accuracy: number;
    avgResponseTime: number;
  }[];
  questionsStats: {
    questionText: string;
    correctPercentage: number;
    fastestAnswerSec: number;
  }[];
}
