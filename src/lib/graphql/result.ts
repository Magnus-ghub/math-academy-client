import { gql } from "@apollo/client";

export const SUBMIT_TEST = gql`
  mutation SubmitTest($input: ResultInput!) {
    submitTest(input: $input) {
      id
      score
      correctAnswers
      totalQuestions
      duration
      resultStatus
      answers {
        questionId
        selectedAnswer
        isCorrect
        timeSpent
      }
      createdAt
    }
  }
`;

export const GET_MY_RESULTS = gql`
  query GetMyResults {
    getMyResults {
      id
      testId
      score
      correctAnswers
      totalQuestions
      duration
      resultStatus
      createdAt
    }
  }
`;

export const GET_RESULT = gql`
  query GetResult($resultId: String!) {
    getResult(resultId: $resultId) {
      id
      testId
      score
      correctAnswers
      totalQuestions
      duration
      resultStatus
      answers {
        questionId
        selectedAnswer
        isCorrect
        timeSpent
      }
      finishedAt
      createdAt
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($testId: String!) {
    getLeaderboard(testId: $testId) {
      id
      userId
      score
      correctAnswers
      totalQuestions
      duration
      createdAt
    }
  }
`;