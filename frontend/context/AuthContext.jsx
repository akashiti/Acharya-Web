'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // enriched user object (includes role)
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ─── Auth State Listener ───────────────────────────────────────
  // Fires on every sign-in / sign-out / token refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force-refresh token to get latest custom claims (role)
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const role = idTokenResult.claims.role || 'USER';

        // Enrich user object with Firestore profile data
        let profile = {};
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) profile = userDoc.data();
        } catch {
          // If Firestore read fails, continue with Firebase user data only
        }

        setUser({
          id:          firebaseUser.uid,
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          name:        firebaseUser.displayName || profile.name || '',
          avatar:      firebaseUser.photoURL    || profile.avatar || null,
          phone:       profile.phone  || null,
          address:     profile.address || null,
          role,
          ...profile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Register ──────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Set display name in Firebase Auth
    await updateProfile(firebaseUser, { displayName: name });

    // Create Firestore user document (Cloud Function onUserCreate also does this,
    // but we set it here too for immediate availability)
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name,
      email:     email.toLowerCase(),
      role:      'USER',
      avatar:    null,
      phone:     null,
      address:   null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return firebaseUser;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will update the user state automatically
    return credential.user;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  }, [router]);

  // ─── Reset Password ────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  // ─── Get ID Token (for calling Cloud Functions) ────────────────
  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getIdToken, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
