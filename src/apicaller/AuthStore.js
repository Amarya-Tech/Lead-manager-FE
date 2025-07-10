import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      encryptionKey: '',
      userId: '',
      role: '',
      jwt: '',

      setEncryptionKey: (key) => set({ encryptionKey: key }),
      setUserId: (id) => set({ userId: id }),
      setRole: (role) => set({ role }),
      setJwt: (token) => set({ jwt: token }),

      clearAuth: () => set({
        encryptionKey: '',
        userId: '',
        role: '',
        jwt: '',
      }),
    }),
    { name: 'auth-store' }
  )
);
