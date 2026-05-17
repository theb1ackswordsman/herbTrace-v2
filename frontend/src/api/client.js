import axios from 'axios';

let base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
if (import.meta.env.VITE_API_URL && !base.endsWith('/api')) {
  base = base.replace(/\/$/, '') + '/api';
}

const apiClient = axios.create({
  baseURL: base,
});

// Request Interceptor: Attach JWT token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
