import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, getProfile, updateProfile } from '../services/profileService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
  userLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when authenticated
          setUserLoading(true);
          try {
            const userProfile = await getProfile();
            setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          } finally {
            setUserLoading(false);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setUserLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (data.user) {
        const userProfile = await getProfile();
        setProfile(userProfile);
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setUserLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setUserLoading(true);
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email,
          },
        },
      });
      
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    } finally {
      setUserLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    setUserLoading(true);
    try {
      const updatedProfile = await updateProfile(updates);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  const signOut = async () => {
    setUserLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    loading,
    userLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
