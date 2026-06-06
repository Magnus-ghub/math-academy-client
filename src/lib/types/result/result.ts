import { ResultStatus } from "@/lib/enums/result.enum";

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface Result {
  id: string;
  userId: string;
  testId: string;
  groupId?: string;
  resultStatus: ResultStatus;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  duration: number;
  answers: Answer[];
  finishedAt?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  duration: number;
  totalTests: number;
}