import { supabase } from '@/lib/supabase';
import { FinancialEntry } from '@/lib/types';

export const getFinancialData = async (startDate: string, endDate: string): Promise<FinancialEntry[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      price,
      commission_amount,
      status,
      services (name),
      barbers (name)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching financial data:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    date: item.date,
    serviceName: item.services.name,
    barberName: item.barbers.name,
    status: item.status,
    totalRevenue: item.price,
    barberCommission: item.commission_amount,
    shopRevenue: item.price - item.commission_amount,
  }));
};

export const getBarberFinancialData = async (
  startDate: string,
  endDate: string,
  barberId: string
): Promise<FinancialEntry[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id,
      date,
      price,
      commission_amount,
      status,
      services (name),
      barbers (name)
    `
    )
    .eq('barber_id', barberId)
    .ilike('status', 'completed')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching barber financial data:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    date: item.date,
    serviceName: item.services.name,
    barberName: item.barbers.name,
    status: item.status,
    totalRevenue: item.price,
    barberCommission: item.commission_amount,
    shopRevenue: item.price - item.commission_amount,
  }));
};
