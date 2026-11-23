import type { PaymentMethod } from '../types/commerce';

export interface PaymentIntentResult {
  ready: boolean;
  gatewayRequired: boolean;
  message: string;
}

export const paymentService = {
  async verifyMethod(method: PaymentMethod): Promise<PaymentIntentResult> {
    await new Promise((r) => setTimeout(r, 160));
    if (method === 'cod') {
      return {
        ready: true,
        gatewayRequired: false,
        message: 'Cash on Delivery verified. Pay upon courier arrival.',
      };
    }
    return {
      ready: false,
      gatewayRequired: true,
      message:
        'Live Razorpay/UPI/Card settlement requires configuring your server payment gateway keys (RAZORPAY_KEY_ID & webhook secret). Select Cash on Delivery to complete an instant verified order, or place an Awaiting Payment reservation.',
    };
  },
};
