import { supabase } from '../supabase/supabase';
import { Service } from '../types';

// Get all services
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Map the database format to our application format
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      duration: item.duration,
      price: item.price,
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Get a service by ID
export const getServiceById = async (serviceId: string): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      duration: data.duration,
      price: data.price,
    };
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    throw error;
  }
};

// Create a new service
export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      duration: data.duration,
      price: data.price,
    };
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Update a service
export const updateService = async (serviceId: string, updates: Partial<Service>): Promise<Service> => {
  try {
    // Map our application format to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    
    const { data, error } = await supabase
      .from('services')
      .update(dbUpdates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database format to our application format
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      duration: data.duration,
      price: data.price,
    };
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Delete a service
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
