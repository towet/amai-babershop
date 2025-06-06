import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChartComponent } from '@/components/dashboard/BarChartComponent';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { BarberCard } from '@/components/dashboard/BarberCard';
import { Calendar, Scissors, TrendingUp, Users, Loader2 } from 'lucide-react';
import { AppointmentStatus, DashboardStats, Appointment, Barber, ChartData } from '@/lib/types';
import { Link } from 'react-router-dom';
import { getDashboardStats, getTodayAppointments } from '@/lib/services/dashboard-service';
import { getAllBarbers } from '@/lib/services/barber-service';
import { updateAppointmentStatus } from '@/lib/services/booking-service';
import { toast } from '@/components/ui/use-toast';

const ManagerDashboard = () => {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<ChartData[]>([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<ChartData[]>([]);
  
  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get dashboard stats
        const stats = await getDashboardStats();
        setDashboardStats(stats);
        
        // Get today's appointments
        const appointments = await getTodayAppointments();
        setTodayAppointments(appointments.filter(apt => apt.status === 'scheduled'));
        
        // Get barbers
        const allBarbers = await getAllBarbers();
        setBarbers(allBarbers);
        
        // Set real weekly data for charts from dashboardStats
        if (stats.weeklyRevenueData) {
          setWeeklyRevenue(stats.weeklyRevenueData);
        }
        if (stats.weeklyAppointmentsData) {
          setWeeklyAppointments(stats.weeklyAppointmentsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // Handle appointment status change
  const handleStatusChange = async (id: string, status: AppointmentStatus, clientId?: string | null) => {
    try {
      await updateAppointmentStatus(id, status, clientId);
      
      // Update the local state to reflect the change
      setTodayAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id 
            ? { ...appointment, status } 
            : appointment
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
            <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of appointments, revenue, and barber performance
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={dashboardStats?.totalAppointmentsToday || 0}
            icon={<Calendar size={24} />}
            trend={dashboardStats?.appointmentsTodayTrend}
          />
          <StatCard
            title="Today's Walk-ins"
            value={dashboardStats?.totalWalkInsToday || 0}
            icon={<Users size={24} />}
            trend={dashboardStats?.walkInsTodayTrend}
          />
          <StatCard
            title="Today's Revenue"
            value={dashboardStats?.totalRevenueToday || 0}
            isCurrency={true}
            icon={<TrendingUp size={24} />}
            trend={dashboardStats?.revenueTodayTrend}
          />
          <StatCard
            title="Top Barber"
            value={dashboardStats?.topBarber.name || 'N/A'}
            description={dashboardStats?.topBarber.totalCuts 
              ? `${dashboardStats.topBarber.totalCuts} cuts total` 
              : 'No data available'}
            icon={<Scissors size={24} />}
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartComponent
            data={weeklyRevenue}
            dataKey="value"
            title="Weekly Revenue"
            isCurrency={true}
          />
          <BarChartComponent
            data={weeklyAppointments}
            dataKey="value"
            title="Weekly Appointments"
            barColor="#3B82F6"
          />
        </div>
        
        {/* Today's Appointments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
            <Link 
              to="/dashboard/appointments"
              className="text-sm font-medium text-amber-600 hover:text-amber-800"
            >
              View All
            </Link>
          </div>
          
          {todayAppointments.length > 0 ? (
            <AppointmentTable
              appointments={todayAppointments}
              title="Scheduled for Today"
              allowStatusChange={true}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
        
        {/* Barbers Performance */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Barber Performance</h2>
            <Link 
              to="/dashboard/barbers"
              className="text-sm font-medium text-amber-600 hover:text-amber-800"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.length > 0 ? (
              barbers.map((barber) => (
                <BarberCard key={barber.id} barber={barber} />
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No barbers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
