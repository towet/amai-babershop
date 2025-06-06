import { supabase } from '../supabase/supabase';
import { Appointment, Barber } from '../types';
import { incrementClientVisit } from './client-service'; // Added import
import { getBarberById as fetchBarberById } from './barber-service';

// Interface for barber availability
export interface BarberAvailability {
  barberId: string;
  name: string;
  photoUrl?: string;
  specialty?: string;
  rating?: number;
  availableTimeSlots: { [date: string]: string[] };
}

// Working hours: 10:00 to 22:00
const WORKING_HOURS = {
  start: 10,
  end: 22,
};

// Generate all possible time slots for a day (every 30 minutes)
export const generateAllTimeSlots = (): string[] => {
  const slots = [];
  for (let i = WORKING_HOURS.start; i <= WORKING_HOURS.end; i++) {
    slots.push(`${i}:00`);
    if (i < WORKING_HOURS.end) slots.push(`${i}:30`);
  }
  return slots;
};

// Get all available time slots for a specific barber on a specific date
export const getBarberAvailabilityForDate = async (barberId: string, date: string): Promise<string[]> => {
  try {
    // Get all possible time slots
    const allTimeSlots = generateAllTimeSlots();
    
    // Get all appointments for the barber on the specified date
    const { data: barberAppointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', date)
      .eq('status', 'scheduled'); // Only scheduled appointments block time slots
    
    if (error) throw error;
    
    // Remove time slots that are already booked
    const bookedTimeSlots = barberAppointments.map((appointment) => appointment.time);
    
    // Return available time slots
    return allTimeSlots.filter((slot) => !bookedTimeSlots.includes(slot));
  } catch (error) {
    console.error('Error getting barber availability:', error);
    return [];
  }
};

// Get availability for all barbers for the next 14 days
export const getAllBarbersAvailability = async (): Promise<BarberAvailability[]> => {
  try {
    // Get all active barbers
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('active', true);
    
    if (barbersError) throw barbersError;
    
    // Get dates for the next 14 days
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Get availability for each barber
    const availabilityPromises = barbers.map(async (barber) => {
      const availableTimeSlots: { [date: string]: string[] } = {};
      
      for (const date of dates) {
        availableTimeSlots[date] = await getBarberAvailabilityForDate(barber.id, date);
      }
      
      return {
        barberId: barber.id,
        name: barber.name,
        photoUrl: barber.photo_url,
        specialty: barber.specialty,
        rating: barber.rating,
        availableTimeSlots,
      };
    });
    
    return Promise.all(availabilityPromises);
  } catch (error) {
    console.error('Error getting all barbers availability:', error);
    return [];
  }
};

// Get available time slots for a specific barber on a specific date
export const getAvailableTimeSlotsForBarber = async (barberId: string, date: string): Promise<string[]> => {
  return getBarberAvailabilityForDate(barberId, date);
};

// Get all barbers with at least one available time slot on the given date
export const getAvailableBarbersForDate = async (date: string): Promise<Barber[]> => {
  try {
    // Get all active barbers
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .eq('active', true);
    
    if (barbersError) throw barbersError;
    
    // Filter barbers with available time slots
    const availableBarbers = [];
    for (const barber of barbers) {
      const availableSlots = await getBarberAvailabilityForDate(barber.id, date);
      if (availableSlots.length > 0) {
        availableBarbers.push({
          id: barber.id,
          name: barber.name,
          email: barber.email,
          phone: barber.phone || undefined,
          age: barber.age || undefined,
          specialty: barber.specialty || undefined,
          bio: barber.bio || undefined,
          photoUrl: barber.photo_url || undefined,
          joinDate: barber.join_date,
          totalCuts: barber.total_cuts,
          appointmentCuts: barber.appointment_cuts,
          walkInCuts: barber.walk_in_cuts,
          commissionRate: barber.commission_rate,
          totalCommission: barber.total_commission,
          active: barber.active,
          rating: barber.rating || undefined,
        });
      }
    }
    
    return availableBarbers;
  } catch (error) {
    console.error('Error getting available barbers for date:', error);
    return [];
  }
};

// Create a new appointment
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
    
    // Calculate commission amount
    const commissionAmount = service.price * (barber.commission_rate / 100);
    
    // Create the appointment payload
    const appointmentData: any = {
      barber_id: appointment.barberId,
      service_id: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      duration: appointment.duration || service.duration,
      price: appointment.price || service.price,
      commission_amount: appointment.commissionAmount || commissionAmount,
      notes: appointment.notes
    };
    
    // Only include client_id if it's not a walk-in or if it's a valid UUID
    if (appointment.type === 'walk-in') {
      appointmentData.walk_in_client_name = appointment.walkInClientName;
    } else if (appointment.clientId && appointment.clientId.length > 10) { 
      // Simple validation to ensure it's not a mock ID - UUID should be much longer
      appointmentData.client_id = appointment.clientId;
    }
    
    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    
    // If it's a client appointment, update client's visit count
    if (appointment.clientId) {
      try {
        await supabase
          .from('clients')
          .update({
            total_visits: supabase.rpc('increment', { x: 1 }),
            last_visit: new Date().toISOString()
          })
          .eq('id', appointment.clientId);
      } catch (clientError) {
        console.error('Error updating client visit count:', clientError);
        // Continue anyway, the appointment was created
      }
    }
    
    // Update barber's cuts count
    try {
      if (appointment.type === 'appointment') {
        await supabase
          .from('barbers')
          .update({
            total_cuts: supabase.rpc('increment', { x: 1 }),
            appointment_cuts: supabase.rpc('increment', { x: 1 }),
            total_commission: supabase.rpc('add', { x: commissionAmount })
          })
          .eq('id', appointment.barberId);
      } else {
        await supabase
          .from('barbers')
          .update({
            total_cuts: supabase.rpc('increment', { x: 1 }),
            walk_in_cuts: supabase.rpc('increment', { x: 1 }),
            total_commission: supabase.rpc('add', { x: commissionAmount })
          })
          .eq('id', appointment.barberId);
      }
    } catch (barberError) {
      console.error('Error updating barber cuts count:', barberError);
      // Continue anyway, the appointment was created
    }
    
    // Return the created appointment
    return {
      id: data.id,
      clientId: data.client_id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      date: data.date,
      time: data.time,
      status: data.status,
      type: data.type,
      duration: data.duration,
      price: data.price,
      commissionAmount: data.commission_amount,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      walkInClientName: data.walk_in_client_name
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      barberId: item.barber_id,
      serviceId: item.service_id,
      date: item.date,
      time: item.time,
      status: item.status,
      type: item.type,
      duration: item.duration,
      price: item.price,
      commissionAmount: item.commission_amount,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      walkInClientName: item.walk_in_client_name
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      date: data.date,
      time: data.time,
      status: data.status,
      type: data.type,
      duration: data.duration,
      price: data.price,
      commissionAmount: data.commission_amount,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      walkInClientName: data.walk_in_client_name
    };
  } catch (error) {
    console.error('Error fetching appointment by ID:', error);
    return null;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: string, clientId?: string | null): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);
    
    if (error) throw error;

    // If status is completed and clientId is valid, increment client's visit count
    if (status === 'completed' && clientId && clientId !== 'guest') {
      try {
        await incrementClientVisit(clientId);
      } catch (clientError) {
        console.error(`Failed to increment visit count for client ${clientId}:`, clientError);
        // Optionally, decide if this error should be thrown or just logged
      }
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Update appointment
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> => {
  try {
    // Map our application format to database format
    const dbUpdates: any = {};
    
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.barberId !== undefined) dbUpdates.barber_id = updates.barberId;
    if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.commissionAmount !== undefined) dbUpdates.commission_amount = updates.commissionAmount;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.walkInClientName !== undefined) dbUpdates.walk_in_client_name = updates.walkInClientName;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('appointments')
      .update(dbUpdates)
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      date: data.date,
      time: data.time,
      status: data.status,
      type: data.type,
      duration: data.duration,
      price: data.price,
      commissionAmount: data.commission_amount,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      walkInClientName: data.walk_in_client_name
    };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Get appointments by client ID
export const getAppointmentsByClientId = async (clientId: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name), barbers(name)')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;

    return data.map(appointment => ({
      id: appointment.id,
      barberId: appointment.barber_id,
      barberName: appointment.barbers?.name || 'N/A',
      clientId: appointment.client_id,
      // clientName: appointment.clients?.name, // Assuming you might add client name join later
      serviceId: appointment.service_id,
      serviceName: appointment.services?.name || 'N/A',
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      duration: appointment.duration,
      price: appointment.price,
      commissionAmount: appointment.commission_amount,
      notes: appointment.notes,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
      walkInClientName: appointment.walk_in_client_name
    }));
  } catch (error) {
    console.error('Error fetching appointments by client ID:', error);
    throw error;
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};
