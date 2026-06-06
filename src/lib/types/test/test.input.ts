import { TestType, TestAccess, TestBlock } from "@/lib/enums/test.enum";

export interface TestInput {
  testType: TestType;
  testAccess: TestAccess;
  testBlock?: TestBlock;
  testTitle: string;
  testDesc?: string;
  testImage?: string;
  duration: number;
  groupId?: string;
}

export interface QuestionInput {
  testId: string;
  questionText: string;
  questionImage?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  orderIndex: number;
}