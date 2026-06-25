import { gql } from "@apollo/client";

export const PUBLISH_TEST = gql`
  mutation UpdateTest($testId: String!, $input: TestUpdate!) {
    updateTest(testId: $testId, input: $input) {
      id
      testStatus
    }
  }
`;

export const GET_PUBLIC_TESTS = gql`
  query GetPublicTests {
    getPublicTests {
      id
      testTitle
      testType
      dtmType
      testAccess
      testStatus
      totalQuestions
      duration
      totalAttempts
      createdAt
    }
  }
`;

export const GET_TEST = gql`
  query GetTest($testId: String!) {
    getTest(testId: $testId) {
      id
      testTitle
      testType
      dtmType
      testDifficulty
      testBlock
      testAccess
      testStatus
      testDesc
      totalQuestions
      duration
      groupId
    }
  }
`;

export const GET_QUESTIONS = gql`
  query GetQuestions($testId: String!) {
    getQuestions(testId: $testId) {
      id
      testId
      questionText
      questionImage
      options
      correctAnswer
      explanation
      section
      orderIndex
    }
  }
`;

export const GET_ALL_TESTS = gql`
  query GetAllTests {
    getAllTests {
      id
      testTitle
      testType
      dtmType
      testAccess
      testStatus
      totalQuestions
      duration
      totalAttempts
      createdAt
    }
  }
`;

export const CREATE_TEST = gql`
  mutation CreateTest($input: TestInput!) {
    createTest(input: $input) {
      id
      testTitle
      testType
      testAccess
      testStatus
    }
  }
`;

export const UPDATE_TEST = gql`
  mutation UpdateTest($testId: String!, $input: TestUpdate!) {
    updateTest(testId: $testId, input: $input) {
      id
      testTitle
      testStatus
    }
  }
`;

export const ADD_QUESTION = gql`
  mutation AddQuestion($input: QuestionInput!) {
    addQuestion(input: $input) {
      id
      questionText
      questionImage
      options
      correctAnswer
      orderIndex
    }
  }
`;

export const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($questionId: String!, $input: QuestionUpdate!) {
    updateQuestion(questionId: $questionId, input: $input) {
      id
      questionText
      questionImage
      options
      correctAnswer
      orderIndex
    }
  }
`;

export const DELETE_QUESTION = gql`
  mutation DeleteQuestion($questionId: String!) {
    deleteQuestion(questionId: $questionId)
  }
`;

export const DELETE_TEST = gql`
  mutation DeleteTest($testId: String!) {
    deleteTest(testId: $testId)
  }
`;