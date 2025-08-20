import { supabase } from '../supabase/supabase';
import { Client } from '../types';

// Get all clients with their dynamic visit counts
export const getAllClients = async (): Promise<Client[]> => {
  try {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (clientsError) throw clientsError;

    const clientsWithVisits = await Promise.all(
      clientsData.map(async (client) => {
        const { count, error: countError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('status', 'completed'); // Both walk-in and appointment types are included since we only filter by status

        if (countError) {
          console.error(`Error fetching appointment count for client ${client.id}:`, countError);
          return { ...client, total_visits: 0 };
        }

        return { ...client, total_visits: count ?? 0 };
      })
    );

    return clientsWithVisits.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email || undefined,
      phone: item.phone || undefined,
      totalVisits: item.total_visits,
      lastVisit: item.last_visit,
      preferredBarberId: item.preferred_barber_id || undefined,
      notes: item.notes || undefined,
    }));
  } catch (error) {
    console.error('Error fetching clients with visit counts:', error);
    throw error;
  }
};

// Get a client by ID with its dynamic visit count
export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;
    if (!clientData) return null;

    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'completed'); // Both walk-in and appointment types are included since we only filter by status

    if (countError) {
      console.error(`Error fetching appointment count for client ${clientId}:`, countError);
    }

    return {
      id: clientData.id,
      name: clientData.name,
      email: clientData.email || undefined,
      phone: clientData.phone || undefined,
      totalVisits: count ?? 0,
      lastVisit: clientData.last_visit,
      preferredBarberId: clientData.preferred_barber_id || undefined,
      notes: clientData.notes || undefined,
    };
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    throw error;
  }
};

// Create a new client
export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          name: client.name,
          email: client.email,
          phone: client.phone,
          total_visits: client.totalVisits || 0,
          last_visit: client.lastVisit,
          preferred_barber_id: client.preferredBarberId,
          notes: client.notes,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      totalVisits: data.total_visits,
      lastVisit: data.last_visit,
      preferredBarberId: data.preferred_barber_id || undefined,
      notes: data.notes || undefined,
    };
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Update a client
export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client> => {
  try {
    // Map our application format to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.totalVisits !== undefined) dbUpdates.total_visits = updates.totalVisits;
    if (updates.lastVisit !== undefined) dbUpdates.last_visit = updates.lastVisit;
    if (updates.preferredBarberId !== undefined) dbUpdates.preferred_barber_id = updates.preferredBarberId;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('clients')
      .update(dbUpdates)
      .eq('id', clientId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      totalVisits: data.total_visits,
      lastVisit: data.last_visit,
      preferredBarberId: data.preferred_barber_id || undefined,
      notes: data.notes || undefined,
    };
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Delete a client
export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Increment client visit count and update last visit date
export const incrementClientVisit = async (clientId: string): Promise<void> => {
  try {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('total_visits')
      .eq('id', clientId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        total_visits: (client.total_visits || 0) + 1,
        last_visit: new Date().toISOString(),
      })
      .eq('id', clientId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error incrementing client visit:', error);
    throw error;
  }
};
