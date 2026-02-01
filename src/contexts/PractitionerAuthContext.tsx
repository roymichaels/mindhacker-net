import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePractitioner } from './PractitionerContext';

interface PractitionerClientProfile {
  id: string;
  user_id: string;
  practitioner_id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[];
  total_sessions: number;
  total_purchases: number;
  last_activity_at: string | null;
  status: string;
}

interface PractitionerAuthContextType {
  user: User | null;
  session: Session | null;
  clientProfile: PractitionerClientProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<PractitionerClientProfile>) => Promise<{ error: Error | null }>;
}

const PractitionerAuthContext = createContext<PractitionerAuthContextType | null>(null);

export const usePractitionerAuth = () => {
  const context = useContext(PractitionerAuthContext);
  if (!context) {
    throw new Error('usePractitionerAuth must be used within PractitionerAuthProvider');
  }
  return context;
};

interface PractitionerAuthProviderProps {
  children: ReactNode;
}

export const PractitionerAuthProvider = ({ children }: PractitionerAuthProviderProps) => {
  const { practitioner } = usePractitioner();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [clientProfile, setClientProfile] = useState<PractitionerClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchClientProfile = async (userId: string, practitionerId: string) => {
    const { data, error } = await supabase
      .from('practitioner_client_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('practitioner_id', practitionerId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }
    
    return data;
  };
  
  const createClientProfile = async (userId: string, practitionerId: string, displayName?: string) => {
    // First ensure user exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profile) {
      // Profile should be created by auth trigger, but just in case
      await supabase.from('profiles').insert({
        id: userId,
        full_name: displayName,
      });
    }
    
    // Create practitioner client profile
    const { data, error } = await supabase
      .from('practitioner_client_profiles')
      .insert({
        user_id: userId,
        practitioner_id: practitionerId,
        display_name: displayName,
        status: 'active',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client profile:', error);
      return null;
    }
    
    // Also create practitioner_clients relationship
    await supabase.from('practitioner_clients').upsert({
      practitioner_id: practitionerId,
      client_user_id: userId,
      status: 'active',
    }, {
      onConflict: 'practitioner_id,client_user_id',
    });
    
    return data;
  };
  
  useEffect(() => {
    if (!practitioner) {
      setIsLoading(false);
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        
        if (nextSession?.user && practitioner) {
          setTimeout(async () => {
            let profile = await fetchClientProfile(nextSession.user.id, practitioner.id);
            
            // If no profile exists, create one
            if (!profile) {
              profile = await createClientProfile(
                nextSession.user.id, 
                practitioner.id,
                nextSession.user.user_metadata?.full_name
              );
            }
            
            setClientProfile(profile);
            
            // Update last activity
            if (profile) {
              await supabase
                .from('practitioner_client_profiles')
                .update({ last_activity_at: new Date().toISOString() })
                .eq('id', profile.id);
            }
          }, 0);
        } else {
          setClientProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user && practitioner) {
        let profile = await fetchClientProfile(existingSession.user.id, practitioner.id);
        
        if (!profile) {
          profile = await createClientProfile(
            existingSession.user.id,
            practitioner.id,
            existingSession.user.user_metadata?.full_name
          );
        }
        
        setClientProfile(profile);
      }
      
      setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, [practitioner?.id]);
  
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };
  
  const signup = async (email: string, password: string, displayName: string) => {
    if (!practitioner) {
      return { error: new Error('No practitioner context') };
    }
    
    const redirectUrl = `${window.location.origin}/p/${practitioner.slug}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: displayName,
          practitioner_id: practitioner.id,
        },
      },
    });
    
    if (error) {
      return { error: new Error(error.message) };
    }
    
    // Create client profile immediately if user is confirmed
    if (data.user && data.session) {
      await createClientProfile(data.user.id, practitioner.id, displayName);
    }
    
    return { error: null };
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setClientProfile(null);
  };
  
  const updateProfile = async (updates: Partial<PractitionerClientProfile>) => {
    if (!clientProfile) {
      return { error: new Error('No client profile') };
    }
    
    const { error } = await supabase
      .from('practitioner_client_profiles')
      .update(updates)
      .eq('id', clientProfile.id);
    
    if (error) {
      return { error: new Error(error.message) };
    }
    
    // Refetch profile
    if (user && practitioner) {
      const profile = await fetchClientProfile(user.id, practitioner.id);
      setClientProfile(profile);
    }
    
    return { error: null };
  };
  
  return (
    <PractitionerAuthContext.Provider
      value={{
        user,
        session,
        clientProfile,
        isLoading,
        isAuthenticated: !!user && !!clientProfile,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </PractitionerAuthContext.Provider>
  );
};

export default PractitionerAuthContext;
