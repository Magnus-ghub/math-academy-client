import { gql } from "@apollo/client";

export const GET_MY_GROUPS = gql`
  query GetMyGroups {
    getMyGroups {
      id
      groupId
      groupType
      groupName
      expiresAt
      joinedAt
    }
  }
`;

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

export const GET_GROUP_MEMBER_IDS = gql`
  query GetGroupMemberIds($groupId: String!) {
    getGroupMemberIds(groupId: $groupId)
  }
`;

export const ADD_USER_TO_GROUP = gql`
  mutation AddUserToGroup($groupId: String!, $userId: String!) {
    addUserToGroup(groupId: $groupId, userId: $userId) {
      id
      userId
      groupId
      expiresAt
    }
  }
`;

export const REMOVE_USER_FROM_GROUP = gql`
  mutation RemoveUserFromGroup($groupId: String!, $userId: String!) {
    removeUserFromGroup(groupId: $groupId, userId: $userId)
  }
`;

export const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: String!) {
    getGroupMembers(groupId: $groupId) {
      id
      userName
      userLastName
      userImage
      telegramId
      userPhone
      userRole
      userAuthType
      expiresAt
      joinedAt
    }
  }
`;