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
        console.log('Session will expire in 2 minutes');
        // You could show a toast notification here
      }, warningTime);
      
      // Set the actual timeout
      const timer = setTimeout(async () => {
        console.log('Session expired due to inactivity');
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
      
      console.log("Logout successful, state cleared");
      return result;
    } catch (error) {
      console.error("Logout exception:", error);
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
        console.error('Auth initialization error:', error);
        
        // Handle lock timeout errors gracefully
        if (error.message?.includes('Navigator LockManager') || error.message?.includes('timed out') || error.message?.includes('LockManager')) {
          console.log('Auth lock timeout - retrying with exponential backoff...');
          
          // Clear any existing session data that might be causing the lock
          await supabase.auth.signOut();
          
          // Retry with exponential backoff
          const retryAttempts = 3;
          const baseDelay = 1000;
          
          for (let attempt = 0; attempt < retryAttempts; attempt++) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1} in ${delay}ms`);
            
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
                    console.log('Auth retry successful');
                    return; // Success, exit retry loop
                  }
                }
              } catch (retryError) {
                console.error(`Retry attempt ${attempt + 1} failed:`, retryError);
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
