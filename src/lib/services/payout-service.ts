import { supabase } from '../supabase/supabase';

export interface Payout {
  id: string;
  created_at: string;
  amount: number;
  reason: string;
  user_id?: string;
  user_name?: string;
  barber_id?: string; // nullable until DB updated
}

/**
 * Record a new payout.
 */
export const addPayout = async (
  amount: number,
  reason: string,
  userId?: string,
  userName?: string,
  barberId?: string,
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('payouts').insert([
    {
      amount,
      reason,
      user_id: userId,
      user_name: userName,
      barber_id: barberId,
    },
  ]);

  if (error) {
    console.error('[addPayout] Error inserting payout', error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

/**
 * Fetch payouts between two dates. If barberId is provided, filter by it.
 */
export const reversePayout = async (payout: Payout, userId?: string, userName?: string) => {
  return addPayout(payout.amount, `REVERSAL of ${payout.id}`, userId, userName, payout.barber_id);
};

export const getPayouts = async (
  startDate: string,
  endDate: string,
  barberId?: string,
): Promise<Payout[]> => {
  let query = supabase
    .from('payouts')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', `${endDate}T23:59:59+00:00`)
    .order('created_at', { ascending: false });

  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[getPayouts] Error fetching payouts', error);
    return [];
  }
  return (data as any) as Payout[];
};
