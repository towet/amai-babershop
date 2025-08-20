import { supabase } from '../supabase/supabase';
import { supabaseAdmin } from '../supabase/supabase-admin';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a test appointment for a barber to verify dashboard functionality
 */
export const createTestAppointment = async (barberId: string, options: {
  isToday?: boolean;
  isWalkIn?: boolean;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
} = {}) => {
  try {
    // Default options
    const { isToday = true, isWalkIn = false, status = 'scheduled' } = options;
    
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Set appointment date (today or random date in the past 30 days)
    const date = isToday ? today : getRandomPastDate(30);
    
    // Create a random time (9 AM to 5 PM)
    const hour = Math.floor(Math.random() * 8) + 9;
    const minute = Math.floor(Math.random() * 4) * 15;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Create test appointment data
    const appointmentData = {
      id: uuidv4(),
      barber_id: barberId,
      client_id: isWalkIn ? null : uuidv4(), // Random UUID for client if not walk-in
      service_id: uuidv4(), // Random UUID for service
      date,
      time,
      duration: Math.floor(Math.random() * 4) * 15 + 30, // 30, 45, 60, or 75 minutes
      status,
      type: isWalkIn ? 'walk-in' : 'appointment',
      notes: `Test appointment created on ${new Date().toLocaleString()}`,
      price: Math.floor(Math.random() * 5) * 10 + 50, // Random price between 50 and 90
      commission_amount: Math.floor(Math.random() * 3) * 5 + 15, // Random commission
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      walk_in_client_name: isWalkIn ? 'Test Walk-in Client' : null,
    };
    
    // Insert appointment into database
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert(appointmentData)
      .select();
    
    if (error) {
      console.error('Error creating test appointment:', error);
      return { success: false, error };
    }
    
    console.log('Created test appointment:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in createTestAppointment:', error);
    return { success: false, error };
  }
};

/**
 * Create multiple test appointments for a barber
 */
export const createMultipleTestAppointments = async (barberId: string, count: number = 5) => {
  try {
    const results = [];
    
    // Create some appointments for today
    for (let i = 0; i < Math.min(3, count); i++) {
      const isWalkIn = i === 0; // Make first one a walk-in
      const result = await createTestAppointment(barberId, { 
        isToday: true,
        isWalkIn,
        status: i === 2 ? 'completed' : 'scheduled' // Make one completed
      });
      results.push(result);
    }
    
    // Create some appointments for past days
    for (let i = 3; i < count; i++) {
      const result = await createTestAppointment(barberId, { 
        isToday: false,
        isWalkIn: i % 3 === 0, // Make every third one a walk-in
        status: i % 2 === 0 ? 'completed' : 'cancelled' // Alternate between completed and cancelled
      });
      results.push(result);
    }
    
    return { 
      success: results.every(r => r.success), 
      data: results.map(r => r.data),
      errors: results.filter(r => !r.success).map(r => r.error)
    };
  } catch (error) {
    console.error('Error in createMultipleTestAppointments:', error);
    return { success: false, error };
  }
};

// Helper function to get a random date in the past X days
const getRandomPastDate = (daysInPast: number) => {
  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * daysInPast);
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - randomDaysAgo);
  return pastDate.toISOString().split('T')[0];
};

// Helper function to get a random date in the future X days
const getRandomFutureDate = (daysInFuture: number) => {
  const today = new Date();
  const randomDaysAhead = Math.floor(Math.random() * daysInFuture) + 1; // At least 1 day in the future
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + randomDaysAhead);
  return futureDate.toISOString().split('T')[0];
};

/**
 * Create test upcoming appointments for a barber
 */
export const createTestUpcomingAppointments = async (barberId: string, count: number = 5) => {
  try {
    const results: any[] = [];
    
    // Get some real service IDs if possible
    let serviceIds: string[] = [];
    try {
      const { data: services } = await supabaseAdmin.from('services').select('id').limit(5);
      if (services && services.length > 0) {
        serviceIds = services.map(s => s.id);
      }
    } catch (e) {
      console.log('Could not fetch real service IDs, will use random IDs');
    }
    
    // Get some real client IDs if possible
    let clientIds: string[] = [];
    try {
      const { data: clients } = await supabaseAdmin.from('clients').select('id').limit(5);
      if (clients && clients.length > 0) {
        clientIds = clients.map(c => c.id);
      }
    } catch (e) {
      console.log('Could not fetch real client IDs, will use random IDs');
    }
    
    // Create some appointments for today (later hours)
    const currentHour = new Date().getHours();
    for (let i = 0; i < Math.min(2, count); i++) {
      // Only create for hours that haven't passed yet
      const hour = Math.max(currentHour + 1, 13) + i; // Start at current hour + 1 or 1 PM
      if (hour < 21) { // Only if before closing
        const minute = Math.floor(Math.random() * 4) * 15;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const serviceId = serviceIds.length > 0 
          ? serviceIds[Math.floor(Math.random() * serviceIds.length)]
          : uuidv4();
          
        const clientId = clientIds.length > 0
          ? clientIds[Math.floor(Math.random() * clientIds.length)]
          : uuidv4();
        
        // Create test appointment data
        const appointmentData = {
          id: uuidv4(),
          barber_id: barberId,
          client_id: clientId,
          service_id: serviceId,
          date: new Date().toISOString().split('T')[0], // Today
          time,
          duration: Math.floor(Math.random() * 4) * 15 + 30, // 30, 45, 60, or 75 minutes
          status: 'scheduled',
          type: 'appointment',
          notes: `Client requested extra attention on the sides. First time client - be welcoming!`,
          price: Math.floor(Math.random() * 5) * 10 + 50, // Random price between 50 and 90
          commission_amount: Math.floor(Math.random() * 3) * 5 + 15, // Random commission
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          walk_in_client_name: null,
        };
        
        // Insert appointment into database
        const { data, error } = await supabaseAdmin
          .from('appointments')
          .insert(appointmentData)
          .select();
          
        results.push({
          success: !error,
          data: data ? data[0] : null,
          error
        });
      }
    }
    
    // Create some appointments for future days
    for (let i = 0; i < count - 2; i++) {
      const futureDate = getRandomFutureDate(14); // Random date up to 2 weeks in future
      const hour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const minute = Math.floor(Math.random() * 4) * 15;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const serviceId = serviceIds.length > 0 
        ? serviceIds[Math.floor(Math.random() * serviceIds.length)]
        : uuidv4();
        
      const clientId = clientIds.length > 0
        ? clientIds[Math.floor(Math.random() * clientIds.length)]
        : uuidv4();
      
      // Sample client notes for more realistic test data
      const clientNotes = [
        "Prefers scissor cut on top, #2 on sides.",
        "Client has a cowlick on the right side - be careful.",
        "Very particular about the neckline, likes it square.",
        "Sensitive scalp, be gentle with shampoo.",
        "Wants to try a fade this time, but not too short.",
        "Regular client, knows exactly what they want.",
        "",
        "Bringing their son too, might need to book another slot."
      ];
      
      const randomNote = clientNotes[Math.floor(Math.random() * clientNotes.length)];
      
      // Create test appointment data
      const appointmentData = {
        id: uuidv4(),
        barber_id: barberId,
        client_id: clientId,
        service_id: serviceId,
        date: futureDate,
        time,
        duration: Math.floor(Math.random() * 4) * 15 + 30, // 30, 45, 60, or 75 minutes
        status: 'scheduled',
        type: 'appointment',
        notes: randomNote,
        price: Math.floor(Math.random() * 5) * 10 + 50, // Random price between 50 and 90
        commission_amount: Math.floor(Math.random() * 3) * 5 + 15, // Random commission
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        walk_in_client_name: null,
      };
      
      // Insert appointment into database
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert(appointmentData)
        .select();
        
      results.push({
        success: !error,
        data: data ? data[0] : null,
        error
      });
    }
    
    return { 
      success: results.every(r => r.success), 
      data: results.map(r => r.data),
      errors: results.filter(r => !r.success).map(r => r.error)
    };
  } catch (error) {
    console.error('Error in createTestUpcomingAppointments:', error);
    return { success: false, error };
  }
};
