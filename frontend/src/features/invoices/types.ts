export type PaymentGateState = {
  canProceed: boolean;
  reason: string;
  outstandingAmount: number;
  requiredStatus: "VERIFIED";
};
