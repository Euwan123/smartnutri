// Mock authentication service for testing without Firebase
export const mockSignIn = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'test@smartnutri.com' && password === 'password123') {
    return {
      user: {
        uid: 'demo-user-123',
        email: 'test@smartnutri.com',
        displayName: 'Demo User'
      }
    };
  }
  
  throw new Error('Invalid credentials. Use test@smartnutri.com / password123');
};

export const mockSignUp = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    user: {
      uid: 'new-user-' + Date.now(),
      email: email,
      displayName: 'New User'
    }
  };
};

export const mockSignOut = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};
