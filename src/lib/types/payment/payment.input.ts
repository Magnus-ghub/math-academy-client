import { PaymentType, PaymentProvider } from "@/lib/enums/payment.enum";

export interface PaymentInput {
  paymentType: PaymentType;
  paymentProvider: PaymentProvider;
  amount: number;
  groupId?: string;
}