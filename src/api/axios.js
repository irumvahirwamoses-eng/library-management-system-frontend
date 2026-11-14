import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    // Don't force a full page reload for failed login / password-change attempts —
    // that wiped the error toast. Only redirect when a real session expires.
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/change-password');
    if (err.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
