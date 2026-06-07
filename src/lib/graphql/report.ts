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
      questionId
      testId
      createdAt
    }
  }
`;

export const RESOLVE_REPORT = gql`
  mutation ResolveReport($reportId: String!) {
    resolveReport(reportId: $reportId) {
      id
      reportStatus
    }
  }
`;

export const REJECT_REPORT = gql`
  mutation RejectReport($reportId: String!) {
    rejectReport(reportId: $reportId) {
      id
      reportStatus
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