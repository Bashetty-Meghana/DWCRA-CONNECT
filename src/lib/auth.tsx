import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'entrepreneur' | 'buyer' | 'admin';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  profile_image_url: string | null;
  preferred_language: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Check Supabase connection on mount
  useEffect(() => {
    console.log('🔌 Checking Supabase connection...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Supabase connection error:', error);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    }).catch(err => {
      console.error('❌ Supabase connection exception:', err);
    });
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleError) {
        console.error('Error fetching role:', roleError);
      } else if (roleData) {
        setRole(roleData.role as AppRole);
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 500);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (userId: string, fullName: string) => {
    try {
      console.log('📝 Creating user profile...');
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: fullName,
          preferred_language: 'en',
        });

      if (error) {
        console.error('❌ Error creating profile:', error);
        return { error };
      }
      console.log('✅ Profile created successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Exception creating profile:', err);
      return { error: err };
    }
  };

  const createUserRole = async (userId: string, appRole: AppRole) => {
    try {
      console.log('🎭 Creating user role...');
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: appRole,
        });

      if (error) {
        console.error('❌ Error creating role:', error);
        return { error };
      }
      console.log('✅ Role created successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Exception creating role:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, appRole: AppRole = 'entrepreneur') => {
    try {
      console.log('📋 Starting sign up process for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: appRole,
          },
        },
      });
      
      if (error) {
        console.error('❌ SignUp error:', error);
        return { error: error as Error };
      }

      // If sign up was successful, create profile and role
      if (data.user) {
        console.log('✅ User created, now creating profile and role...');
        
        // Wait a bit for the user to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));

        const profileResult = await createUserProfile(data.user.id, fullName);
        if (profileResult.error) {
          console.error('⚠️ Profile creation failed:', profileResult.error);
          // Continue anyway - user can update profile later
        }

        const roleResult = await createUserRole(data.user.id, appRole);
        if (roleResult.error) {
          console.error('⚠️ Role creation failed:', roleResult.error);
          // Continue anyway - role can be set later
        }

        console.log('✅ Sign up completed successfully');
      }

      return { error: null };
    } catch (err) {
      console.error('❌ SignUp exception:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in with email:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ SignIn error:', error);
        return { error: error as Error };
      }

      console.log('✅ Sign in successful');
      
      // Fetch user data after successful sign in
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error('❌ SignIn exception:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      console.log('✅ Sign out successful');
    } catch (err) {
      console.error('❌ Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}