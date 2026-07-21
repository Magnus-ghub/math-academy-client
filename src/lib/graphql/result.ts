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

export const CHECK_MY_ATTEMPT = gql`
  query CheckMyAttempt($testId: String!) {
    checkMyAttempt(testId: $testId) {
      id
      score
      correctAnswers
      totalQuestions
      createdAt
    }
  }
`;

export const GET_MY_RESULTS = gql`
  query GetMyResults {
    getMyResults {
      id
      testId
      testTitle
      testType
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
      testTitle
      testType
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
      rank
      userId
      userName
      userImage
      score
      correctAnswers
      totalQuestions
      duration
    }
  }
`;

export const GET_TOP_STUDENTS = gql`
  query GetTopStudents($period: LeaderboardPeriod!) {
    getTopStudents(period: $period) {
      rank
      userId
      userName
      userImage
      avgScore
      totalTests
    }
  }
`;

export const GET_ALL_RESULTS_FOR_TEST = gql`
  query GetAllResultsForTest($testId: String!) {
    getAllResultsForTest(testId: $testId) {
      id
      userId
      testTitle
      userName
      userLastName
      userPhone
      userEmail
      resultStatus
      totalQuestions
      correctAnswers
      score
      duration
      finishedAt
      createdAt
    }
  }
`;