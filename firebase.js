import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCU0x3lKEfvyvtVY39kd8Y5U2M8asX3k5g",
  authDomain: "smartnutri-3ba4a.firebaseapp.com",
  projectId: "smartnutri-3ba4a",
  storageBucket: "smartnutri-3ba4a.firebasestorage.app",
  messagingSenderId: "658317399278",
  appId: "1:658317399278:web:19421764c29df7a0fd8fff",
  measurementId: "G-S310NHQ2X0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);