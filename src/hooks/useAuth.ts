/**
 * hooks/useAuth.ts
 * Subscribes to Firebase Auth and syncs state to Zustand.
 * Gracefully handles auth errors (e.g. bad API key in demo mode).
 */

'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider }  from '@/lib/firebase';
import { getOrCreateUser }       from '@/lib/firestore';
import { useStore }              from '@/lib/store';

export function useAuth() {
  const { user, setUser } = useStore();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, async firebaseUser => {
        if (firebaseUser) {
          const appUser = await getOrCreateUser(firebaseUser.uid, {
            displayName: firebaseUser.displayName  ?? undefined,
            email:       firebaseUser.email        ?? undefined,
            photoURL:    firebaseUser.photoURL     ?? undefined,
          });
          setUser(appUser);
        } else {
          setUser(null);
        }
      }, err => {
        // Silently ignore auth errors in demo mode
        console.warn('Auth listener error (demo mode?):', err.message);
      });
    } catch (err) {
      console.warn('Firebase Auth init error (demo mode?):', err);
    }
    return () => unsub?.();
  }, [setUser]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Google sign-in error:', msg);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
  };

  return { user, signInWithGoogle, logout };
}
