import { gql } from "@apollo/client";

export const TELEGRAM_LOGIN = gql`
  mutation TelegramLogin(
    $telegramId: String!
    $hash: String!
    $authDate: Int!
    $userName: String
    $userLastName: String
    $userImage: String
    $telegramUsername: String
  ) {
    telegramLogin(
      telegramId: $telegramId
      hash: $hash
      authDate: $authDate
      userName: $userName
      userLastName: $userLastName
      userImage: $userImage
      telegramUsername: $telegramUsername
    ) {
      accessToken
      isNewUser
      user {
        id
        userName
        userLastName
        userRole
        userStatus
        userAuthType
        telegramId
        userImage
      }
      groups {
        id
        groupId
        groupType
        groupName
        expiresAt
        joinedAt
      }
    }
  }
`;

export const TELEGRAM_BOT_LOGIN = gql`
  mutation TelegramBotLogin($token: String!) {
    telegramBotLogin(token: $token) {
      accessToken
      isNewUser
      user {
        id
        userName
        userLastName
        userRole
        userStatus
        userAuthType
        telegramId
        userImage
      }
      groups {
        id
        groupId
        groupType
        groupName
        expiresAt
        joinedAt
      }
    }
  }
`;

export const CREATE_QR_SESSION = gql`
  mutation CreateQrSession {
    createQrSession
  }
`;

export const CHECK_QR_SESSION = gql`
  query CheckQrSession($sessionId: String!) {
    checkQrSession(sessionId: $sessionId) {
      status
      session {
        accessToken
        isNewUser
        user {
          id
          userName
          userLastName
          userRole
          userStatus
          userAuthType
          telegramId
          userImage
        }
        groups {
          id
          groupId
          groupType
          groupName
          expiresAt
          joinedAt
        }
      }
    }
  }
`;

export const ADMIN_GENERATE_LOGIN_LINK = gql`
  mutation AdminGenerateLoginLink($userId: String!) {
    adminGenerateLoginLink(userId: $userId)
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation GoogleLogin(
    $googleId: String!
    $name: String!
    $email: String!
    $avatar: String
  ) {
    googleLogin(
      googleId: $googleId
      name: $name
      email: $email
      avatar: $avatar
    ) {
      accessToken
      isNewUser
      user {
        id
        userName
        userRole
        userStatus
        userAuthType
        userEmail
        googleId
        userImage
      }
      groups {
        id
        groupId
        groupType
        groupName
        expiresAt
        joinedAt
      }
    }
  }
`;

export const LOGIN_WITH_EMAIL = gql`
  mutation LoginWithEmail($email: String!, $password: String!) {
    loginWithEmail(email: $email, password: $password) {
      accessToken
      isNewUser
      user {
        id
        userName
        userLastName
        userRole
        userStatus
        userAuthType
        userEmail
        userImage
      }
      groups {
        id
        groupId
        groupType
        groupName
        expiresAt
        joinedAt
      }
    }
  }
`;

export const SET_GOOGLE_PASSWORD = gql`
  mutation SetGooglePassword($userId: String!, $password: String!) {
    setGooglePassword(userId: $userId, password: $password)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($newPassword: String!, $currentPassword: String) {
    changePassword(newPassword: $newPassword, currentPassword: $currentPassword)
  }
`;
