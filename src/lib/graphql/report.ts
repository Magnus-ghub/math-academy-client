import { gql } from "@apollo/client";

export const GET_PENDING_REPORTS = gql`
  query GetPendingReports {
    getPendingReports {
      id
      reportType
      reportStatus
      reportReason
      reportText
      userId
      userName
      userLastName
      questionId
      testId
      adminReply
      testTitle
      questionOrder
      createdAt
    }
  }
`;

export const GET_MY_REPORTS = gql`
  query GetMyReports {
    getMyReports {
      id
      reportType
      reportStatus
      reportReason
      reportText
      questionId
      testId
      adminReply
      testTitle
      questionOrder
      createdAt
    }
  }
`;

export const GET_UNSEEN_REPORTS_COUNT = gql`
  query GetUnseenReportsCount {
    getUnseenReportsCount
  }
`;

export const MARK_REPORTS_SEEN = gql`
  mutation MarkReportsSeen {
    markReportsSeen
  }
`;

export const RESOLVE_REPORT = gql`
  mutation ResolveReport($reportId: String!, $adminReply: String) {
    resolveReport(reportId: $reportId, adminReply: $adminReply) {
      id
      reportStatus
      adminReply
    }
  }
`;

export const REJECT_REPORT = gql`
  mutation RejectReport($reportId: String!, $adminReply: String) {
    rejectReport(reportId: $reportId, adminReply: $adminReply) {
      id
      reportStatus
      adminReply
    }
  }
`;

export const REPORT_CREATED_SUBSCRIPTION = gql`
  subscription ReportCreated {
    reportCreated {
      id
      reportReason
      reportText
      reportStatus
      testId
      questionId
      createdAt
    }
  }
`;

export const CREATE_REPORT = gql`
  mutation CreateReport($input: ReportInput!) {
    createReport(input: $input) {
      id
      reportType
      reportReason
      reportStatus
    }
  }
`;