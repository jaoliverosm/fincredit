import { create } from 'zustand';
import axios from 'axios';
import { globalNavigate } from '../lib/navigation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      globalNavigate('/login', { replace: true });
    }
    return Promise.reject(err);
  }
);

function loadFromStorage() {
  try {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol') || '';
    return { token, rol };
  } catch {
    return { token: null, rol: '' };
  }
}

export const useAuthStore = create((set, get) => {
  const stored = loadFromStorage();
  return {
    user: null,
    token: stored.token,
    rol: stored.rol,
    isAuthenticated: !!stored.token,

    login: async (email, password) => {
      const res = await api.post('/auth/login', { email, password });
      const { token, usuario } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol);
      set({ user: usuario, token, rol: usuario.rol, isAuthenticated: true });
      return usuario;
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      set({ user: null, token: null, rol: '', isAuthenticated: false });
    },

    me: async () => {
      try {
        const res = await api.get('/auth/me');
        const usuario = res.data.usuario;
        set({ user: usuario, rol: usuario.rol });
        return usuario;
      } catch {
        const { token } = get();
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          set({ user: null, token: null, rol: '', isAuthenticated: false });
        }
        return null;
      }
    }
  };
});

export default useAuthStore;
export { api };
