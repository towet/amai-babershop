import { supabase } from '../supabase/supabase';
import { User, UserRole } from '../auth/auth-context';

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // First try to authenticate with Supabase Auth
    let authData;
    let authError;
    
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = result.data;
      authError = result.error;
    } catch (e) {
      authError = e;
    }
    
    // If Supabase Auth fails, check if this is a barber with credentials in the barbers table
    if (authError) {
      console.log('Supabase auth failed, checking barbers table');
      
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!barberError && barberData && barberData.password === password) {
        // Found matching barber with correct password in barbers table
        console.log('Found barber in table with matching password');
        
        // Create a user object for the barber
        const user: User = {
          id: barberData.id, // Use barber ID as user ID
          name: barberData.name,
          email: barberData.email,
          role: 'barber' as UserRole,
          barberId: barberData.id,
          photoUrl: barberData.photo_url,
        };
        
        return { user, error: null };
      }
      
      // If we get here, either no barber was found or password didn't match
      throw authError; // Rethrow the original auth error
    }
    
    if (!authData.user) {
      return { user: null, error: new Error('No user returned from authentication') };
    }

    // Check if user is a manager
    const { data: managerData, error: managerError } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email)
      .single();

    if (!managerError && managerData) {
      // User is a manager
      const user: User = {
        id: authData.user.id,
        name: managerData.name,
        email: authData.user.email!,
        role: 'manager' as UserRole,
        photoUrl: managerData.photo_url,
      };
      return { user, error: null };
    }

    // Check if user is a barber
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('*')
      .eq('email', email)
      .single();

    if (!barberError && barberData) {
      // User is a barber
      const user: User = {
        id: authData.user.id,
        name: barberData.name,
        email: authData.user.email!,
        role: 'barber' as UserRole,
        barberId: barberData.id,
        photoUrl: barberData.photo_url,
      };
      return { user, error: null };
    }

    return { user: null, error: new Error('User not found in system') };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error: error as Error };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error as Error };
  }
};

// Get current session
export const getCurrentSession = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!sessionData.session) {
      return { user: null, error: null };
    }
    
    const authUser = sessionData.session.user;
    
    // Check if user is a manager
    const { data: managerData, error: managerError } = await supabase
      .from('managers')
      .select('*')
      .eq('email', authUser.email)
      .single();
    
    if (!managerError && managerData) {
      // User is a manager
      const user: User = {
        id: authUser.id,
        name: managerData.name,
        email: authUser.email!,
        role: 'manager' as UserRole,
        photoUrl: managerData.photo_url,
      };
      return { user, error: null };
    }
    
    // Check if user is a barber
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('*')
      .eq('email', authUser.email)
      .single();
    
    if (!barberError && barberData) {
      // User is a barber
      const user: User = {
        id: authUser.id,
        name: barberData.name,
        email: authUser.email!,
        role: 'barber' as UserRole,
        barberId: barberData.id,
        photoUrl: barberData.photo_url,
      };
      return { user, error: null };
    }
    
    return { user: null, error: new Error('User not found in system') };
  } catch (error) {
    console.error('Error getting current session:', error);
    return { user: null, error: error as Error };
  }
};

// Register a new user (manager or barber)
export const register = async (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole,
  additionalData?: any
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Auth error details:', authError);
      // Check if it's an email validation error
      if (authError.message.includes('email')) {
        throw new Error(`Email validation failed: ${authError.message}. Try a different email format.`);
      }
      throw authError;
    }
    
    if (!authData.user) {
      return { user: null, error: new Error('No user returned from registration') };
    }
    
    // Add user data to the appropriate table based on role
    if (role === 'manager') {
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .insert([{
          id: authData.user.id,
          email,
          name,
          photo_url: additionalData?.photoUrl,
        }])
        .select()
        .single();
      
      if (managerError) throw managerError;
      
      const user: User = {
        id: authData.user.id,
        name,
        email,
        role: 'manager',
        photoUrl: additionalData?.photoUrl,
      };
      
      return { user, error: null };
    } else if (role === 'barber') {
      // For barbers, we use the barbers table
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .insert([{
          name,
          email,
          phone: additionalData?.phone,
          age: additionalData?.age,
          specialty: additionalData?.specialty,
          bio: additionalData?.bio,
          photo_url: additionalData?.photoUrl,
          join_date: new Date().toISOString(),
          commission_rate: additionalData?.commissionRate || 60,
          password, // Note: In a production app, you would not store this here
          active: true,
        }])
        .select()
        .single();
      
      if (barberError) throw barberError;
      
      const user: User = {
        id: authData.user.id,
        name,
        email,
        role: 'barber',
        barberId: barberData.id,
        photoUrl: additionalData?.photoUrl,
      };
      
      return { user, error: null };
    }
    
    return { user: null, error: new Error('Invalid role') };
  } catch (error) {
    console.error('Error registering user:', error);
    return { user: null, error: error as Error };
  }
};
