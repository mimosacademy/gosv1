import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '@/lib/supabaseClient';

const AuthContext = createContext(null);

async function hydrateUser(sessionUser) {
  if (!sessionUser) return null;
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,is_active,staff_id')
    .eq('id', sessionUser.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile || profile.is_active !== true) return null;

  return {
    ...sessionUser,
    email: profile.email ?? sessionUser.email,
    name: profile.full_name ?? sessionUser.user_metadata?.full_name ?? sessionUser.email,
    full_name: profile.full_name ?? sessionUser.user_metadata?.full_name,
    role: profile.role,
    is_active: profile.is_active,
    staff_id: profile.staff_id ?? null,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const initialise = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const nextUser = await hydrateUser(session?.user ?? null);
        if (mounted) setUser(nextUser);
      } catch (error) {
        console.error('Failed to initialise authentication:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initialise();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        try {
          const nextUser = await hydrateUser(session?.user ?? null);
          if (mounted) setUser(nextUser);
        } catch (error) {
          console.error('Failed to hydrate authentication profile:', error);
          if (mounted) setUser(null);
        }
      }, 0);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthed: Boolean(user),
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) throw error;
      const hydrated = await hydrateUser(data.user);
      if (!hydrated) {
        await supabase.auth.signOut();
        throw new Error('Your account is not provisioned or is inactive. Contact the system administrator.');
      }
      setUser(hydrated);
      return data;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });
      if (error) throw error;
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
