import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    getMe {
      id
      userName
      userLastName
      userRole
      userStatus
      userAuthType
      userPhone
      userImage
      userAddress
      userDesc
      telegramId
      googleId
      premiumExpiresAt
      createdAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UserUpdate!) {
    updateUser(input: $input) {
      id
      userName
      userLastName
      userPhone
      userImage
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      userName
      userLastName
      userRole
      userStatus
      userAuthType
      userPhone
      telegramId
      createdAt
    }
  }
`;


export const CHANGE_ROLE = gql`
  mutation ChangeRole($userId: String!, $userRole: UserRole!) {
    changeRole(userId: $userId, userRole: $userRole) {
      id
      userRole
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($search: String!) {
    searchUsers(search: $search) {
      id
      userName
      userLastName
      userPhone
      userRole
      userStatus
      userAuthType
      telegramId
    }
  }
`;

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($userId: String!, $input: AdminUserUpdate!) {
    adminUpdateUser(userId: $userId, input: $input) {
      id
      userName
      userLastName
      userPhone
      userRole
      userStatus
    }
  }
`;

