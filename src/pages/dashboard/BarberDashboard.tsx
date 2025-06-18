import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChartComponent } from '@/components/dashboard/BarChartComponent';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { Calendar, Scissors, TrendingUp, Users, ChevronRight, PlusCircle, Star } from 'lucide-react';
import { Barber, BarberStats, AppointmentStatus, Appointment, AppointmentWithDetails } from "@/lib/types";
import { useAuth } from '@/lib/auth/auth-context';
import { getBarberById, getBarberStats } from '../../lib/services/barber-service';
import { 
  getTodaysAppointments, 
  getTodaysAppointmentsWithDetails, 
  getAppointmentById, 
  getAllBarberAppointments,
  getUpcomingBarberAppointments 
} from '../../lib/services/appointment-service';
import {
  getBarberAppointmentsAdmin,
  getUpcomingBarberAppointmentsAdmin
} from '../../lib/services/admin-appointment-service';
import { toast } from '@/components/ui/use-toast';

import { supabase } from '@/lib/supabase/supabase';

const BarberDashboard = () => {
  const { user } = useAuth();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [barberStats, setBarberStats] = useState<BarberStats | null>(null);
  const [barberAppointments, setBarberAppointments] = useState<Appointment[]>([]);
  const [detailedAppointments, setDetailedAppointments] = useState<AppointmentWithDetails[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [syncStatus, setSyncStatus] = useState<'synced'|'syncing'|'error'|'offline'>('synced');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const renderStarRating = (rating: number, starSize: number = 5) => {
    const stars = [];
    const effectivelyFullStars = Math.round(rating); // Use Math.round for display simplicity

    for (let i = 0; i < effectivelyFullStars; i++) {
      stars.push(
        <Star key={`full-${i}-${Math.random()}`} className={`w-${starSize} h-${starSize} fill-amber-500 text-amber-500`} />
      );
    }

    const emptyStarsCount = 5 - effectivelyFullStars;
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <Star key={`empty-${effectivelyFullStars + i}-${Math.random()}`} className={`w-${starSize} h-${starSize} text-gray-300`} />
      );
    }
    return <div className="flex items-center">{stars} <span className="ml-1 text-sm text-gray-600">({rating && typeof rating === 'number' && !isNaN(rating) ? rating.toFixed(1) : 'N/A'})</span></div>;
  };

  
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // Helper to get cache key based on barberId (either from user or resolved)
  const getCacheKey = (id?: string) => {
    // If no ID is passed, try to use the user's barberId
    const barberId = id || user?.barberId;
    if (!barberId) {
      console.warn('No barberId available for cache key');
      // Fallback to email if available
      return user?.email ? `barber_dashboard_email_${user.email}` : 'barber_dashboard_unknown';
    }
    return `barber_dashboard_${barberId}`;
  };

  // Save dashboard data to cache
  const saveDashboardToCache = (barberId?: string) => {
    if (barber && barberStats) {
      try {
        // Store in local storage for offline use
        const cacheData = {
          barber,
          barberStats,
          barberAppointments,
          detailedAppointments,
          lastUpdated: new Date().toISOString()
        };
        
        const cacheKey = getCacheKey(barberId);
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('Dashboard data cached successfully with key:', cacheKey);
      } catch (error) {
        console.error('Error caching dashboard data:', error);
      }
    }
  };

  // Load dashboard data from cache
  const loadDashboardFromCache = (barberId?: string): boolean => {
    try {
      // First try with provided barberId
      let cacheKey = getCacheKey(barberId);
      let cachedDataString = localStorage.getItem(cacheKey);
      
      // If not found, try alternatives
      if (!cachedDataString && user?.email) {
        // Try by email
        const emailKey = `barber_dashboard_email_${user.email}`;
        cachedDataString = localStorage.getItem(emailKey);
        if (cachedDataString) {
          cacheKey = emailKey;
          console.log('Found cache by email key:', emailKey);
        }
      }
      
      // If we have cached data, use it
      if (cachedDataString) {
        console.log('Loading cached data from key:', cacheKey);
        const parsedData = JSON.parse(cachedDataString);
        setBarber(parsedData.barber);
        setBarberStats(parsedData.barberStats);
        setBarberAppointments(parsedData.barberAppointments);
        setDetailedAppointments(parsedData.detailedAppointments || []);
        const cachedTime = new Date(parsedData.lastUpdated).toLocaleTimeString();
        setLastRefreshed(`${cachedTime} (cached)`);
        setSyncStatus('offline');
        setIsOffline(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached dashboard data:', error);
      return false;
    }
  };

  // Check if user is online
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to load all barber data
  const loadBarberData = async () => {
    if (!user) {
      console.error('Missing user:', user);
      toast({
        title: "Error",
        description: "You need to be logged in to view this page.",
        variant: "destructive"
      });
      return;
    }
    
    // If we don't have a barberId, try to find it by email (handle special case for Farad)
    let barberId = user.barberId;
    if (!barberId || barberId === 'undefined') {
      console.log('No barberId in user object, checking for barber by email:', user.email);
      
      try {
        // Try to find barber by email in the barbers table
        const { data: barberByEmail, error: emailError } = await supabase
          .from('barbers')
          .select('id, name, email')
          .eq('email', user.email)
          .single();
          
        if (!emailError && barberByEmail) {
          console.log('Found barber by email:', barberByEmail);
          barberId = barberByEmail.id;
          // Update user object for future use
          user.barberId = barberByEmail.id;
        } else if (user.email === 'farad@amaimenscare.com') {
          // Special case for Farad if email lookup failed
          console.log('Special case for Farad, querying all barbers');
          const { data: allBarbers } = await supabase
            .from('barbers')
            .select('id, name, email');
          
          console.log('All barbers:', allBarbers);
          
          // Find Farad or similar name in barbers list
          const faradBarber = allBarbers?.find(b => 
            b.name.toLowerCase().includes('farad') || 
            b.email.toLowerCase().includes('farad'));
          
          if (faradBarber) {
            console.log('Found Farad by name/email match:', faradBarber);
            barberId = faradBarber.id;
            user.barberId = faradBarber.id;
          }
        }
      } catch (err) {
        console.error('Error finding barber by email:', err);
      }
    }
    
    if (!barberId) {
      console.error('Unable to determine barber ID');
      toast({
        title: "Error",
        description: "Unable to find your barber profile. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    // Debug log to track barber ID being used
    console.log('Loading data for barber ID:', barberId, 'User:', user);
    
    setRefreshing(true);
    setSyncStatus('syncing');
    
    // If offline, try to load from cache first
    if (!navigator.onLine) {
      const loadedFromCache = loadDashboardFromCache();
      if (loadedFromCache) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
    }
    
    try {
      // Try to fetch live data first
      if (navigator.onLine) {
        // Fetch barber profile
        const barberProfile = await getBarberById(barberId);
        setBarber(barberProfile);
        console.log('Fetched barber profile:', barberProfile);
        
        // Fetch barber stats
        const stats = await getBarberStats(barberId);
        setBarberStats(stats as unknown as BarberStats);
        console.log('Fetched barber stats:', stats);
        
        // Fetch today's appointments with full details if possible
        try {
          console.log('Attempting to fetch detailed appointments for barberId:', barberId);
          const detailedAppointmentsData = await getTodaysAppointmentsWithDetails(barberId);
          setDetailedAppointments(detailedAppointmentsData);
          console.log('Fetched detailed appointments:', detailedAppointmentsData);
        } catch (detailError) {
          console.error('Error fetching detailed appointments (non-critical):', detailError);
          // This is non-critical, we'll fall back to regular appointments
        }
        
        // Try regular appointment fetching first
        console.log('Fetching ALL appointments for barberId using standard service:', barberId);
        let allAppointments;
        try {
          allAppointments = await getAllBarberAppointments(barberId);
          console.log('Fetched ALL appointments using standard service:', allAppointments);
        } catch (error) {
          console.error('Error fetching appointments with standard service:', error);
          allAppointments = [];
        }
        
        // If no appointments found with regular service, try admin service
        if (!allAppointments || allAppointments.length === 0) {
          console.log('No appointments found with standard service, trying admin service for barberId:', barberId);
          try {
            allAppointments = await getBarberAppointmentsAdmin(barberId);
            console.log('Fetched ALL appointments using admin service:', allAppointments);
          } catch (adminError) {
            console.error('Error fetching appointments with admin service:', adminError);
          }
        }
        
        setBarberAppointments(allAppointments || []);
        
        // Fetch all upcoming appointments (including today and future dates) with full details
        try {
          console.log('Fetching upcoming appointments with details using standard service for barberId:', barberId);
          let upcomingAppointmentsData = await getUpcomingBarberAppointments(barberId);
          
          // If no upcoming appointments found with regular service, try admin service
          if (!upcomingAppointmentsData || upcomingAppointmentsData.length === 0) {
            console.log('No upcoming appointments found with standard service, trying admin service for barberId:', barberId);
            try {
              upcomingAppointmentsData = await getUpcomingBarberAppointmentsAdmin(barberId);
              console.log('Fetched upcoming appointments using admin service:', upcomingAppointmentsData);
            } catch (adminError) {
              console.error('Error fetching upcoming appointments with admin service:', adminError);
            }
          }
          
          setUpcomingAppointments(upcomingAppointmentsData || []);
          console.log('Final upcoming appointments with details:', upcomingAppointmentsData);
        } catch (upcomingError) {
          console.error('Error fetching upcoming appointments:', upcomingError);
        }
        
        // If we have no detailed appointments but have regular ones, use those
        if (detailedAppointments.length === 0 && allAppointments.length > 0) {
          // Filter to just today's appointments for the UI
          const todaysDate = new Date().toISOString().split('T')[0];
          const todaysAppointments = allAppointments.filter(a => a.date === todaysDate);
          console.log('Filtered to today\'s appointments:', todaysAppointments);
          
          if (todaysAppointments.length > 0) {
            setDetailedAppointments(todaysAppointments);
          }
        }
      }
      
      // Save data to cache with the resolved barberId
      saveDashboardToCache(barberId);
        
      const now = new Date().toLocaleTimeString();
      setLastRefreshed(now);
      setSyncStatus('synced');
      
    } catch (error) {
      console.error('Error loading barber data:', error);
      setSyncStatus('error');
      
      // Try loading from cache if offline or if online loading fails
      if (!navigator.onLine || (loadDashboardFromCache(barberId))) {
        setIsOffline(true);
        setSyncStatus('offline');
        toast({
          title: "Offline Mode",
          description: "You're currently offline. Showing cached data.",
          variant: "default"
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Manual refresh function
  const handleRefresh = async () => {
    await loadBarberData();
  };
  


  // Debug logging for appointments
  useEffect(() => {
    console.log('Debug - Upcoming appointments:', upcomingAppointments);
    console.log('Debug - Upcoming appointments length:', upcomingAppointments.length);
  }, [upcomingAppointments]);
  
  // Set up real-time subscriptions and automatic refresh
  useEffect(() => {
    if (!user?.barberId) return;
    
    // Initial load
    loadBarberData();
    
    // Set up Supabase real-time subscription for appointment changes
    const appointmentSubscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'appointments',
        filter: `barber_id=eq.${user.barberId}`, // Only for this barber's appointments
      }, (payload) => {
        console.log('Appointment change detected:', payload);
        
        // Show notification based on event type
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Appointment",
            description: `You have a new appointment scheduled`,
            variant: "default"
          });
          loadBarberData(); // Refresh data
        } else if (payload.eventType === 'UPDATE') {
          toast({
            title: "Appointment Updated",
            description: `An appointment has been updated`,
            variant: "default"
          });
          loadBarberData(); // Refresh data
        } else if (payload.eventType === 'DELETE') {
          toast({
            title: "Appointment Cancelled",
            description: `An appointment has been cancelled`,
            variant: "default"
          });
          loadBarberData(); // Refresh data
        }
      })
      .subscribe();
    
    // Also set up interval as backup refresh mechanism (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        loadBarberData();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up subscriptions and interval on component unmount
    return () => {
      supabase.channel('appointments-changes').unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [user]);

  if (isLoading || !barberStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Last refreshed indicator and refresh button */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">Last updated: {lastRefreshed}</p>
            
            {/* Sync status indicator */}
            {syncStatus === 'synced' && (
              <span className="flex items-center text-green-600 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Data in sync
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="flex items-center text-amber-600 text-xs">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-1"></div>
                Syncing...
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="flex items-center text-red-600 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Sync error
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="flex items-center text-gray-600 text-xs">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                Offline mode
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing || isOffline}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${isOffline ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
            >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : isOffline ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                </svg>
                Offline
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page Header with Barber Profile */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold">
            {barber?.photoUrl ? (
              <img 
                src={barber.photoUrl} 
                alt={barber.name} 
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              barber?.name?.substring(0, 2).toUpperCase() || 'BB'
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{barber?.name || 'Barber'}</h1>
            <p className="text-gray-500">{barber?.specialty || 'Barber'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                {barber?.commissionRate || 0}% Commission Rate
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Joined {barber?.joinDate ? new Date(barber.joinDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-3xl font-bold text-gray-900">₺{barberStats.totalCommission}</p>
            </div>
          </div>
        </div>
        
        {/* Commission Stats */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-sm p-6 border border-amber-100">
          <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Commission Summary
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
              <p className="text-sm text-gray-500 mb-1">Commission Rate</p>
              <p className="text-3xl font-bold text-amber-600">{barber?.commissionRate || 0}%</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
              <p className="text-sm text-gray-500 mb-1">Total Commission</p>
              <p className="text-3xl font-bold text-amber-600">₺{barberStats?.totalCommission || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
              <p className="text-sm text-gray-500 mb-1">This Month</p>
              <p className="text-3xl font-bold text-amber-600">₺{barberStats?.monthlyStats && barberStats.monthlyStats.length > 0 ? barberStats.monthlyStats[barberStats.monthlyStats.length - 1]?.commission || 0 : 0}</p>
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <a href="/dashboard/profile" className="text-sm text-amber-700 hover:text-amber-900 transition-colors flex items-center justify-end gap-1">
              View detailed commission history
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Cuts"
            value={barberStats?.totalCuts || 0}
            icon={<Scissors size={24} />}
          />
          <StatCard
            title="Appointments"
            value={barberStats?.appointmentCuts || 0}
            icon={<Calendar size={24} />}
            description={`${barberStats?.appointmentsPercentage || 0}% of total cuts`}
          />
          <StatCard
            title="Walk-ins"
            value={barberStats?.walkInCuts || 0}
            icon={<Users size={24} />}
            description={`${barberStats?.walkInsPercentage || 0}% of total cuts`}
          />
          {/* My Rating StatCard */}
          {barber && typeof barber.rating === 'number' && (
            <StatCard
              title="My Rating"
              valueComponent={renderStarRating(barber.rating, 5)}
              icon={<Star size={24} className="text-amber-500" />}
              description={`Based on ${barber.reviews?.filter(r => r.approved).length || 0} approved reviews`}
            />
          )}
        </div>

        {/* Recent Approved Reviews Section */}
        {barber && barber.reviews && barber.reviews.filter(review => review.approved).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Recent Approved Reviews
            </h2>
            <div className="space-y-4">
              {barber.reviews
                .filter(review => review.approved)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by most recent
                .slice(0, 3) // Take latest 3
                .map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      {renderStarRating(review.rating, 4)}
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.clientName && (
                      <p className="text-sm font-semibold text-gray-700">{review.clientName}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 truncate">{review.comment}</p>
                  </div>
                ))}
                {barber.reviews.filter(review => review.approved).length > 3 && (
                  <div className="text-right mt-2">
                    <a href="/dashboard/profile" className="text-sm text-amber-700 hover:text-amber-900 transition-colors">
                      View all reviews...
                    </a>
                  </div>
                )}
            </div>
          </div>
        )}
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartComponent
            data={(barberStats?.dailyStats || []).map(day => ({
              name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
              value: day.cuts
            }))}
            dataKey="value"
            title="Cuts - Last 7 Days"
          />
          <BarChartComponent
            data={(barberStats?.monthlyStats || []).map(stat => ({
              name: stat.month,
              value: stat.commission,
              cuts: stat.cuts
            }))}
            dataKey="value"
            title="Monthly Commission"
            isCurrency={true}
          />
        </div>
        
        {/* Today's Appointments */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Appointments</h2>
          
          {/* Display appointments if available */}
          {detailedAppointments && detailedAppointments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-700">
                  Your Scheduled Appointments Today ({detailedAppointments.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {detailedAppointments.map((appointment) => {
                  const isDetailed = 'client' in appointment || 'service' in appointment;
                  const detailedAppointment = isDetailed ? appointment as AppointmentWithDetails : null;
                  
                  return (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-green-500' : 
                              appointment.status === 'cancelled' ? 'bg-red-500' : 
                              appointment.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                            </div>
                            <span className="font-medium text-gray-900">
                              {appointment.time} - {detailedAppointment?.service?.name || 'Appointment'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {detailedAppointment?.client?.name || appointment.walkInClientName || 'Client'}
                            {detailedAppointment?.client?.phone && ` • ${detailedAppointment.client.phone}`}
                          </p>
                          {appointment.notes && <p className="text-xs text-gray-500 mt-1">Note: {appointment.notes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-amber-600">
                            ${detailedAppointment?.service?.price || appointment.price || 0}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : barberAppointments.filter(a => a.date === today).length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-700">
                  Your Scheduled Appointments Today ({barberAppointments.filter(a => a.date === today).length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {barberAppointments
                  .filter(a => a.date === today)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-green-500' : 
                              appointment.status === 'cancelled' ? 'bg-red-500' : 
                              appointment.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                            </div>
                            <span className="font-medium text-gray-900">
                              {appointment.time} - Service ID: {appointment.serviceId}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.walkInClientName || `Client ID: ${appointment.clientId}` || 'Walk-in'}
                          </p>
                          {appointment.notes && <p className="text-xs text-gray-500 mt-1">Note: {appointment.notes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-amber-600">
                            ${appointment.price || 0}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No appointments scheduled for today.</p>
              <p className="text-sm text-gray-400 mt-2">
                {barberAppointments.length > 0 
                  ? `You have ${barberAppointments.length} appointments in the system (not for today).`
                  : "You'll see your upcoming appointments here once they are booked."}
              </p>
            </div>
          )}
          
          {/* Sync status indicators */}
          <div className="mt-2">
            {syncStatus === 'syncing' && (
              <span className="flex items-center text-amber-600 text-xs">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-1"></div>
                Syncing...
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="flex items-center text-red-600 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Sync error
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="flex items-center text-gray-600 text-xs">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                Offline mode
              </span>
            )}
          </div>
        </div>
        
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          
          {/* Upcoming Appointments */}
          {/* Debug logs moved to useEffect */}
          {(upcomingAppointments && upcomingAppointments.length > 0) ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-700">
                  Your Upcoming Schedule ({upcomingAppointments.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.map((appointment) => {
                  // Format the date for display (e.g., "Mon, Jun 10" or "Tomorrow")
                  const appointmentDate = new Date(appointment.date);
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  
                  // Determine if the appointment is today or tomorrow
                  const isToday = appointmentDate.toDateString() === today.toDateString();
                  const isTomorrow = appointmentDate.toDateString() === tomorrow.toDateString();
                  
                  // Format the date display
                  const dateDisplay = isToday 
                    ? 'Today' 
                    : isTomorrow 
                      ? 'Tomorrow' 
                      : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(appointmentDate);
                  
                  return (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-green-500' : 
                              appointment.status === 'cancelled' ? 'bg-red-500' : 
                              appointment.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                            </div>
                            <span className="font-medium text-gray-900">
                              {dateDisplay} at {appointment.time} - {appointment.service?.name || 'Appointment'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.client?.name || appointment.walkInClientName || 'Client'}
                            {appointment.client?.phone && ` • ${appointment.client.phone}`}
                          </p>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ${appointment.price.toFixed(2)}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No upcoming appointments scheduled.</p>
              <p className="text-sm text-gray-400 mt-2">
                You'll see your future appointments here once they are booked.
              </p>
              
              {/* Debug info - this will help troubleshoot */}
              <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-left">
                <p className="font-semibold">Debug Info:</p>
                <p>Barber ID: {barber?.id || user?.barberId || 'Not found'}</p>
                <p>All appointments count: {barberAppointments?.length || 0}</p>
                <p>Today's appointments: {barberAppointments?.filter(a => a.date === today)?.length || 0}</p>
                <p>Upcoming appointments count: {upcomingAppointments?.length || 0}</p>
              </div>
              
              {/* Test Data Generation Button - only visible in development for easier testing */}
              {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                <button
                  onClick={handleGenerateTestAppointments}
                  disabled={isGeneratingTestData}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {isGeneratingTestData ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Generate Test Appointments
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Performance Comparison */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Performance</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Appointment Bookings</span>
                <span className="text-sm font-medium text-amber-600">{barberStats.appointmentsPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${barberStats.appointmentsPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {barberStats.appointmentCuts} appointments out of {barberStats.totalCuts} total cuts
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Walk-in Service</span>
                <span className="text-sm font-medium text-amber-600">{barberStats.walkInsPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${barberStats.walkInsPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {barberStats.walkInCuts} walk-ins out of {barberStats.totalCuts} total cuts
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BarberDashboard;
