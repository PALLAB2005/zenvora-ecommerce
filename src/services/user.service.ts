import { useAppDataStore } from '../store/useAppDataStore';

export const userService = {
  getCurrentUser() {
    return useAppDataStore.getState().currentUser;
  },

  getAddresses(userId: string) {
    return useAppDataStore
      .getState()
      .addresses.filter((a) => a.userId === userId);
  },

  updateProfile(userId: string, data: { name?: string; phone?: string }) {
    useAppDataStore.getState().updateProfile(userId, data);
  },
};
