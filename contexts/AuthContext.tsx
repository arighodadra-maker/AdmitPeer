'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, saveUserProfile, type AuthUser } from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loaded: boolean;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loaded: false,
  logout: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoaded(true);
        return;
      }

      let profile = await getUserProfile(fbUser.uid);

      // Race condition on signup: auth fires before Firestore write completes.
      // Retry up to 3× with increasing delays.
      if (!profile) {
        for (const delay of [500, 1000, 1500]) {
          await new Promise(r => setTimeout(r, delay));
          profile = await getUserProfile(fbUser.uid);
          if (profile) break;
        }
      }

      setUser(
        profile ?? {
          id: fbUser.uid,
          name: fbUser.displayName ?? 'User',
          email: fbUser.email ?? '',
          role: 'student',
          dreamColleges: [],
          createdAt: new Date().toISOString(),
        }
      );
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  async function updateUser(updates: Partial<AuthUser>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    const { id, ...data } = updated;
    await saveUserProfile(id, data);
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loaded, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
