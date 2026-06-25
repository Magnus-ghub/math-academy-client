import { gql } from "@apollo/client";

export const GET_ALL_CONTENT = gql`
  query GetAllContent {
    getAllContent {
      id
      contentType
      contentStatus
      contentTitle
      contentDesc
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
      contentTitle
      contentDesc
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
      contentTitle
      contentDesc
      contentImage
      createdAt
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents {
    getEvents {
      id
      contentTitle
      contentDesc
      contentImage
      contentVideo
      publishedAt
      createdAt
    }
  }
`;

export const GET_FAQS = gql`
  query GetFaqs {
    getFaqs {
      id
      contentTitle
      contentDesc
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook {
    getBook {
      id
      contentTitle
      contentDesc
      contentImage
      contentStatus
      metaJson
      updatedAt
    }
  }
`;

export const GET_GROUP_MATERIALS = gql`
  query GetGroupMaterials($groupId: String!) {
    getGroupMaterials(groupId: $groupId) {
      id
      contentTitle
      contentDesc
      contentImage
      contentVideo
      metaJson
      viewCount
      createdAt
    }
  }
`;

export const CREATE_CONTENT = gql`
  mutation CreateContent($input: ContentInput!) {
    createContent(input: $input) {
      id
      contentType
      contentTitle
      contentStatus
      metaJson
    }
  }
`;

export const UPDATE_CONTENT_FULL = gql`
  mutation UpdateContentFull($contentId: String!, $input: ContentUpdate!) {
    updateContent(contentId: $contentId, input: $input) {
      id
      contentTitle
      contentDesc
      contentImage
      contentStatus
      metaJson
    }
  }
`;