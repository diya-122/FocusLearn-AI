import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('focuslearn_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile/');
          setUser(response.data);
        } catch (e) {
          localStorage.removeItem('focuslearn_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    localStorage.setItem('focuslearn_token', response.data.access);
    
    // Fetch profile
    const profileResponse = await api.get('/auth/profile/');
    setUser(profileResponse.data);
    return profileResponse.data;
  };

  const register = async (data) => {
    // Create user
    await api.post('/auth/register/', {
        username: data.email,
        email: data.email,
        password: data.password,
        password2: data.password,
        first_name: data.name,
    });
    
    // Then login
    return await login(data.email, data.password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('focuslearn_token');
  };

  const updateProfile = async (data) => {
    const response = await api.patch('/auth/profile/', data);
    setUser(response.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
