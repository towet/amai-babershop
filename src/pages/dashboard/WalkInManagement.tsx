import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
// No longer using mock data
import { getAllBarbers } from '@/lib/services/barber-service';
import { getAllServices } from '@/lib/services/service-service';
import { getAllAppointments, createAppointment, updateAppointmentStatus } from '@/lib/services/booking-service';
import { Appointment, Client } from '@/lib/types';
import { Calendar, Clock, Scissors, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import WalkInForm from '@/components/dashboard/WalkInForm';

const WalkInManagement = () => {
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  const [walkIns, setWalkIns] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isAddingWalkIn, setIsAddingWalkIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch barbers, services, and today's walk-ins
        const [barbersData, servicesData, appointmentsData] = await Promise.all([
          getAllBarbers(),
          getAllServices(),
          getAllAppointments()
        ]);
        
        // Filter walk-ins for today
        const todayWalkIns = appointmentsData.filter(
          appointment => appointment.date === today && appointment.type === 'walk-in'
        );
        
        setBarbers(barbersData);
        setServices(servicesData);
        setWalkIns(todayWalkIns);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [today]);
  
  // Handle walk-in creation
  const handleCreateWalkIn = async (newWalkIn: Appointment) => {
    try {
      setLoading(true);
      const createdWalkIn = await createAppointment({
        ...newWalkIn,
        type: 'walk-in'
      });
      
      setWalkIns([...walkIns, createdWalkIn]);
      setIsAddingWalkIn(false);
      
      toast({
        title: 'Success',
        description: 'Walk-in has been recorded successfully.',
      });
    } catch (error) {
      console.error('Error creating walk-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to record walk-in. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle walk-in status change
  const handleStatusChange = async (id: string, status: 'completed' | 'cancelled' | 'no-show' | 'scheduled') => {
    try {
      setLoading(true);
      await updateAppointmentStatus(id, status);
      
      // Update local state
      setWalkIns(
        walkIns.map((walkIn) =>
          walkIn.id === id ? { ...walkIn, status } : walkIn
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Walk-in status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating walk-in status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Walk-in Management</h1>
            <p className="text-xs md:text-sm text-gray-500">
              Record walk-in clients and assign them to barbers
            </p>
          </div>
          
          <div className="mt-2 sm:mt-0">
            <button
              onClick={() => setIsAddingWalkIn(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Record Walk-in
            </button>
          </div>
        </div>
        
        {/* Current Date Display */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            {loading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
              <div className="ml-3 md:ml-4">
                <h2 className="text-base md:text-xl font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  {walkIns.length} walk-ins recorded today
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <div className="text-xs md:text-sm text-gray-500 mr-2">Current Time:</div>
              <div className="text-sm md:text-base font-medium text-gray-900">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Availability Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {barbers
            .filter(barber => barber.active)
            .map(barber => {
              const barberWalkIns = walkIns.filter(
                walkIn => walkIn.barberId === barber.id && walkIn.status === 'scheduled'
              );
              const isAvailable = barberWalkIns.length === 0;
              
              return (
                <div
                  key={barber.id}
                  className={`bg-white rounded-lg md:rounded-xl shadow-sm border ${
                    isAvailable ? 'border-green-200' : 'border-amber-200'
                  } p-3 md:p-4 flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <div className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center ${
                      isAvailable ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {barber.photoUrl ? (
                        <img
                          src={barber.photoUrl}
                          alt={barber.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        barber.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="ml-2 md:ml-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{barber.name}</p>
                      <p className="text-xs text-gray-500">{barber.specialty || 'Barber'}</p>
                    </div>
                  </div>
                  <div className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                    isAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isAvailable ? 'Available' : 'With client'}
                  </div>
                </div>
              );
            })}
        </div>
        
        {/* Today's Walk-ins */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Today's Walk-ins</h2>
          
          {walkIns.length > 0 ? (
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <AppointmentTable
                  appointments={walkIns}
                  title="Walk-ins"
                  showBarber={true}
                  allowStatusChange={true}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 text-gray-400 mb-3 md:mb-4">
                <Clock size={20} className="md:hidden" />
                <Clock size={24} className="hidden md:block" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">No walk-ins recorded today</h3>
              <p className="mt-2 text-xs md:text-sm text-gray-500 max-w-sm mx-auto px-4">
                Click the "Record Walk-in" button to add a new walk-in client.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for adding a walk-in */}
      {isAddingWalkIn && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <WalkInForm
              onSubmit={handleCreateWalkIn}
              onCancel={() => setIsAddingWalkIn(false)}
            />
          </div>
        </div>
      )}
      
      {/* Quick Add Client Modal has been removed since clients are managed in the Clients tab */}
    </DashboardLayout>
  );
};

export default WalkInManagement;
