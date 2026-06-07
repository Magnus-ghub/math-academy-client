import { gql } from "@apollo/client";

export const GET_PENDING_COMMENTS = gql`
  query GetPendingComments {
    getPendingComments {
      id
      commentType
      commentStatus
      text
      rating
      userId
      testId
      createdAt
    }
  }
`;

export const GET_PUBLIC_COMMENTS = gql`
  query GetPublicComments {
    getPublicComments {
      id
      commentType
      commentStatus
      text
      rating
      userId
      createdAt
    }
  }
`;

export const APPROVE_COMMENT = gql`
  mutation ApproveComment($commentId: String!) {
    approveComment(commentId: $commentId) {
      id
      commentStatus
    }
  }
`;

export const REJECT_COMMENT = gql`
  mutation RejectComment($commentId: String!) {
    rejectComment(commentId: $commentId) {
      id
      commentStatus
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      text
      rating
      commentStatus
    }
  }
`;