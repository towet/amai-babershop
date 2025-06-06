import { supabase } from '../supabase/supabase';
import { Barber } from '../types';
import { register } from './auth-service';
import { getReviewsByBarber } from './review-service';

// Get all barbers
export const getAllBarbers = async (): Promise<Barber[]> => {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('active', true);
    
    if (error) throw error;
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || undefined,
      age: item.age || undefined,
      specialty: item.specialty || undefined,
      bio: item.bio || undefined,
      photoUrl: item.photo_url || undefined,
      joinDate: item.join_date,
      totalCuts: item.total_cuts,
      appointmentCuts: item.appointment_cuts,
      walkInCuts: item.walk_in_cuts,
      commissionRate: item.commission_rate,
      totalCommission: item.total_commission,
      active: item.active,
      rating: item.rating || undefined,
    }));
  } catch (error) {
    console.error('Error fetching barbers:', error);
    throw error;
  }
};

// Get a barber by ID
export const getBarberById = async (barberId: string): Promise<Barber | null> => {
  try {
    // Fetch main barber data and all their reviews
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select(`
        *,
        reviews (*)
      `)
      .eq('id', barberId)
      .single();
    
    if (barberError) throw barberError;
    if (!barberData) return null;

    // Fetch approved rating from the view
    let approvedRating = 0; // Default to 0
    const { data: ratingData, error: ratingError } = await supabase
      .from('barber_ratings_view')
      .select('average_rating')
      .eq('barber_id', barberId)
      .single();

    if (ratingError) {
      console.warn(`Could not fetch rating for barber ${barberId} from view:`, ratingError.message);
      // Fallback to the rating on the barber table if the view fails, though view is preferred
      approvedRating = barberData.rating ? parseFloat(barberData.rating.toFixed(1)) : 0;
    } else if (ratingData && ratingData.average_rating !== null) {
      approvedRating = parseFloat(ratingData.average_rating.toFixed(1));
    } else {
      // If ratingData is null or average_rating is null, it means no approved reviews, so rating is 0
      approvedRating = 0;
    }
    
    return {
      id: barberData.id,
      name: barberData.name,
      email: barberData.email,
      phone: barberData.phone || undefined,
      age: barberData.age || undefined,
      specialty: barberData.specialty || undefined,
      bio: barberData.bio || undefined,
      photoUrl: barberData.photo_url || undefined,
      joinDate: barberData.join_date,
      totalCuts: barberData.total_cuts || 0,
      appointmentCuts: barberData.appointment_cuts || 0,
      walkInCuts: barberData.walk_in_cuts || 0,
      commissionRate: barberData.commission_rate,
      totalCommission: barberData.total_commission || 0,
      active: barberData.active,
      rating: approvedRating, // USE THE RATING FROM THE VIEW (or fallback)
      reviews: barberData.reviews?.map((dbReview: any) => ({
        id: dbReview.id,
        rating: dbReview.rating,
        comment: dbReview.comment,
        clientName: dbReview.client_name,
        clientEmail: dbReview.client_email || undefined,
        createdAt: dbReview.created_at, // Use created_at from DB
        approved: dbReview.approved,
      })) || [], // Ensure it's an empty array if undefined/null
    };
  } catch (error) {
    console.error('Error fetching barber by ID:', error);
    throw error;
  }
};

// Create a new barber
export const createBarber = async (barber: Omit<Barber, 'id'> & { password?: string }): Promise<Barber> => {
  try {
    // First, try to register the barber in the authentication system if password is provided
    let authRegistrationSuccessful = false;
    let barberId = null;
    
    if (barber.email && barber.password) {
      try {
        // Register the barber with auth system
        const { user: authUser, error: authError } = await register(
          barber.email,
          barber.password,
          barber.name,
          'barber',
          {
            phone: barber.phone,
            age: barber.age,
            specialty: barber.specialty,
            bio: barber.bio,
            photoUrl: barber.photoUrl,
            commissionRate: barber.commissionRate || 60
          }
        );

        // If registration was successful, the barber is already added to the barbers table
        if (!authError && authUser && authUser.barberId) {
          authRegistrationSuccessful = true;
          barberId = authUser.barberId;
          
          const { data: retrievedData, error: retrieveError } = await supabase
            .from('barbers')
            .select('*')
            .eq('id', authUser.barberId)
            .single();
            
          if (retrieveError) throw retrieveError;
          
          // Map the database format to our application format
          return {
            id: retrievedData.id,
            name: retrievedData.name,
            email: retrievedData.email,
            phone: retrievedData.phone || undefined,
            age: retrievedData.age || undefined,
            specialty: retrievedData.specialty || undefined,
            bio: retrievedData.bio || undefined,
            photoUrl: retrievedData.photo_url || undefined,
            joinDate: retrievedData.join_date,
            totalCuts: retrievedData.total_cuts,
            appointmentCuts: retrievedData.appointment_cuts,
            walkInCuts: retrievedData.walk_in_cuts,
            commissionRate: retrievedData.commission_rate,
            totalCommission: retrievedData.total_commission,
            active: retrievedData.active,
            rating: retrievedData.rating || undefined,
          };
        }
      } catch (authRegError) {
        // Log the error but continue to create the barber record
        console.warn('Auth registration failed but proceeding with barber creation:', authRegError);
        // We'll still create the barber record below
      }
    }
    
    // If we don't have email/password or auth registration failed, fall back to just creating a barber record
    const { data, error } = await supabase
      .from('barbers')
      .insert([
        {
          name: barber.name,
          email: barber.email,
          phone: barber.phone,
          age: barber.age,
          specialty: barber.specialty,
          bio: barber.bio,
          photo_url: barber.photoUrl,
          join_date: barber.joinDate || new Date().toISOString(),
          total_cuts: barber.totalCuts || 0,
          appointment_cuts: barber.appointmentCuts || 0,
          walk_in_cuts: barber.walkInCuts || 0,
          commission_rate: barber.commissionRate || 60,
          total_commission: barber.totalCommission || 0,
          active: barber.active !== undefined ? barber.active : true,
          rating: barber.rating,
          // Store the password in the barbers table when auth registration fails
          password: barber.password
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      age: data.age || undefined,
      specialty: data.specialty || undefined,
      bio: data.bio || undefined,
      photoUrl: data.photo_url || undefined,
      joinDate: data.join_date,
      totalCuts: data.total_cuts,
      appointmentCuts: data.appointment_cuts,
      walkInCuts: data.walk_in_cuts,
      commissionRate: data.commission_rate,
      totalCommission: data.total_commission,
      active: data.active,
      rating: data.rating || undefined,
    };
  } catch (error) {
    console.error('Error creating barber:', error);
    throw error;
  }
};

// Update a barber
export const updateBarber = async (barberId: string, updates: Partial<Barber>): Promise<Barber> => {
  try {
    // Map our application format to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.specialty !== undefined) dbUpdates.specialty = updates.specialty;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
    if (updates.joinDate !== undefined) dbUpdates.join_date = updates.joinDate;
    if (updates.totalCuts !== undefined) dbUpdates.total_cuts = updates.totalCuts;
    if (updates.appointmentCuts !== undefined) dbUpdates.appointment_cuts = updates.appointmentCuts;
    if (updates.walkInCuts !== undefined) dbUpdates.walk_in_cuts = updates.walkInCuts;
    if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;
    if (updates.totalCommission !== undefined) dbUpdates.total_commission = updates.totalCommission;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    
    const { data, error } = await supabase
      .from('barbers')
      .update(dbUpdates)
      .eq('id', barberId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      age: data.age || undefined,
      specialty: data.specialty || undefined,
      bio: data.bio || undefined,
      photoUrl: data.photo_url || undefined,
      joinDate: data.join_date,
      totalCuts: data.total_cuts,
      appointmentCuts: data.appointment_cuts,
      walkInCuts: data.walk_in_cuts,
      commissionRate: data.commission_rate,
      totalCommission: data.total_commission,
      active: data.active,
      rating: data.rating || undefined,
    };
  } catch (error) {
    console.error('Error updating barber:', error);
    throw error;
  }
};

// Delete a barber (soft delete by setting active to false)
export const deleteBarber = async (barberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('barbers')
      .update({ active: false })
      .eq('id', barberId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting barber:', error);
    throw error;
  }
};

// Get barber statistics
export const getBarberStats = async (barberId: string) => {
  try {
    // FIRST: Force a refresh of the barber stats in the database
    console.log('Forcing refresh of barber statistics for ID:', barberId);
    try {
      // Call the update_barber_stats RPC function to refresh stats
      await supabase.rpc('update_barber_stats');
      console.log('Barber stats refresh triggered');
    } catch (refreshError) {
      console.warn('Error refreshing barber stats (non-critical):', refreshError);
      // Continue anyway - we'll fetch what's in the database
    }
    
    // Now fetch the freshest barber data directly from the database
    console.log('Fetching fresh barber data with updated statistics');
    const { data: freshBarberData, error: freshBarberError } = await supabase
      .from('barbers')
      .select('*')
      .eq('id', barberId)
      .single();
      
    if (freshBarberError) {
      throw freshBarberError;
    }
    
    if (!freshBarberData) {
      throw new Error(`Barber with ID ${barberId} not found`);
    }
    
    console.log('Fresh barber data retrieved:', freshBarberData);
    
    // Get daily stats for the last 7 days
    const today = new Date();
    const dailyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get appointments for this day
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('date', dateStr)
        .in('status', ['completed', 'scheduled']);
      
      if (error) throw error;
      
      const cuts = appointments?.length || 0;
      const commission = appointments?.reduce((sum, appointment) => sum + Number(appointment.commission_amount || 0), 0) || 0;
      
      dailyStats.push({
        date: dateStr,
        cuts,
        commission,
      });
    }
    
    // Get monthly stats for the last 6 months
    const monthlyStats = [];
    const currentMonth = today.getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      const month = new Date(today.getFullYear(), monthIndex, 1)
        .toLocaleString('default', { month: 'short' });
      
      const startDate = new Date(today.getFullYear(), monthIndex, 1);
      const endDate = new Date(today.getFullYear(), monthIndex + 1, 0);
      
      // Get appointments for this month
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .in('status', ['completed', 'scheduled']);
      
      if (error) throw error;
      
      const cuts = appointments?.length || 0;
      const commission = appointments?.reduce((sum, appointment) => sum + Number(appointment.commission_amount || 0), 0) || 0;
      
      monthlyStats.push({
        month,
        cuts,
        commission,
      });
    }
    
    // Use the freshly fetched statistics from the database
    // These should be accurate after our update_barber_stats call
    const totalCuts = freshBarberData.total_cuts || 0;
    const appointmentCuts = freshBarberData.appointment_cuts || 0;
    const walkInCuts = freshBarberData.walk_in_cuts || 0;
    const totalCommission = freshBarberData.total_commission || 0;
    
    // Calculate percentages safely (avoid division by zero)
    const appointmentsPercentage = totalCuts > 0 
      ? Math.round((appointmentCuts / totalCuts) * 100) 
      : 0;
      
    const walkInsPercentage = totalCuts > 0
      ? Math.round((walkInCuts / totalCuts) * 100)
      : 0;
    
    console.log('Returning barber stats:', {
      totalCuts,
      appointmentCuts,
      walkInCuts,
      totalCommission,
      appointmentsPercentage,
      walkInsPercentage
    });
    
    return {
      totalCuts,
      appointmentCuts,
      walkInCuts,
      totalCommission,
      appointmentsPercentage,
      walkInsPercentage,
      dailyStats,
      monthlyStats,
    };
  } catch (error) {
    console.error('Error getting barber stats:', error);
    throw error;
  }
};

// New function to get barbers with their ratings and recent reviews for the landing page
export const getBarbersForLandingPage = async (reviewLimit: number = 3): Promise<Barber[]> => {
  try {
    // 1. Fetch all active barbers
    const { data: barbersData, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('active', true);

    if (barbersError) throw barbersError;
    if (!barbersData) return [];

    // 2. Fetch ratings from the view and reviews for each barber
    const barbersWithDetails = await Promise.all(
      barbersData.map(async (barber) => {
        // Fetch rating details from the view
        const { data: ratingData, error: ratingError } = await supabase
          .from('barber_ratings_view')
          .select('average_rating, total_reviews')
          .eq('barber_id', barber.id)
          .single();

        if (ratingError) {
          console.warn(`Error fetching rating for barber ${barber.id}:`, ratingError.message);
        }

        // Fetch recent reviews
        const reviews = await getReviewsByBarber(barber.id, reviewLimit);

        return {
          id: barber.id,
          name: barber.name,
          email: barber.email,
          phone: barber.phone || undefined,
          age: barber.age || undefined,
          specialty: barber.specialty || undefined,
          bio: barber.bio || undefined,
          photoUrl: barber.photo_url || undefined,
          joinDate: barber.join_date,
          totalCuts: barber.total_cuts || 0, // Ensure defaults if DB returns null
          appointmentCuts: barber.appointment_cuts || 0,
          walkInCuts: barber.walk_in_cuts || 0,
          commissionRate: barber.commission_rate,
          totalCommission: barber.total_commission || 0,
          active: barber.active,
          rating: ratingData?.average_rating ? parseFloat(ratingData.average_rating.toFixed(1)) : 0, // Use average_rating from view
          // total_reviews: ratingData?.total_reviews || 0, // We can add this to Barber type if needed
          reviews: reviews || [],
        } as Barber; // Cast to Barber type
      })
    );

    return barbersWithDetails;
  } catch (error) {
    console.error('Error fetching barbers for landing page:', error);
    // If error is an object with a message property, use that, otherwise convert to string
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) ? (error as Error).message : String(error);
    throw new Error(`Failed to fetch barbers for landing page: ${errorMessage}`);
  }
};
