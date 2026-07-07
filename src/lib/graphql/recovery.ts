import { gql } from "@apollo/client";

export const SUBMIT_RECOVERY_REQUEST = gql`
  mutation SubmitRecoveryRequest($input: RecoveryRequestInput!) {
    submitRecoveryRequest(input: $input)
  }
`;

export const GET_RECOVERY_REQUESTS = gql`
  query GetRecoveryRequests {
    getRecoveryRequests {
      id
      fullName
      phone
      telegramUsername
      message
      status
      createdAt
    }
  }
`;

export const RESOLVE_RECOVERY_REQUEST = gql`
  mutation ResolveRecoveryRequest($id: String!) {
    resolveRecoveryRequest(id: $id) {
      id
      status
    }
  }
`;
