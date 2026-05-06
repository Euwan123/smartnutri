import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../services/StorageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyUser = (userData) => {
    auth.currentUser = userData;
    setUser(userData);
  };

  useEffect(() => {
    (async () => {
      try {
        const saved = await StorageService.getUser();
        if (saved) {
          applyUser(saved);
        }
      } catch (e) {
        console.log('Session restore error:', e.message);
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email, password, rememberMe = false) => {
    const userData = {
      uid: Date.now().toString(),
      email: email.trim(),
      displayName: email.split('@')[0],
      photoURL: null,
    };

    await StorageService.setUser(userData);
    applyUser(userData);
    return userData;
  };

  const signUp = async (email, password, displayName) => {
    const userData = {
      uid: Date.now().toString(),
      email: email.trim(),
      displayName: displayName || email.split('@')[0],
      photoURL: null,
    };

    await StorageService.setUser(userData);
    applyUser(userData);
    return userData;
  };

  const signInWithGoogle = async () => {
    const userData = {
      uid: Date.now().toString(),
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: null,
    };

    await StorageService.setUser(userData);
    applyUser(userData);
    return userData;
  };

  const signOut = async () => {
    await StorageService.removeUser();
    applyUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, loading: false, signIn: () => {}, signUp: () => {}, signOut: () => {}, signInWithGoogle: () => {} };
  return ctx;
}

export const auth = {
  currentUser: null,
};
