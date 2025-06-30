import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEncryptionKeyStore = create(
   persist(
    (set) => ({
      encryptionKey: '',
      setEncryptionKey: (key) => set({ encryptionKey: key }),
    }),
     { name: 'encryption-key-storage' },
  )
);