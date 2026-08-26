import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '@/lib/supabaseClient';

const AuthContext = createContext(null);

async function hydrateUser(sessionUser) {
  if (!sessionUser) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', sessionUser.id)
    .maybeSingle();

  return {
    ...sessionUser,
    email: profile?.email ?? sessionUser.email,
    name: profile?.full_name ?? sessionUser.user_metadata?.full_name ?? sessionUser.email,
    full_name: profile?.full_name ?? sessionUser.user_metadata?.full_name,
    role: profile?.role ?? 'viewer',
    is_active: profile?.is_active ?? true,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setUser(await hydrateUser(session?.user ?? null));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = await hydrateUser(session?.user ?? null);
      if (mounted) setUser(nextUser);
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signup: async (email, password, extraFields = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: extraFields.full_name ?? extraFields.name ?? '' } },
      });
      if (error) throw error;
      return data;
    },
    logout: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    }),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
