import React, { createContext, useContext, useState, useEffect } from 'react';

const MockAuthContext = createContext();

export function MockAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@smartnutri.com' && password === 'password123') {
      const mockUser = {
        uid: 'demo-user-123',
        email: 'test@smartnutri.com',
        displayName: 'Demo User'
      };
      setUser(mockUser);
      setLoading(false);
      return mockUser;
    }
    
    setLoading(false);
    throw new Error('Invalid credentials. Use test@smartnutri.com / password123');
  };

  const signOut = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setLoading(false);
  };

  return (
    <MockAuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    return { user: null, loading: false, signIn: () => {}, signOut: () => {} };
  }
  return context;
}
