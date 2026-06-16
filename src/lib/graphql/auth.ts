import { gql } from "@apollo/client";

export const TELEGRAM_LOGIN = gql`
  mutation TelegramLogin(
    $telegramId: String!
    $hash: String!
    $authDate: Int!
    $userName: String
    $userLastName: String
    $userImage: String
  ) {
    telegramLogin(
      telegramId: $telegramId
      hash: $hash
      authDate: $authDate
      userName: $userName
      userLastName: $userLastName
      userImage: $userImage
    ) {
      accessToken
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
    }
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
      user {
        id
        userName
        userRole
        userStatus
        userAuthType
        googleId
        userImage
      }
    }
  }
`;