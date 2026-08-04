import { gql } from "@apollo/client";

export const SUBMIT_TEST = gql`
  mutation SubmitTest($input: ResultInput!) {
    submitTest(input: $input) {
      id
      score
      satScore
      rawPoints
      totalPoints
      correctAnswers
      totalQuestions
      duration
      resultStatus
      answers {
        questionId
        selectedAnswer
        selectedAnswerB
        isCorrect
        isCorrectB
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
      satScore
      rawPoints
      totalPoints
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
      satScore
      rawPoints
      totalPoints
      correctAnswers
      totalQuestions
      duration
      resultStatus
      answers {
        questionId
        selectedAnswer
        selectedAnswerB
        isCorrect
        isCorrectB
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
      satScore
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
      satScore
      duration
      finishedAt
      createdAt
    }
  }
`;

export const GET_IMPORTED_RESULTS_COUNT = gql`
  query GetImportedResultsCount($testId: String!) {
    getImportedResultsCount(testId: $testId)
  }
`;

export const IMPORT_HISTORICAL_RESULTS = gql`
  mutation ImportHistoricalResults($input: ImportHistoricalResultsInput!) {
    importHistoricalResults(input: $input) {
      importedCount
    }
  }
`;

export const CLEAR_IMPORTED_RESULTS = gql`
  mutation ClearImportedResults($testId: String!) {
    clearImportedResults(testId: $testId)
  }
`;

export const GET_MILLIY_SERTIFIKAT_SCORE = gql`
  query GetMilliySertifikatScore($resultId: String!) {
    getMilliySertifikatScore(resultId: $resultId) {
      ready
      respondentCount
      threshold
      finalScore
      grade
      rawPoints
      totalPoints
    }
  }
`;