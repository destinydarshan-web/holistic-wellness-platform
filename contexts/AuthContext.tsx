"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, AuthError } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  profile: any;
  loading: boolean;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => ({ error: null }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const result = await supabase.auth.signOut();
      
      // Clear all auth state immediately
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      console.log("Logout successful, state cleared");
      return result;
    } catch (error) {
      console.error("Logout exception:", error);
      return { error: error as AuthError };
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (mounted) {
          setProfile(data);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        const newUser = session?.user ?? null;
        setUser(newUser);

        if (newUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newUser.id)
            .single();

          setProfile(data);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
