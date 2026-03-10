"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, AuthError } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  profile: any;
  loading: boolean;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetSessionTimer: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => ({ error: null }),
  resetSessionTimer: () => {},
});

// Session timeout duration (25 minutes in milliseconds)
const SESSION_TIMEOUT = 25 * 60 * 1000; // 25 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null);

  const clearSessionTimeouts = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    if (warningTimeout) {
      clearTimeout(warningTimeout);
      setWarningTimeout(null);
    }
  };

  const resetSessionTimer = () => {
    clearSessionTimeouts();
    
    if (user) {
      // Show warning 2 minutes before timeout
      const warningTime = SESSION_TIMEOUT - (2 * 60 * 1000); // 23 minutes
      
      const warningTimer = setTimeout(() => {
        // Session timeout warning - 2 minutes remaining
        // You could show a toast notification here
      }, warningTime);
      
      // Set the actual timeout
      const timer = setTimeout(async () => {
        // Session timeout - signing out user
        await signOut();
      }, SESSION_TIMEOUT);
      
      setWarningTimeout(warningTimer);
      setSessionTimeout(timer);
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      clearSessionTimeouts();
      const result = await supabase.auth.signOut();
      
      // Clear all auth state immediately
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      return result;
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      resetSessionTimer();
    };

    // Track various user activities
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initial timer setup
    resetSessionTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      clearSessionTimeouts();
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
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
      } catch (error: any) {
        // Handle session initialization error
        
        // Handle lock timeout errors gracefully
        if (error.message?.includes('Navigator LockManager') || error.message?.includes('timed out') || error.message?.includes('LockManager')) {
          // Lock timeout detected
          
          // Clear any existing session data that might be causing the lock
          await supabase.auth.signOut();
          
          // Retry with exponential backoff
          const retryAttempts = 3;
          const baseDelay = 1000;
          
          for (let attempt = 0; attempt < retryAttempts; attempt++) {
            const delay = baseDelay * Math.pow(2, attempt);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (mounted) {
              try {
                const { data: { session } } = await supabase.auth.getSession();
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
                    setLoading(false);
                    return; // Success, exit retry loop
                  }
                }
              } catch (retryError) {
                // Retry failed, continue to next attempt
                if (attempt === retryAttempts - 1) {
                  // Final retry failed, set loading to false
                  if (mounted) {
                    setLoading(false);
                  }
                }
              }
            }
          }
        } else {
          // For other errors, just finish loading
          if (mounted) {
            setLoading(false);
          }
        }
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
          clearSessionTimeouts();
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      clearSessionTimeouts();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, resetSessionTimer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
