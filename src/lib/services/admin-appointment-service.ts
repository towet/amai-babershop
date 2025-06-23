import { supabaseAdmin } from '@/lib/supabase/supabase-admin';
import { Appointment, AppointmentWithDetails } from '@/lib/types';

// Get all appointments for a specific barber with admin privileges (bypassing RLS)
export const getBarberAppointmentsAdmin = async (barberId: string): Promise<Appointment[]> => {
  try {
    console.log('Admin service: Fetching appointments for barber ID:', barberId);
    
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Admin service: Error fetching barber appointments:', error);
      throw error;
    }
    
    console.log(`Admin service: Found ${data?.length || 0} appointments for barber ID ${barberId}`);
    
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
    console.error('Admin service: Error fetching barber appointments:', error);
    throw error;
  }
};

// Get all upcoming appointments for a barber with full details using admin privileges
export const getUpcomingBarberAppointmentsAdmin = async (barberId: string): Promise<AppointmentWithDetails[]> => {
  try {
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    console.log(`Admin service: Getting upcoming appointments for barber ID ${barberId} from date ${today} onwards`);
    
    const { data, error } = await supabaseAdmin
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
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Admin service: Error fetching upcoming barber appointments:', error);
      throw error;
    }
    
    console.log(`Admin service: Found ${data?.length || 0} upcoming appointments for barber ID ${barberId}`);
    
    // Map the database format to our detailed application format
    return data.map(mapAppointmentWithDetails);
  } catch (error) {
    console.error('Admin service: Error fetching upcoming barber appointments:', error);
    throw error;
  }
};

// Helper function to map database format to detailed application format
const mapAppointmentWithDetails = (data: any): AppointmentWithDetails => {
  const appointment = {
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
    price: data.price || (data.total_amount !== undefined ? data.total_amount : 0),
    commissionAmount: data.commission_amount || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
    walkInClientName: data.walk_in_client_name,
  };
  
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
