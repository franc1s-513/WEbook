import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('webook_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('webook_user', JSON.stringify(userData));
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('webook_user', JSON.stringify(userData));
      showToast('Registration successful! Welcome to WEbook.', 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('webook_user');
    showToast('You have been logged out.', 'info');
  };

  const quickLogin = async (role) => {
    let email = 'customer@webook.com';
    let password = 'Customer@123';

    if (role === 'admin') {
      email = 'admin@webook.com';
      password = 'Admin@123';
    } else if (role === 'mechanic') {
      email = 'mechanic@webook.com';
      password = 'Mechanic@123';
    }

    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickLogin,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="toast-floating" style={{
          borderColor: toastMessage.type === 'error' ? 'var(--accent-rose)' :
                       toastMessage.type === 'success' ? 'var(--accent-emerald)' : 'var(--primary)'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: toastMessage.type === 'error' ? 'var(--accent-rose)' :
                        toastMessage.type === 'success' ? 'var(--accent-emerald)' : 'var(--primary)'
          }} />
          <span>{toastMessage.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
