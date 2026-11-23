import { estimateDeliveryByPincode } from '../utils/commerceRules';

export const shippingService = {
  async checkPincode(pincode: string) {
    await new Promise((r) => setTimeout(r, 150));
    return estimateDeliveryByPincode(pincode);
  },

  getMethods() {
    return [
      {
        id: 'standard' as const,
        name: 'Standard Insured Courier',
        eta: '3–5 business days',
        price: 12,
        freeOver: 150,
      },
      {
        id: 'express' as const,
        name: 'Priority Air Express',
        eta: '1–2 business days',
        price: 24,
        freeOver: null,
      },
    ];
  },
};
