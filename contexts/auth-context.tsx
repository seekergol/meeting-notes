'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'

// Define the shape of the context
interface AuthContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function fetches the initial session.
    const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
    }
    
    getSession();

    // This listener updates the state whenever the authentication state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    supabase,
    user,
    session,
    isLoading,
  };

  // We render children only after the initial session has been loaded.
  // This prevents brief flashes of content for unauthenticated users.
  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>
}

// Create the useAuth hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};