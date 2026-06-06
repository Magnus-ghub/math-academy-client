import { gql } from "@apollo/client";

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