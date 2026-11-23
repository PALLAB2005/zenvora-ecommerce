import { useAppDataStore } from '../store/useAppDataStore';
import type { User } from '../types/commerce';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 180));
    const res = useAppDataStore.getState().login(email, password);
    if (!res.ok || !res.user) {
      throw new Error(res.error || 'Authentication failed.');
    }
    return res.user;
  },

  async register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    await new Promise((r) => setTimeout(r, 200));
    const res = useAppDataStore.getState().register(payload);
    if (!res.ok || !res.user) {
      throw new Error(res.error || 'Registration failed.');
    }
    return res.user;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    await new Promise((r) => setTimeout(r, 200));
    const exists = useAppDataStore
      .getState()
      .users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      throw new Error('No account matches that email address.');
    }
    return {
      message: `Password reset link prepared for ${email}. Check your inbox or proceed to Reset Password.`,
    };
  },

  async logout(): Promise<void> {
    useAppDataStore.getState().logout();
  },
};
