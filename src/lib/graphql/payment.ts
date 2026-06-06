import { gql } from "@apollo/client";

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: PaymentInput!) {
    createPayment(input: $input) {
      id
      amount
      paymentType
      paymentProvider
      paymentStatus
      createdAt
    }
  }
`;

export const GET_MY_PAYMENTS = gql`
  query GetMyPayments {
    getMyPayments {
      id
      amount
      paymentType
      paymentProvider
      paymentStatus
      confirmedAt
      createdAt
    }
  }
`;

export const GET_ALL_PAYMENTS = gql`
  query GetAllPayments {
    getAllPayments {
      id
      userId
      amount
      paymentType
      paymentProvider
      paymentStatus
      clickTransactionId
      confirmedAt
      confirmedBy
      createdAt
    }
  }
`;

export const CONFIRM_MANUAL_PAYMENT = gql`
  mutation ConfirmManualPayment($paymentId: String!) {
    confirmManualPayment(paymentId: $paymentId) {
      id
      paymentStatus
      confirmedAt
    }
  }
`;