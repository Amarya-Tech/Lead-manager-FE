import { create } from 'zustand';

export const useEncryptionKeyStore = create((set) => ({
  encryptionKey: '',
  setEncryptionKey: (key) => set({ encryptionKey: key }),
}));