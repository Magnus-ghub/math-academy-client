import { gql } from "@apollo/client";

export const GET_MY_PAYMENTS = gql`
  query GetMyPayments {
    getMyPayments {
      id
      amount
      paymentType
      paymentProvider
      paymentStatus
      testId
      testTitle
      groupId
      receiptUrl
      studentNote
      adminReply
      confirmedAt
      createdAt
    }
  }
`;

export const GET_MY_PURCHASED_TEST_IDS = gql`
  query GetMyPurchasedTestIds {
    getMyPurchasedTestIds
  }
`;

export const GET_ALL_PAYMENTS = gql`
  query GetAllPayments {
    getAllPayments {
      id
      userId
      userName
      userLastName
      amount
      platformFee
      paymentType
      paymentProvider
      paymentStatus
      testId
      testTitle
      receiptUrl
      studentNote
      adminReply
      clickTransactionId
      confirmedAt
      confirmedBy
      createdAt
    }
  }
`;

export const GET_PAYMENT_STATS = gql`
  query GetPaymentStats {
    getPaymentStats {
      netRevenue
      totalTopupConfirmed
      totalClickCommission
      outstandingBalance
      uniquePayingUsers
      pendingCount
      avgConfirmHours
      providerBreakdown {
        provider
        count
        amount
      }
      dailyRevenue {
        date
        amount
      }
      topTests {
        testId
        testTitle
        count
        revenue
      }
    }
  }
`;

export const GET_TEST_SALES_STATS = gql`
  query GetTestSalesStats {
    getTestSalesStats {
      testId
      count
      revenue
    }
  }
`;

export const GET_MY_BALANCE = gql`
  query GetMyBalance {
    getMyBalance
  }
`;

export const INITIATE_CLICK_TOPUP = gql`
  mutation InitiateClickTopup($amount: Int!) {
    initiateClickTopup(amount: $amount) {
      payUrl
      payment {
        id
        paymentStatus
      }
    }
  }
`;

export const REPORT_MANUAL_TOPUP = gql`
  mutation ReportManualTopup($amount: Int!, $receiptUrl: String, $studentNote: String) {
    reportManualTopup(amount: $amount, receiptUrl: $receiptUrl, studentNote: $studentNote) {
      id
      paymentStatus
    }
  }
`;

export const PURCHASE_TEST_WITH_BALANCE = gql`
  mutation PurchaseTestWithBalance($testId: String!) {
    purchaseTestWithBalance(testId: $testId) {
      id
      paymentStatus
      amount
      testId
    }
  }
`;

export const CANCEL_MY_PENDING_PAYMENT = gql`
  mutation CancelMyPendingPayment($paymentId: String!) {
    cancelMyPendingPayment(paymentId: $paymentId) {
      id
      paymentStatus
    }
  }
`;

export const ADJUST_USER_BALANCE = gql`
  mutation AdjustUserBalance($userId: String!, $amount: Int!, $reason: String) {
    adjustUserBalance(userId: $userId, amount: $amount, reason: $reason) {
      id
      amount
      paymentStatus
    }
  }
`;

export const CONFIRM_MANUAL_PAYMENT = gql`
  mutation ConfirmManualPayment($paymentId: String!, $confirmedAmount: Int!, $adminReply: String) {
    confirmManualPayment(paymentId: $paymentId, confirmedAmount: $confirmedAmount, adminReply: $adminReply) {
      id
      paymentStatus
      amount
      adminReply
      confirmedAt
    }
  }
`;

export const REJECT_MANUAL_PAYMENT = gql`
  mutation RejectManualPayment($paymentId: String!, $adminReply: String) {
    rejectManualPayment(paymentId: $paymentId, adminReply: $adminReply) {
      id
      paymentStatus
      adminReply
    }
  }
`;

export const PAYMENT_REPORTED_SUBSCRIPTION = gql`
  subscription PaymentReported {
    paymentReported {
      id
      testTitle
      amount
      paymentStatus
      createdAt
    }
  }
`;
