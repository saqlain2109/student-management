import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First check if there's a default admin session in localStorage
    const localUser = localStorage.getItem('edu_admin_user');
    if (localUser) {
      setUser(JSON.parse(localUser));
      setLoading(false);
      return;
    }

    // 2. Otherwise check Supabase sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else if (!localStorage.getItem('edu_admin_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    // Hardcoded Default Login check
    if (email === 'admin@college.com' && password === 'admin123') {
      const defaultUser = { email: 'admin@college.com', id: 'default-admin' };
      localStorage.setItem('edu_admin_user', JSON.stringify(defaultUser));
      setUser(defaultUser);
      return { data: { user: defaultUser }, error: null };
    }

    // Fallback to Supabase Auth
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    localStorage.removeItem('edu_admin_user');
    setUser(null);
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
