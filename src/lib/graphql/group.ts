import { gql } from "@apollo/client";

export const GET_ALL_GROUPS = gql`
  query GetAllGroups {
    getAllGroups {
      id
      groupName
      groupType
      groupStatus
      telegramChatId
      durationMonths
      memberCount
      createdAt
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($input: GroupInput!) {
    createGroup(input: $input) {
      id
      groupName
      groupType
      groupStatus
      telegramChatId
      durationMonths
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($groupId: String!, $input: GroupUpdate!) {
    updateGroup(groupId: $groupId, input: $input) {
      id
      groupName
      groupStatus
      durationMonths
    }
  }
`;