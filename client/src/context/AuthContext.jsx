import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem('arcade_user');
    const storedToken = localStorage.getItem('arcade_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('arcade_user');
        localStorage.removeItem('arcade_token');
      }
    }

    setLoading(false);
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('arcade_token', data.token);
    localStorage.setItem('arcade_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    return persistSession(data);
  };

  const register = async (username, password) => {
    const { data } = await api.post('/auth/register', { username, password });
    return persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem('arcade_token');
    localStorage.removeItem('arcade_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
