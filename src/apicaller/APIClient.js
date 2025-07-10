import axios from 'axios';
import { useAuthStore } from './AuthStore.js';

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  timeout: 10000,
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const { encryptionKey, jwt } = useAuthStore.getState();

    if (encryptionKey) {
      config.headers['x-encryption-key'] = encryptionKey;
    }

    if (jwt) {
      config.headers['x-access-token'] = jwt;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
