import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('saved_email');
        const savedRemember = await SecureStore.getItemAsync('remember_me');
        if (savedEmail && savedRemember === 'true') {
          setUser({ uid: 'demo-user-123', email: savedEmail });
        }
      } catch (_) {}
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    if (email === 'test@smartnutri.com' && password === 'password123') {
      const userData = { uid: 'demo-user-123', email: email };
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid credentials');
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('saved_email');
    await SecureStore.deleteItemAsync('saved_password');
    await SecureStore.setItemAsync('remember_me', 'false');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, loading: false, signIn: () => {}, signOut: () => {} };
  }
  return context;
}
