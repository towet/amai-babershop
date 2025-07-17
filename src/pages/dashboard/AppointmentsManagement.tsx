import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { mockClients } from '@/lib/mock-data'; // Keep mockClients until we have real client data
import { getAllAppointments, createAppointment, updateAppointment as updateAppointmentService, deleteAppointment as deleteAppointmentService, updateAppointmentStatus } from '@/lib/services/booking-service';
import { getAllBarbers } from '@/lib/services/barber-service';
import { getAllServices } from '@/lib/services/service-service';
import { toast } from '@/components/ui/use-toast';
import { Appointment, AppointmentStatus, AppointmentType, AppointmentWithDetails } from '@/lib/types';
import { Calendar, Filter, Plus, Search, Loader2 } from 'lucide-react';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import AppointmentForm from '@/components/dashboard/AppointmentForm';
import { useAuth } from '@/lib/auth/auth-context';
import { getUpcomingBarberAppointments } from '@/lib/services/appointment-service';
import { getUpcomingBarberAppointmentsAdmin } from '@/lib/services/admin-appointment-service';

const AppointmentsManagement = () => {
  const { user, isManager, isBarber } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[] | AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AppointmentType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Get barber ID if user is a barber
  const barberId = isBarber ? user?.barberId : null;

  // Fetch appointments, barbers, and services when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let appointmentsData;
        
        // Fetch barbers and services regardless of role
        const [barbersData, servicesData] = await Promise.all([
          getAllBarbers(),
          getAllServices()
        ]);
        
        setBarbers(barbersData);
        setServices(servicesData);
        
        // Fetch appointments based on user role
        if (isBarber && barberId) {
          console.log('Fetching appointments for barber ID:', barberId);
          // For barbers, only fetch their own appointments with full details
          try {
            appointmentsData = await getUpcomingBarberAppointments(barberId);
            
            // If no appointments found with regular service, try admin service
            if (!appointmentsData || appointmentsData.length === 0) {
              console.log('No appointments found with standard service, trying admin service for barberId:', barberId);
              try {
                appointmentsData = await getUpcomingBarberAppointmentsAdmin(barberId);
                console.log('Fetched appointments using admin service:', appointmentsData);
              } catch (adminError) {
                console.error('Error fetching appointments with admin service:', adminError);
              }
            }
          } catch (error) {
            console.error('Error fetching appointments with standard service:', error);
            // Try admin service as fallback
            try {
              appointmentsData = await getUpcomingBarberAppointmentsAdmin(barberId);
              console.log('Fetched appointments using admin service (after error):', appointmentsData);
            } catch (adminError) {
              console.error('Error fetching appointments with admin service:', adminError);
            }
          }
        } else {
          // For managers, fetch all appointments
          appointmentsData = await getAllAppointments();
        }
        
        console.log('Fetched appointments:', appointmentsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointments. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isBarber, barberId]);

  // Filter appointments based on filters
  const filteredAppointments = appointments.filter(appointment => {
    // Search term filter (client name, barber name, service name)
    const clientName = mockClients.find(c => c.id === appointment.clientId)?.name.toLowerCase() || appointment.walkInClientName?.toLowerCase() || '';
    const barberName = barbers.find(b => b.id === appointment.barberId)?.name.toLowerCase() || '';
    const serviceName = services.find(s => s.id === appointment.serviceId)?.name.toLowerCase() || '';
    
    const matchesSearchTerm = searchTerm === '' || 
      clientName.includes(searchTerm.toLowerCase()) ||
      barberName.includes(searchTerm.toLowerCase()) ||
      serviceName.includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatusFilter = statusFilter === 'all' || appointment.status === statusFilter;
    
    // Type filter
    const matchesTypeFilter = typeFilter === 'all' || appointment.type === typeFilter;
    
    // Date filter
    const matchesDateFilter = dateFilter === '' || appointment.date === dateFilter;
    
    return matchesSearchTerm && matchesStatusFilter && matchesTypeFilter && matchesDateFilter;
  });

  // Sort appointments by date and time descending before grouping
  const sortedFilteredAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateB - dateA;
  });

  // Group appointments by date
  const appointmentsByDate = sortedFilteredAppointments.reduce((acc, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = [];
    }
    acc[appointment.date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Handle appointment status change
  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(id, status);
      
      // Update local state
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Appointment status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment creation
  const handleCreateAppointment = async (newAppointment: Appointment) => {
    try {
      setLoading(true);
      const createdAppointment = await createAppointment(newAppointment);
      
      // Update local state
      setAppointments([...appointments, createdAppointment]);
      setIsAddingAppointment(false);
      
      toast({
        title: 'Appointment Created',
        description: 'The appointment has been successfully created.',
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create appointment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment update
  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      setLoading(true);
      const result = await updateAppointmentService(updatedAppointment.id, updatedAppointment);
      
      // Update local state
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === updatedAppointment.id ? result : appointment
        )
      );
      setEditingAppointment(null);
      
      toast({
        title: 'Appointment Updated',
        description: 'The appointment has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        await deleteAppointmentService(id);
        
        // Update local state
        setAppointments(appointments.filter((appointment) => appointment.id !== id));
        
        toast({
          title: 'Appointment Deleted',
          description: 'The appointment has been successfully deleted.',
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete appointment. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 relative min-h-screen">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        )}
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isBarber ? 'My Appointments' : 'Appointments Management'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isBarber 
                ? 'View and manage your upcoming appointments' 
                : 'Schedule and manage appointments and walk-ins'}
            </p>
          </div>
          
          {/* Only show Add Appointment button for managers */}
          {isManager && (
            <button
              onClick={() => setIsAddingAppointment(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
          )}
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={isBarber ? "Search clients or services..." : "Search clients, barbers, or services..."}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Date Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full md:w-40">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="w-full md:w-40">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AppointmentType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="appointment">Appointments</option>
                <option value="walk-in">Walk-ins</option>
              </select>
            </div>
            
            {/* Clear Filters */}
            <div className="w-full md:w-auto">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateFilter('');
                }}
                className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Appointments List */}
        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <AppointmentTable
                  appointments={appointmentsByDate[date]}
                  title={`Appointments for ${date}`}
                  showBarber={!isBarber} // No need to show barber column for barbers
                  allowStatusChange={true} // Both barbers and managers can update status
                  onStatusChange={handleStatusChange}
                  onDelete={isManager ? handleDeleteAppointment : undefined} // Only managers can delete
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {statusFilter !== 'all' || typeFilter !== 'all' || dateFilter || searchTerm
                ? 'No appointments match your current filters. Try adjusting your search criteria.'
                : isBarber
                  ? 'You don\'t have any upcoming appointments scheduled.'
                  : 'There are no appointments scheduled. Get started by adding a new appointment.'}
            </p>
            {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateFilter('');
                }}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Modal for adding/editing appointment */}
      {(isAddingAppointment || editingAppointment) && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-auto">
            <AppointmentForm
              appointment={editingAppointment}
              onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
              onCancel={() => {
                setIsAddingAppointment(false);
                setEditingAppointment(null);
              }}
              onDelete={editingAppointment ? () => handleDeleteAppointment(editingAppointment.id) : undefined}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentsManagement;
