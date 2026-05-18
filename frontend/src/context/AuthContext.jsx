import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, me as apiMe, logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, verificar si ya hay token guardado
  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    localStorage.setItem('portal_token', res.data.token);
    localStorage.setItem('portal_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
