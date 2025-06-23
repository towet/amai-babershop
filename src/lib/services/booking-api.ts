import { createClient } from '@supabase/supabase-js';
import { Appointment, Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Create a client with service_role key for admin operations
// WARNING: Keep this file server-side only, never expose this key to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Only create this client if the service key is available
// In a real production app, this would be a server-side function only
const adminClient = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// This function should ideally be called from a server endpoint
// For demo purposes, we're using it directly, but in production
// this should be moved to an API route or Edge Function
// Create or find a client based on email or phone number
const createOrFindClient = async (
  name: string,
  email: string,
  phone: string
): Promise<string> => {
  if (!adminClient) throw new Error('Admin client not available');
  
  try {
    // First check if client already exists by email
    let { data: existingClient } = await adminClient
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    // If not found by email, try by phone
    if (!existingClient) {
      ({ data: existingClient } = await adminClient
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .maybeSingle());
    }
    
    // If client exists, return their ID
    if (existingClient) {
      return existingClient.id;
    }
    
    // Otherwise create a new client
    // Format the client data according to database column names
    const newClientData = {
      id: uuidv4(),
      name,
      email,
      phone,
      notes: 'Created from online booking',
      total_visits: 0, // snake_case for database columns
      last_visit: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      preferred_barber_id: null
    };
    
    // Insert with admin client to bypass RLS
    const { error } = await adminClient
      .from('clients')
      .insert([newClientData]);
      
    if (error) throw error;
    
    return newClientData.id;
  } catch (error) {
    console.error('Error creating/finding client:', error);
    throw error;
  }
};

export const createPublicAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Appointment> => {
  if (!adminClient) {
    throw new Error('Admin client not available - service key missing');
  }
  
  try {
    // Extract client info from notes if available
    let clientName = appointment.walkInClientName || '';
    let clientEmail = '';
    let clientPhone = '';
    
    // Parse client info from notes
    if (appointment.notes) {
      const emailMatch = appointment.notes.match(/Email: ([^,]+)/);
      const phoneMatch = appointment.notes.match(/Phone: ([^,]+)/);
      
      if (emailMatch) clientEmail = emailMatch[1].trim();
      if (phoneMatch) clientPhone = phoneMatch[1].trim();
    }
    
    // Create or find client if we have enough info
    let clientId = appointment.clientId;
    
    if (clientName && (clientEmail || clientPhone) && (!clientId || clientId === 'guest')) {
      try {
        // Create or find client
        clientId = await createOrFindClient(clientName, clientEmail, clientPhone);
      } catch (error) {
        console.error('Failed to create client record:', error);
        // Continue with appointment creation even if client creation fails
      }
    }
    
    // Format the data for Supabase
    const appointmentData: any = {
      barber_id: appointment.barberId,
      service_id: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      duration: appointment.duration,
      price: appointment.price,
      commission_amount: appointment.commissionAmount,
      notes: appointment.notes,
      walk_in_client_name: appointment.walkInClientName
    };
    
    // Use the real client ID if we were able to create/find one
    if (clientId && clientId !== 'guest') {
      appointmentData.client_id = clientId;
    }
    
    // Use admin client to bypass RLS
    const { data, error } = await adminClient
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the created appointment
    return {
      id: data.id,
      barberId: data.barber_id,
      serviceId: data.service_id,
      clientId: data.client_id,
      date: data.date,
      time: data.time,
      status: data.status,
      type: data.type,
      duration: data.duration,
      price: data.price,
      commissionAmount: data.commission_amount,
      notes: data.notes,
      walkInClientName: data.walk_in_client_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error creating appointment with admin client:', error);
    throw error;
  }
};
