// Fixed version of booking-service.ts that ensures proper data mapping
import { supabase } from '../supabase/supabase';
import { Appointment, AppointmentStatus, AppointmentType, Barber } from '../types';

// Create a new appointment with fixed data mapping
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
  try {
    // Get the service details to calculate commission
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', appointment.serviceId)
      .single();
    
    if (serviceError) throw serviceError;
    
    // Get the barber details to calculate commission
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .select('*')
      .eq('id', appointment.barberId)
      .single();
    
    if (barberError) throw barberError;
    
    // Calculate commission amount - ensure we don't get NaN
    const price = appointment.price || service.price || 0;
    const commissionRate = barber.commission_rate || 25; // Default to 25% if not set
    const commissionAmount = parseFloat((price * (commissionRate / 100)).toFixed(2));
    
    console.log('Creating appointment with:', {
      barberId: appointment.barberId,
      serviceId: appointment.serviceId,
      price: price,
      commissionRate: commissionRate,
      calculatedCommission: commissionAmount
    });
    
    // Create the appointment payload with all fields properly mapped
    const appointmentData: any = {
      barber_id: appointment.barberId,
      service_id: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status || 'scheduled',
      type: appointment.type || 'appointment',
      duration: appointment.duration || service.duration || 30,
      price: price,
      commission_amount: commissionAmount,
      notes: appointment.notes || null,
    };
    
    // Only include client_id if it's not a walk-in or if it's a valid ID
    if (appointment.type === 'walk-in') {
      appointmentData.walk_in_client_name = appointment.walkInClientName || 'Walk-in Client';
    } else if (appointment.clientId && appointment.clientId.trim()) { 
      appointmentData.client_id = appointment.clientId;
    }
    
    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
    
    // If it's a client appointment, update client's visit count
    if (appointment.clientId && appointment.clientId.trim()) {
      try {
        await supabase.rpc('increment_client_visits', {
          client_id: appointment.clientId
        });
      } catch (err) {
        console.error('Error updating client visits:', err);
        // Continue - this shouldn't block appointment creation
      }
    }
    
    // Map the DB response to our application format
    return {
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
      price: data.price || 0,
      commissionAmount: data.commission_amount || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      walkInClientName: data.walk_in_client_name,
    };
  } catch (error) {
    console.error('Error in createAppointment:', error);
    throw error;
  }
};

// Get all barbers with their current stats
export const getAllBarbersWithStats = async (): Promise<Barber[]> => {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching barbers with stats:', error);
      throw error;
    }
    
    // Force the stats to update first
    try {
      await supabase.rpc('update_barber_stats');
    } catch (err) {
      console.warn('Error updating barber stats:', err);
    }
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      specialty: item.specialty || '',
      photoUrl: item.photo_url || '',
      joinDate: item.join_date || new Date().toISOString().split('T')[0],
      totalCuts: item.total_cuts || 0,
      appointmentCuts: item.appointment_cuts || 0,
      walkInCuts: item.walk_in_cuts || 0,
      commissionRate: item.commission_rate || 25,
      totalCommission: item.total_commission || 0,
      active: item.active === undefined ? true : item.active,
      rating: item.rating || 5,
    }));
  } catch (error) {
    console.error('Error in getAllBarbersWithStats:', error);
    throw error;
  }
};
