import { Barber, Appointment, Client, Service, DashboardStats, BarberStats, Review } from './types';

// Mock data for demonstration purposes
export const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    email: 'alex@amaibarbershop.com',
    phone: '+1-555-123-4567',
    age: 32,
    specialty: 'Classic cuts & fades',
    bio: 'Master barber with 10 years of experience, specializing in precision fades and classic styles.',
    photoUrl: '/barber1.jpg',
    joinDate: '2022-01-15',
    totalCuts: 1250,
    appointmentCuts: 950,
    walkInCuts: 300,
    commissionRate: 60,
    totalCommission: 37500,
    active: true,
    rating: 4.8,
    reviews: [
      {
        id: 'review-1',
        rating: 5,
        comment: 'Alex gave me the best haircut I have ever had! Extremely skilled with fades and very attentive to detail.',
        clientName: 'David Chen',
        clientEmail: 'david@example.com',
        date: '2023-09-15T14:30:00Z',
        approved: true
      },
      {
        id: 'review-2',
        rating: 5,
        comment: 'Very professional and friendly. The haircut was perfect and exactly what I asked for.',
        clientName: 'Michael Brown',
        clientEmail: 'michael@example.com',
        date: '2023-10-02T10:15:00Z',
        approved: true
      },
      {
        id: 'review-3',
        rating: 4,
        comment: 'Great barber, but had to wait a bit longer than expected. The result was worth it though!',
        clientName: 'Sam Taylor',
        clientEmail: 'sam@example.com',
        date: '2023-11-18T16:45:00Z',
        approved: true
      },
      {
        id: 'review-4',
        rating: 5,
        comment: 'Alex is amazing! I will never go to anyone else. He takes his time and makes sure everything is perfect.',
        clientName: 'Robert Johnson',
        date: '2023-12-05T11:30:00Z',
        approved: false
      }
    ]
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@amaibarbershop.com',
    phone: '+1-555-234-5678',
    age: 28,
    specialty: 'Modern styles & beard grooming',
    bio: 'Trendsetting barber specializing in modern styles and premium beard treatments.',
    photoUrl: '/barber2.jpg',
    joinDate: '2022-03-10',
    totalCuts: 980,
    appointmentCuts: 720,
    walkInCuts: 260,
    commissionRate: 60,
    totalCommission: 29400,
    active: true,
    rating: 4.6,
    reviews: [
      {
        id: 'review-5',
        rating: 5,
        comment: 'Marcus is a beard wizard! Best beard trim I have ever had, and he gave me some great advice on maintenance.',
        clientName: 'Thomas Wilson',
        clientEmail: 'thomas@example.com',
        date: '2023-09-20T09:30:00Z',
        approved: true
      },
      {
        id: 'review-6',
        rating: 4,
        comment: 'Great with modern styles. He knew exactly what I was looking for even when I was not sure how to describe it.',
        clientName: 'James Miller',
        clientEmail: 'james@example.com',
        date: '2023-10-12T15:15:00Z',
        approved: true
      },
      {
        id: 'review-7',
        rating: 5,
        comment: 'Marcus always makes my visits enjoyable. Great conversation and even better haircuts!',
        clientName: 'Alexander Smith',
        date: '2023-12-01T14:00:00Z',
        approved: false
      }
    ]
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james@amaibarbershop.com',
    phone: '+1-555-345-6789',
    age: 35,
    specialty: 'Traditional cuts & hot towel shaves',
    bio: 'Old-school barber bringing traditional techniques with modern flair. Known for perfect hot towel shaves.',
    photoUrl: '/barber3.jpg',
    joinDate: '2022-02-01',
    totalCuts: 1050,
    appointmentCuts: 830,
    walkInCuts: 220,
    commissionRate: 60,
    totalCommission: 31500,
    active: true
  },
];



export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-555-111-2222',
    totalVisits: 12,
    lastVisit: '2025-05-28T14:30:00',
    preferredBarberId: '1',
    notes: 'Prefers classic cut, no small talk'
  },
  {
    id: '2',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1-555-222-3333',
    totalVisits: 8,
    lastVisit: '2025-05-25T10:00:00',
    preferredBarberId: '2',
    notes: 'Always wants beard conditioning'
  },
  {
    id: '3',
    name: 'David Johnson',
    email: 'david@example.com',
    phone: '+1-555-333-4444',
    totalVisits: 15,
    lastVisit: '2025-05-29T16:00:00',
    preferredBarberId: '3',
    notes: 'Sensitive scalp, use gentle products'
  },
  {
    id: '4',
    name: 'Robert Williams',
    email: 'robert@example.com',
    phone: '+1-555-444-5555',
    totalVisits: 5,
    lastVisit: '2025-05-20T11:30:00',
    preferredBarberId: '1'
  },
  {
    id: '5',
    name: 'William Jones',
    email: 'william@example.com',
    phone: '+1-555-555-6666',
    totalVisits: 3,
    lastVisit: '2025-05-15T15:00:00',
    preferredBarberId: '2'
  },
];

// Generate 20 appointments (10 completed, 10 upcoming)
export function generateMockAppointments(): Appointment[] {
  const internalMockServices: Service[] = [
    {
      id: 'mock-svc-1',
      name: 'Basic Mock Cut',
      description: 'A simple mock haircut.',
      duration: 30,
      price: 300
    },
    {
      id: 'mock-svc-2',
      name: 'Mock Beard Trim',
      description: 'A simple mock beard trim.',
      duration: 20,
      price: 150
    },
    {
      id: 'mock-svc-3',
      name: 'Mock Wash & Style',
      description: 'A simple mock wash and style.',
      duration: 25,
      price: 200
    }
  ];
  const appointments: Appointment[] = [];
  const today = new Date();
  
  // Generate completed appointments (past 7 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (i % 7) - 1); // Past 7 days
    
    const barber = mockBarbers[i % mockBarbers.length];
    const client = mockClients[i % mockClients.length];
    const service = internalMockServices[i % internalMockServices.length];
    
    const isWalkIn = i % 3 === 0; // Every third appointment is a walk-in
    
    appointments.push({
      id: `completed-${i + 1}`,
      clientId: client.id,
      barberId: barber.id,
      serviceId: service.id,
      date: date.toISOString().split('T')[0],
      time: `${10 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
      status: 'completed',
      type: isWalkIn ? 'walk-in' : 'appointment',
      duration: service.duration,
      price: service.price,
      commissionAmount: service.price * (barber.commissionRate / 100),
      createdAt: new Date(date.getTime() - 86400000).toISOString(), // Created 1 day before
      updatedAt: date.toISOString()
    });
  }
  
  // Generate upcoming appointments (next 7 days)
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(today.getDate() + (i % 7) + 1); // Next 7 days
    
    const barber = mockBarbers[i % mockBarbers.length];
    const client = mockClients[i % mockClients.length];
    const service = internalMockServices[i % internalMockServices.length];
    
    appointments.push({
      id: `upcoming-${i + 1}`,
      clientId: client.id,
      barberId: barber.id,
      serviceId: service.id,
      date: date.toISOString().split('T')[0],
      time: `${10 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
      status: 'scheduled',
      type: 'appointment', // All upcoming are appointments
      duration: service.duration,
      price: service.price,
      commissionAmount: service.price * (barber.commissionRate / 100),
      createdAt: new Date(date.getTime() - 259200000).toISOString(), // Created 3 days before
      updatedAt: new Date(date.getTime() - 259200000).toISOString()
    });
  }
  
  return appointments;
};

export const mockAppointments = generateMockAppointments();

// Dashboard statistics for the manager view
export const mockDashboardStats: DashboardStats = {
  totalAppointmentsToday: 5,
  totalWalkInsToday: 2,
  totalRevenueToday: 3650,
  totalAppointmentsThisWeek: 22,
  totalWalkInsThisWeek: 8,
  totalRevenueThisWeek: 15800,
  appointmentsPercentage: 73,
  walkInsPercentage: 27,
  topBarber: {
    id: '1',
    name: 'Alex Rodriguez',
    totalCuts: 1250
  },
  topService: {
    id: '5',
    name: 'Premium package',
    count: 45
  }
};

// Generate stats for a specific barber
export const getBarberStats = (barberId: string): BarberStats => {
  const barber = mockBarbers.find(b => b.id === barberId);
  if (!barber) {
    throw new Error(`Barber with ID ${barberId} not found`);
  }
  
  // Generate daily stats for the last 7 days
  const dailyStats = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Random values for demo purposes
    const cuts = Math.floor(Math.random() * 8) + 1; // 1-8 cuts per day
    const commission = cuts * ((Math.floor(Math.random() * 4) + 3) * 100); // 300-600 per cut
    
    dailyStats.push({
      date: date.toISOString().split('T')[0],
      cuts,
      commission
    });
  }
  
  // Generate monthly stats for the last 6 months
  const monthlyStats = [];
  const currentMonth = today.getMonth();
  
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
    const month = new Date(today.getFullYear(), monthIndex, 1)
      .toLocaleString('default', { month: 'short' });
    
    // Random values for demo purposes
    const cuts = Math.floor(Math.random() * 70) + 30; // 30-100 cuts per month
    const commission = cuts * ((Math.floor(Math.random() * 4) + 3) * 100); // 300-600 per cut
    
    monthlyStats.push({
      month,
      cuts,
      commission
    });
  }
  
  return {
    totalCuts: barber.totalCuts,
    appointmentCuts: barber.appointmentCuts,
    walkInCuts: barber.walkInCuts,
    totalCommission: barber.totalCommission,
    appointmentsPercentage: Math.round((barber.appointmentCuts / barber.totalCuts) * 100),
    walkInsPercentage: Math.round((barber.walkInCuts / barber.totalCuts) * 100),
    dailyStats,
    monthlyStats
  };
};
