import { supabase } from '../supabase/supabase';
import { Appointment, AppointmentStatus, AppointmentType, AppointmentWithDetails } from '../types';
import { withSupabaseRetry } from '../utils/retry';
import { handleSupabaseError, ServiceUnavailableError } from '../utils/errorHandler';

// Get all appointments with error handling
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const data = await withSupabaseRetry(async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });
      
      if (error) handleSupabaseError(error, 'Get all appointments');
      return data || [];
    }, 'Get all appointments');
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      barberId: item.barber_id,
      serviceId: item.service_id,
      date: item.date,
      time: item.time,
      duration: item.duration,
      status: item.status,
      type: item.type,
      notes: item.notes || undefined,
      price: item.price || 0,
      commissionAmount: item.commission_amount || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      walkInClientName: item.walk_in_client_name,
    }));
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      console.warn('Database unavailable, returning empty appointments list');
      return [];
    }
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Get appointments for a specific barber
export const getBarberAppointments = async (barberId: string): Promise<Appointment[]> => {
  try {
    console.log('Fetching all appointments for barber ID:', barberId);
    
    // First check if the barber exists
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('id, name, email')
      .eq('id', barberId)
      .single();
    
    if (barberError) {
      console.error('Error checking barber existence:', barberError);
      // Try to find barber by email if ID doesn't work
      const { data: barberByEmail, error: emailError } = await supabase
        .from('barbers')
        .select('id, name, email')
        .eq('email', 'farad@amaimenscare.com')
        .single();
        
      if (!emailError && barberByEmail) {
        console.log('Found barber by email instead:', barberByEmail);
        barberId = barberByEmail.id; // Use this ID instead
      }
    } else {
      console.log('Confirmed barber exists:', barberData);
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId)
      .order('date', { ascending: false })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Error fetching barber appointments:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} total appointments for barber ID ${barberId}`);
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      barberId: item.barber_id,
      serviceId: item.service_id,
      date: item.date,
      time: item.time,
      duration: item.duration,
      status: item.status,
      type: item.type,
      notes: item.notes || undefined,
      price: item.price || 0,
      commissionAmount: item.commission_amount || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      walkInClientName: item.walk_in_client_name,
    }));
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    throw error;
  }
};

// Get all appointments for a specific barber (for statistics and dashboard) with pagination
export const getAllBarberAppointments = async (barberId: string, limit: number = 50, offset: number = 0): Promise<Appointment[]> => {
  try {
    console.log('Fetching appointments for barber ID:', barberId, 'with pagination limit:', limit, 'offset:', offset);
    
    if (!barberId) {
      console.error('No barber ID provided to getAllBarberAppointments');
      return [];
    }
    
    const data = await withSupabaseRetry(async () => {
      // Find appointments for the barber with pagination to improve performance
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name, price), clients(name, email, phone)')
        .eq('barber_id', barberId)
        .order('date', { ascending: false })
        .order('time', { ascending: true })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, `Get barber appointments for ${barberId}`);
      }
      
      return data || [];
    }, `Get barber appointments for ${barberId}`);
    
    console.log(`Found ${data?.length || 0} total appointments for barber ID ${barberId}`);
    
    // If no appointments found, check if this barber exists
    if (!data || data.length === 0) {
      console.log('No appointments found for this barber, verifying barber exists');
      
      // Check if the barber exists in the database
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('id, name, email, specialty')
        .eq('id', barberId)
        .single();
      
      if (barberError) {
        console.error('Error verifying barber existence:', barberError);
      } else if (barberData) {
        console.log('Barber exists but has no appointments:', barberData);
        
        // NOTE: We do NOT automatically assign appointments to barbers based on specialty
        // This is strictly a manager responsibility
        
        // For debugging purposes only, we can log if there are unassigned appointments
        // that might be relevant to this barber's specialty, but we won't auto-assign them
        if (barberData.specialty) {
          console.log('Barber specialty:', barberData.specialty);
          
          const { count: unassignedCount, error: countError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .is('barber_id', null);
          
          if (countError) {
            console.error('Error checking unassigned appointments:', countError);
          } else if (unassignedCount && unassignedCount > 0) {
            console.log(`Found ${unassignedCount} unassigned appointments in the system`);
            console.log('NOTE: Only managers can assign these appointments to barbers');
          }
        }
      }
    }
    
    return data.map(item => mapAppointment(item));
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      console.warn('Database unavailable, returning empty appointments list for barber:', barberId);
      return [];
    }
    console.error('Error fetching all barber appointments:', error);
    throw error;
  }
};

// Get today's appointments for a specific barber
export const getTodaysAppointments = async (barberId: string): Promise<Appointment[]> => {
  try {
    console.log('Fetching today\'s appointments for barber ID:', barberId);
    
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    console.log('Today\'s date for appointment lookup:', today);
    
    // First try to find appointments directly with the barber_id
    let { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', today)
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments by barber_id:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} appointments for barber ID ${barberId}`);
    
    // If no appointments found, try querying all appointments for debugging
    if (data.length === 0) {
      console.log('No appointments found with exact match, trying to find any appointments for today');
      
      // Check if there are any appointments at all for today
      const { data: allAppointments, error: allError } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', today);
        
      if (!allError && allAppointments.length > 0) {
        console.log(`Found ${allAppointments.length} total appointments for today:`, 
          allAppointments.map(a => ({ id: a.id, barber_id: a.barber_id })));
      } else {
        console.log('No appointments found for today at all');
      }
      
      // Now check all barbers to confirm barber ID exists
      const { data: barbers, error: barberError } = await supabase
        .from('barbers')
        .select('id, name, email');
        
      if (!barberError) {
        console.log('Available barbers:', barbers);
        const matchingBarber = barbers.find(b => b.id === barberId);
        console.log('Matching barber for ID:', matchingBarber);
      }
    }
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      barberId: item.barber_id,
      serviceId: item.service_id,
      date: item.date,
      time: item.time,
      duration: item.duration,
      status: item.status,
      type: item.type,
      notes: item.notes || undefined,
      price: item.price || 0,
      commissionAmount: item.commission_amount || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      walkInClientName: item.walk_in_client_name,
    }));
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

// This function is declared later in the file

// Get appointment by ID
export const getAppointmentById = async (appointmentId: string): Promise<Appointment> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }

    // Map the database format to our application format
    return {
      id: data.id,
      clientId: data.client_id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status,
      type: data.type,
      notes: data.notes || undefined,
      price: data.price || 0,
      commissionAmount: data.commission_amount || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
      walkInClientName: data.walk_in_client_name,
    };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: string
): Promise<Appointment> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      clientId: data.client_id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status,
      type: data.type,
      notes: data.notes || undefined,
      price: data.price || data.total_amount,
      commissionAmount: data.commission_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Helper function to map database format to application format
const mapAppointment = (data: any): Appointment => ({
  id: data.id,
  clientId: data.client_id,
  barberId: data.barber_id,
  serviceId: data.service_id,
  date: data.date,
  time: data.time,
  duration: data.duration,
  status: data.status as AppointmentStatus,
  type: data.type as AppointmentType,
  notes: data.notes || undefined,
  // Handle both price and legacy total_amount field
  price: data.price || (data.total_amount !== undefined ? data.total_amount : 0),
  commissionAmount: data.commission_amount || 0,
  createdAt: data.created_at,
  updatedAt: data.updated_at || data.created_at,
  walkInClientName: data.walk_in_client_name,
});

// Helper function to map database format to detailed application format
const mapAppointmentWithDetails = (data: any): AppointmentWithDetails => {
  const appointment = mapAppointment(data);
  
  return {
    ...appointment,
    client: data.clients ? {
      id: data.clients.id,
      name: data.clients.name,
      email: data.clients.email,
      phone: data.clients.phone,
      totalVisits: data.clients.total_visits,
      lastVisit: data.clients.last_visit,
      preferredBarberId: data.clients.preferred_barber_id,
      notes: data.clients.notes,
    } : undefined,
    barber: data.barbers ? {
      id: data.barbers.id,
      name: data.barbers.name,
      email: data.barbers.email,
      phone: data.barbers.phone,
      specialty: data.barbers.specialty,
      photoUrl: data.barbers.photo_url,
      joinDate: data.barbers.join_date,
      totalCuts: data.barbers.total_cuts || 0,
      appointmentCuts: data.barbers.appointment_cuts || 0,
      walkInCuts: data.barbers.walk_in_cuts || 0,
      commissionRate: data.barbers.commission_rate,
      totalCommission: data.barbers.total_commission || 0,
      active: data.barbers.active,
      rating: data.barbers.rating,
    } : undefined,
    service: data.services ? {
      id: data.services.id,
      name: data.services.name,
      description: data.services.description,
      duration: data.services.duration,
      price: data.services.price,
    } : undefined,
  };
};

// Get today's appointments with full details for a specific barber
export const getTodaysAppointmentsWithDetails = async (barberId: string): Promise<AppointmentWithDetails[]> => {
  try {
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        barbers:barber_id(*),
        services:service_id(*)
      `)
      .eq('barber_id', barberId)
      .eq('date', today)
      .order('time', { ascending: true });
    
    if (error) throw error;
    
    // Map the database format to our detailed application format
    return data.map(mapAppointmentWithDetails);
  } catch (error) {
    console.error('Error fetching detailed appointments:', error);
    throw error;
  }
};

// Get appointment by ID with full details
export const getAppointmentByIdWithDetails = async (appointmentId: string): Promise<AppointmentWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        barbers:barber_id(*),
        services:service_id(*)
      `)
      .eq('id', appointmentId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Map the database format to our detailed application format
    return mapAppointmentWithDetails(data);
  } catch (error) {
    console.error('Error fetching detailed appointment:', error);
    throw error;
  }
};

// Get all upcoming appointments for a barber with full details (optimized with limit)
export const getUpcomingBarberAppointments = async (barberId: string, limit: number = 20): Promise<AppointmentWithDetails[]> => {
  try {
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    console.log(`Getting upcoming appointments for barber ID ${barberId} from date ${today} onwards with limit ${limit}`);
    
    // Skip the debug query to reduce database load
    // Only fetch what we need with proper limits
    
    // Get the appointments with proper filtering, ordering, and limits
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        barbers:barber_id(*),
        services:service_id(*)
      `)
      .eq('barber_id', barberId)
      .gte('date', today) // Greater than or equal to today's date
      .neq('status', 'cancelled') // Exclude cancelled appointments
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit); // Add limit to prevent excessive data fetching
    
    if (error) {
      console.error('Error fetching upcoming barber appointments:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} upcoming active appointments for barber ID ${barberId}`);
    
    // Map the database format to our detailed application format
    const mappedAppointments = data.map(mapAppointmentWithDetails);
    
    // Debug: Check the first few appointments after mapping
    if (mappedAppointments.length > 0) {
      console.log('First few mapped appointments:', 
        mappedAppointments.slice(0, 3).map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          status: a.status,
          clientName: a.client?.name || a.walkInClientName || 'Unknown',
          serviceName: a.service?.name || 'Unknown service'
        }))
      );
    }
    
    return mappedAppointments;
  } catch (error) {
    console.error('Error fetching upcoming barber appointments:', error);
    throw error;
  }
};
