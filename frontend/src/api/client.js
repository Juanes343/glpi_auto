import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inyectar token en cada petición
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirigir a /login si el servidor responde 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.hash.startsWith('#/login')) {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default client;
