export interface AnswerInput {
  questionId: string;
  selectedAnswer: number;
  timeSpent: number;
}

export interface ResultInput {
  testId: string;
  answers: AnswerInput[];
  duration: number;
}