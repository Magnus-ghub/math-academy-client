import { TestType, TestAccess, TestStatus, TestBlock } from "@/lib/enums/test.enum";

export interface Test {
  id: string;
  testType: TestType;
  testAccess: TestAccess;
  testStatus: TestStatus;
  testBlock?: TestBlock;
  testTitle: string;
  testDesc?: string;
  testImage?: string;
  duration: number;
  totalQuestions: number;
  totalAttempts: number;
  groupId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  testId: string;
  questionText: string;
  questionImage?: string;
  options: string[];
  orderIndex: number;
}