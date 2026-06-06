import { PaymentType, PaymentProvider, PaymentStatus } from "@/lib/enums/payment.enum";

export interface Payment {
  id: string;
  userId: string;
  groupId?: string;
  paymentType: PaymentType;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  amount: number;
  clickTransactionId?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
}