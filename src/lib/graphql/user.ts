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

export const BLOCK_USER = gql`
  mutation BlockUser($userId: String!) {
    blockUser(userId: $userId) {
      id
      userStatus
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