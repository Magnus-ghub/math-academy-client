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
      testDesc
      testType
      dtmType
      testAccess
      testStatus
      testPrice
      totalQuestions
      duration
      totalAttempts
      testPdfUrl
      createdAt
    }
  }
`;

export const GET_TESTS = gql`
  query GetTests {
    getTests {
      id
      testTitle
      testDesc
      testType
      dtmType
      testAccess
      testStatus
      testPrice
      totalQuestions
      duration
      totalAttempts
      groupId
      testPdfUrl
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
      testPrice
      totalQuestions
      duration
      groupId
      testPdfUrl
      testYoutubeUrl
      testAnalysis
      closesAt
    }
  }
`;

export const GET_QUESTIONS = gql`
  query GetQuestions($testId: String!) {
    getQuestions(testId: $testId) {
      id
      testId
      questionType
      questionText
      questionImage
      options
      optionImages
      correctAnswer
      correctAnswerB
      correctAnswerText
      correctAnswerBText
      explanation
      youtubeUrl
      analysis
      section
      groupPrompt
      orderIndex
    }
  }
`;

export const GET_ALL_TESTS = gql`
  query GetAllTests($includeArchived: Boolean) {
    getAllTests(includeArchived: $includeArchived) {
      id
      testTitle
      testType
      dtmType
      testAccess
      testStatus
      totalQuestions
      duration
      totalAttempts
      testPdfUrl
      closesAt
      createdAt
    }
  }
`;

export const GET_DELETED_TESTS = gql`
  query GetDeletedTests {
    getDeletedTests {
      id
      testTitle
      testType
      dtmType
      testAccess
      totalQuestions
      createdAt
    }
  }
`;

export const RESTORE_TEST = gql`
  mutation RestoreTest($testId: String!) {
    restoreTest(testId: $testId) {
      id
      testStatus
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
      closesAt
    }
  }
`;

export const UPDATE_TEST = gql`
  mutation UpdateTest($testId: String!, $input: TestUpdate!) {
    updateTest(testId: $testId, input: $input) {
      id
      testTitle
      testStatus
      closesAt
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
      optionImages
      correctAnswer
      correctAnswerB
      correctAnswerText
      correctAnswerBText
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
      optionImages
      correctAnswer
      correctAnswerB
      correctAnswerText
      correctAnswerBText
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