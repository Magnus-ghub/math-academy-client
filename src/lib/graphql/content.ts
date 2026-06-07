import { gql } from "@apollo/client";

export const GET_ALL_CONTENT = gql`
  query GetAllContent {
    getAllContent {
      id
      contentType
      contentStatus
      title
      desc
      contentImage
      contentVideo
      viewCount
      createdAt
    }
  }
`;

export const DELETE_CONTENT = gql`
  mutation DeleteContent($contentId: String!) {
    deleteContent(contentId: $contentId)
  }
`;

export const UPDATE_CONTENT = gql`
  mutation UpdateContent($contentId: String!, $input: ContentUpdate!) {
    updateContent(contentId: $contentId, input: $input) {
      id
      contentStatus
    }
  }
`;

export const GET_SUCCESS_STORIES = gql`
  query GetSuccessStories {
    getSuccessStories {
      id
      title
      desc
      contentImage
      viewCount
      createdAt
    }
  }
`;

export const GET_TEACHERS = gql`
  query GetTeachers {
    getTeachers {
      id
      title
      desc
      contentImage
      createdAt
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents {
    getEvents {
      id
      title
      desc
      contentImage
      contentVideo
      publishedAt
    }
  }
`;