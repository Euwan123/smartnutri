import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

// Firebase Auth REST API helper
const firebaseREST = async (endpoint, body) => {
  const res = await fetch(`${AUTH_URL}:${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Authentication failed');
  }
  return data;
};

// Create user doc in Firestore if it doesn't exist
const ensureUserDoc = async (uid, email, displayName) => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: displayName || email.split('@')[0],
        email,
        createdAt: new Date().toISOString(),
        calorieGoal: 2000,
        location: 'Davao City',
        isPublic: true,
      });
    }
  } catch (e) {
    console.log('ensureUserDoc error:', e.message);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep auth.currentUser in sync so screens that import auth directly work
  const applyUser = (userData) => {
    auth.currentUser = userData
      ? { uid: userData.uid, email: userData.email, displayName: userData.displayName || null, photoURL: userData.photoURL || null }
      : null;
    setUser(userData);
  };

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('user_data');
        const remember = await SecureStore.getItemAsync('remember_me');
        if (saved && remember === 'true') {
          applyUser(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Session restore error:', e.message);
      }
      setLoading(false);
    })();
  }, []);

  // --- Email / Password Sign In ---
  const signIn = async (email, password, rememberMe = false) => {
    const data = await firebaseREST('signInWithPassword', {
      email: email.trim(),
      password,
      returnSecureToken: true,
    });

    const userData = {
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || null,
      photoURL: data.photoUrl || null,
      idToken: data.idToken,
    };

    await ensureUserDoc(userData.uid, userData.email, userData.displayName);

    if (rememberMe) {
      await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
      await SecureStore.setItemAsync('remember_me', 'true');
    }

    applyUser(userData);
    return userData;
  };

  // --- Email / Password Sign Up ---
  const signUp = async (email, password, displayName) => {
    const data = await firebaseREST('signUp', {
      email: email.trim(),
      password,
      returnSecureToken: true,
    });

    // Set display name
    try {
      await firebaseREST('update', {
        idToken: data.idToken,
        displayName: displayName || email.split('@')[0],
        returnSecureToken: false,
      });
    } catch (e) {
      console.log('Display name update error:', e.message);
    }

    const userData = {
      uid: data.localId,
      email: data.email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      idToken: data.idToken,
    };

    await ensureUserDoc(userData.uid, userData.email, userData.displayName);

    // Auto save session after signup
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    await SecureStore.setItemAsync('remember_me', 'true');

    applyUser(userData);
    return userData;
  };

  // --- Google Sign In ---
  const signInWithGoogle = async () => {
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'your_google_web_client_id_here') {
      throw new Error(
        'Google Client ID not set. Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env file.\n\n' +
        'Get it from: console.cloud.google.com → APIs & Services → Credentials'
      );
    }

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${googleClientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('openid email profile')}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      throw new Error('Google sign-in was cancelled or failed');
    }

    // Extract access_token from fragment
    const fragment = result.url.split('#')[1] || '';
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    if (!accessToken) {
      throw new Error('No access token received from Google');
    }

    // Exchange with Firebase
    const firebaseData = await firebaseREST('signInWithIdp', {
      postBody: `access_token=${accessToken}&providerId=google.com`,
      requestUri: redirectUri,
      returnIdpCredential: true,
      returnSecureToken: true,
    });

    const userData = {
      uid: firebaseData.localId,
      email: firebaseData.email,
      displayName: firebaseData.displayName || firebaseData.email.split('@')[0],
      photoURL: firebaseData.photoUrl || null,
      idToken: firebaseData.idToken,
    };

    await ensureUserDoc(userData.uid, userData.email, userData.displayName);

    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    await SecureStore.setItemAsync('remember_me', 'true');

    applyUser(userData);
    return userData;
  };

  // --- Sign Out ---
  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.setItemAsync('remember_me', 'false');
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