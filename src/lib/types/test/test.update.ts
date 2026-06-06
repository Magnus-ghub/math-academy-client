import { TestAccess, TestStatus } from "@/lib/enums/test.enum";

export interface TestUpdate {
  testTitle?: string;
  testDesc?: string;
  testImage?: string;
  duration?: number;
  testAccess?: TestAccess;
  testStatus?: TestStatus;
}

export interface QuestionUpdate {
  questionText?: string;
  questionImage?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}