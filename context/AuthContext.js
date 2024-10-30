// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children, navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async (navigation) => {
    await signOut(auth);
    navigation.navigate("Login"); // Redirect to Login on successful logout
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
