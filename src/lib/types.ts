// Common data types for the admin dashboard

export type UserRole = 'manager' | 'barber';

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface Review {
  id: string;
  barberId: string; // Foreign key to barbers table
  rating: number; // 1-5 stars
  comment: string;
  clientName: string;
  clientEmail?: string;
  approved: boolean;
  createdAt: string;
}

export interface ReviewSubmission {
  barberId: string;
  rating: number;
  comment: string;
  clientName: string;
  clientEmail?: string;
  // 'approved' will be defaulted by DB or handled by admin
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  specialty?: string;
  bio?: string;
  photoUrl?: string;
  joinDate: string;
  totalCuts: number;
  appointmentCuts: number;
  walkInCuts: number;
  commissionRate: number; // as percentage
  totalCommission: number;
  active: boolean;
  rating?: number; // Average rating from clients (1-5 stars)
  reviews?: Review[];
  password?: string; // For barber login
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'appointment' | 'walk-in';

export interface Appointment {
  id: string;
  clientId: string; // Foreign key to clients table
  barberId: string; // Foreign key to barbers table
  barberName?: string; // Added for display
  serviceId: string; // Foreign key to services table
  serviceName?: string; // Added for display
  date: string;
  time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  duration: number; // in minutes
  price: number;
  commissionAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  walkInClientName?: string; // For walk-in clients without an account

  // Nested objects from Supabase joins
  clients?: { id: string; name: string; }; // Corresponds to the 'clients' table join
  barbers?: { id: string; name: string; }; // Corresponds to the 'barbers' table join
  services?: { id: string; name: string; duration: number; price: number; }; // Corresponds to the 'services' table join
}

export interface AppointmentWithDetails extends Appointment {
  client?: Client;
  barber?: Barber;
  service?: Service;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 'system';
  read: boolean;
  createdAt: string;
  relatedId?: string; // ID of related item (appointment, etc.)
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalVisits: number;
  lastVisit?: string;
  preferredBarberId?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
}

export interface DashboardStats {
  totalAppointmentsToday: number;
  totalWalkInsToday: number;
  totalRevenueToday: number;
  totalAppointmentsThisWeek: number;
  totalWalkInsThisWeek: number;
  totalRevenueThisWeek: number;
  appointmentsPercentage: number; // of total visits
  walkInsPercentage: number; // of total visits
  topBarber: {
    id: string;
    name: string;
    totalCuts: number;
  };
  topService: {
    id: string;
    name: string;
    count: number;
  };
  weeklyRevenueData: ChartData[];
  weeklyAppointmentsData: ChartData[];
  appointmentsTodayTrend: number;
  walkInsTodayTrend: number;
  revenueTodayTrend: number;
}

export interface BarberStats {
  totalCuts: number;
  appointmentCuts: number;
  walkInCuts: number;
  totalCommission: number;
  appointmentsPercentage: number;
  walkInsPercentage: number;
  dailyStats: {
    date: string;
    cuts: number;
    commission: number;
  }[];
  monthlyStats: {
    month: string;
    cuts: number;
    commission: number;
  }[];
}
