"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// 定义 Profile 类型
export type Profile = {
  id: string;
  name: string | null;
  has_paid_subscription: boolean;
};

// 更新 Context 类型
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // 如果有用户，就去获取他的 profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error("获取用户Profile失败:", profileError)
          } else {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('获取会话失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error("登录时获取用户Profile失败:", profileError)
          } else {
            setProfile(profileData)
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    isLoading,
    signOut: async () => {
      // ... existing code ...
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}