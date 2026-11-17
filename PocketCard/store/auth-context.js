import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (email, password, displayName = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
      setUser({ ...cred.user, displayName: displayName.trim() });
    }
    return cred;
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (!auth.currentUser) return;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (photoURL !== undefined) updates.photoURL = photoURL.trim();

    await updateProfile(auth.currentUser, updates);
    setUser({ ...auth.currentUser, ...updates });
  };

  const logout = async () => {
    return await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
