import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  if (!profile || profile.is_active !== true) {
    await supabase.auth.signOut();
    return null;
  }
  return {
    ...sessionUser,
    email: profile.email ?? sessionUser.email,
    name: profile.full_name ?? sessionUser.email,
    full_name: profile.full_name,
    role: profile.role,
    is_active: profile.is_active,
    staff_id: profile.staff_id,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshUser = useCallback(async (sessionUser) => {
    try {
      setAuthError(null);
      const nextUser = await hydrateUser(sessionUser);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      setUser(null);
      setAuthError(error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      await refreshUser(session?.user ?? null);
      if (mounted) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      await refreshUser(session?.user ?? null);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [refreshUser]);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isAuthed: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isViewer: user?.role === 'viewer',
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) throw error;
      return data;
    },
    signup: undefined,
    logout: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    }),
  }), [user, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
