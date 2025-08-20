import { supabase } from '../supabase/supabase';
import { DashboardStats } from '../types';

// Helper function to get the start of a day
const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Helper function to get the start of a week (Sunday)
const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
  startOfWeek.setDate(startOfWeek.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// Helper function to get the end of a week (Saturday)
const getEndOfWeek = (date: Date): Date => {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

// Get today's appointments
export const getTodayAppointments = async () => {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, name),
        barbers (id, name),
        services (id, name, duration, price)
      `)
      .eq('date', todayString);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return [];
  }
};

// Get this week's appointments
export const getThisWeekAppointments = async () => {
  try {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = getEndOfWeek(today);
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching this week\'s appointments:', error);
    return [];
  }
};

// Get dashboard statistics
const getStatsForDate = async (targetDate: Date) => {
  const dateString = targetDate.toISOString().split('T')[0];
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('type, price, commission_amount') // Assuming 'price' on appointments is the final price
    .eq('date', dateString);

  if (error) {
    console.error(`Error fetching appointments for ${dateString}:`, error);
    return { count: 0, walkIns: 0, revenue: 0 };
  }

  const scheduled = appointments.filter(app => app.type === 'appointment');
  const walkIns = appointments.filter(app => app.type === 'walk-in');
  // Ensure price is a number, default to 0 if null or undefined
  const totalRevenue = appointments.reduce((sum, app) => sum + (Number(app.price) || 0), 0);
  const totalCommission = appointments.reduce((sum, app) => sum + (Number(app.commission_amount) || 0), 0);
  const shopRevenue = totalRevenue - totalCommission;
  
  return {
    count: scheduled.length,
    walkIns: walkIns.length,
    revenue: totalRevenue,
    shopRevenue: shopRevenue,
    barberCommission: totalCommission,
  };
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get today's appointments
    const todayAppointments = await getTodayAppointments();
    
    // Get this week's appointments
    const thisWeekAppointments = await getThisWeekAppointments();
    
    // Calculate statistics
    const todayScheduled = todayAppointments.filter(app => app.type === 'appointment');
    const todayWalkIns = todayAppointments.filter(app => app.type === 'walk-in');
    const todayRevenue = todayAppointments.reduce((sum, app) => sum + Number(app.price), 0);
    
    const weekScheduled = thisWeekAppointments.filter(app => app.type === 'appointment');
    const weekWalkIns = thisWeekAppointments.filter(app => app.type === 'walk-in');
    const weekRevenue = thisWeekAppointments.reduce((sum, app) => sum + Number(app.price), 0);
    
    const totalVisits = weekScheduled.length + weekWalkIns.length;
    const appointmentsPercentage = totalVisits > 0 ? Math.round((weekScheduled.length / totalVisits) * 100) : 0;
    const walkInsPercentage = totalVisits > 0 ? Math.round((weekWalkIns.length / totalVisits) * 100) : 0;
    
    // Get top barber
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('id, name, total_cuts')
      .order('total_cuts', { ascending: false })
      .limit(1);
    
    if (barbersError) throw barbersError;
    
    // Get top service
    // First, get a count of services
    const { data: topServices, error: servicesError } = await supabase
      .from('appointments')
      .select('service_id')
      .gte('date', getStartOfWeek(new Date()).toISOString().split('T')[0]);
    
    if (servicesError) {
      console.error('Error fetching top services:', servicesError);
      // Allow function to proceed with empty topService if this fails
    }
    
    // Count service occurrences
    const serviceCounts: { [key: string]: number } = {};
    topServices.forEach(app => {
      serviceCounts[app.service_id] = (serviceCounts[app.service_id] || 0) + 1;
    });
    
    // Find the service with the most occurrences
    let topServiceId = '';
    let topServiceCount = 0;
    
    for (const [serviceId, count] of Object.entries(serviceCounts)) {
      if (count > topServiceCount) {
        topServiceId = serviceId;
        topServiceCount = count;
      }
    }
    
    // Get service details for the top service
    let topServiceName = '';
    if (topServiceId) {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('name')
        .eq('id', topServiceId)
        .single();
      
      if (!serviceError && serviceData) {
        topServiceName = serviceData.name;
      } else if (serviceError) {
        console.error('Error fetching service details for top service:', serviceError);
      }
    }
    
    // Calculate stats for yesterday for trend calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStats = await getStatsForDate(yesterday);

    // Calculate trends (avoid division by zero)
    const appointmentsTodayTrend = yesterdayStats.count > 0 
      ? Math.round(((todayScheduled.length - yesterdayStats.count) / yesterdayStats.count) * 100) 
      : (todayScheduled.length > 0 ? 100 : 0);
    const walkInsTodayTrend = yesterdayStats.walkIns > 0 
      ? Math.round(((todayWalkIns.length - yesterdayStats.walkIns) / yesterdayStats.walkIns) * 100) 
      : (todayWalkIns.length > 0 ? 100 : 0);
    const revenueTodayTrend = yesterdayStats.revenue > 0 
      ? Math.round(((todayRevenue - yesterdayStats.revenue) / yesterdayStats.revenue) * 100) 
      : (todayRevenue > 0 ? 100 : 0);

    // Optimize chart data generation - use batch query instead of individual calls
    const weeklyRevenueData = [];
    const weeklyAppointmentsData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Reduce from 90 to 30 days and use batch query for better performance
    const daysToGenerate = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToGenerate + 1);
    const endDate = new Date();
    
    // Batch fetch all appointments for the date range
    const { data: batchAppointments, error: batchError } = await supabase
      .from('appointments')
      .select('date, type, price, commission_amount')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);
    
    if (batchError) {
      console.error('Error fetching batch appointments for charts:', batchError);
    }
    
    // Process batch data into daily stats
    const dailyStatsMap = new Map();
    if (batchAppointments) {
      batchAppointments.forEach(app => {
        const date = app.date;
        if (!dailyStatsMap.has(date)) {
          dailyStatsMap.set(date, { count: 0, walkIns: 0, revenue: 0, commission: 0 });
        }
        const stats = dailyStatsMap.get(date);
        if (app.type === 'appointment') stats.count++;
        if (app.type === 'walk-in') stats.walkIns++;
        stats.revenue += Number(app.price) || 0;
        stats.commission += Number(app.commission_amount) || 0;
      });
    }
    
    // Generate chart data from processed stats
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayName = dayNames[day.getDay()];
      const dateKey = day.toISOString().split('T')[0];
      const dayStats = dailyStatsMap.get(dateKey) || { count: 0, walkIns: 0, revenue: 0, commission: 0 };
      const shopRevenue = dayStats.revenue - dayStats.commission;

      weeklyRevenueData.push({
        name: dayName,
        date: dateKey,
        shopRevenue: shopRevenue,
        barberCommission: dayStats.commission,
      });
      weeklyAppointmentsData.push({
        name: dayName,
        date: dateKey,
        value: dayStats.count + dayStats.walkIns
      });
    }

    return {
      totalAppointmentsToday: todayScheduled.length,
      totalWalkInsToday: todayWalkIns.length,
      totalRevenueToday: todayRevenue,
      totalAppointmentsThisWeek: weekScheduled.length,
      totalWalkInsThisWeek: weekWalkIns.length,
      totalRevenueThisWeek: weekRevenue,
      appointmentsPercentage,
      walkInsPercentage,
      topBarber: {
        id: barbers && barbers.length > 0 ? barbers[0].id : '',
        name: barbers && barbers.length > 0 ? barbers[0].name : '',
        totalCuts: barbers && barbers.length > 0 ? barbers[0].total_cuts : 0,
      },
      topService: {
        id: topServiceId,
        name: topServiceName,
        count: topServiceCount,
      },
      weeklyRevenueData,
      weeklyAppointmentsData,
      appointmentsTodayTrend,
      walkInsTodayTrend,
      revenueTodayTrend,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};
