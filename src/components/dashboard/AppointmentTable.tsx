import { useState, useEffect } from 'react';
import { Appointment, AppointmentType, AppointmentStatus, Barber, Service, Client } from '@/lib/types';
import { Calendar, Clock, User, Scissors, CheckCircle, AlertCircle, XCircle, FileText } from 'lucide-react';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { getAllBarbers } from '@/lib/services/barber-service';
import { getAllServices } from '@/lib/services/service-service';
import { getAllClients } from '@/lib/services/client-service'; // Use real client data

interface AppointmentTableProps {
  appointments: Appointment[];
  title: string;
  showBarber?: boolean;
  allowStatusChange?: boolean;
  onStatusChange?: (id: string, status: AppointmentStatus, clientId?: string | null) => void;
  onDelete?: (id: string) => void;
}

export const AppointmentTable = ({
  appointments,
  title,
  showBarber = true,
  allowStatusChange = false,
  onStatusChange,
  onDelete
}: AppointmentTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch barbers, services, and clients to display names instead of IDs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersData, servicesData, clientsData] = await Promise.all([
          getAllBarbers(),
          getAllServices(),
          getAllClients()
        ]);
        
        setBarbers(barbersData);
        setServices(servicesData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching data for appointment table:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper functions to get names from IDs
  const getBarberName = (appointment: Appointment) => {
    // Prefer name from joined data if available
    if (appointment.barbers && typeof appointment.barbers === 'object' && appointment.barbers.name) {
      return appointment.barbers.name;
    }
    // Fallback to looking up in the fetched barbers list
    if (appointment.barberId) {
      const barber = barbers.find(b => b.id === appointment.barberId);
      return barber ? barber.name : 'Unknown Barber';
    }
    return 'Unknown Barber';
  };
  
  const getServiceName = (appointment: Appointment) => {
    // Prefer name from joined data if available
    if (appointment.services && typeof appointment.services === 'object' && appointment.services.name) {
      return appointment.services.name;
    }
    // Fallback to looking up in the fetched services list
    if (appointment.serviceId) {
      const service = services.find(s => s.id === appointment.serviceId);
      return service ? service.name : 'Unknown Service';
    }
    return 'Unknown Service';
  };
  
  const getClientName = (appointment: Appointment) => {
    // If there's a walkInClientName, use it as primary source
    if (appointment.walkInClientName) {
      const isActualWalkIn = appointment.type === 'walk-in';
      return isActualWalkIn ? `${appointment.walkInClientName} (Walk-in)` : appointment.walkInClientName;
    }
    
    // Prefer name from joined client data if available
    if (appointment.clients && typeof appointment.clients === 'object' && appointment.clients.name) {
      return appointment.clients.name;
    }
    
    // Fallback to looking up in the fetched clients list using clientId
    if (appointment.clientId) {
      const client = clients.find(c => c.id === appointment.clientId);
      return client ? client.name : 'Unknown Client';
    }
    
    return 'Unknown Client'; // Default if no walkInClientName and no clientId/joined client
  };  
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const handleViewDetails = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };
  
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeColor = (type: AppointmentType) => {
    return type === 'appointment' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-amber-100 text-amber-800';
  };
  
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      case 'no-show': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100">
        <h3 className="text-base md:text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              {showBarber && (
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barber
                </th>
              )}
              <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status/Type
              </th>
              <th scope="col" className="relative px-3 md:px-6 py-2 md:py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <Scissors size={14} className="md:hidden" />
                      <Scissors size={16} className="hidden md:block" />
                    </div>
                    <div className="ml-2 md:ml-3">
                      <div className="text-xs md:text-sm font-medium text-gray-900">
                        {getServiceName(appointment)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        {appointment.duration} min
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center text-xs md:text-sm text-gray-900 mb-1">
                      <Calendar size={12} className="mr-1 text-gray-500 md:hidden" />
                      <Calendar size={14} className="mr-1 text-gray-500 hidden md:block" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <Clock size={12} className="mr-1 text-gray-500 md:hidden" />
                      <Clock size={14} className="mr-1 text-gray-500 hidden md:block" />
                      {appointment.time}
                    </div>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-7 w-7 md:h-8 md:w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={14} className="md:hidden" />
                      <User size={16} className="hidden md:block" />
                    </div>
                    <div className="ml-2 md:ml-3">
                      <div className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                        {getClientName(appointment)}
                      </div>
                      {appointment.notes && (
                        <div className="text-xs md:text-sm text-gray-500 max-w-[120px] md:max-w-xs truncate">
                          <FileText size={10} className="inline mr-1 md:hidden" />
                          <FileText size={12} className="hidden md:inline mr-1" />
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {showBarber && (
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="text-xs md:text-sm text-gray-900 line-clamp-1">{getBarberName(appointment)}</div>
                  </td>
                )}
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1 md:space-y-2">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(appointment.type)}`}>
                      {appointment.type === 'appointment' ? 'Appointment' : 'Walk-in'}
                    </span>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(appointment)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Details
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {allowStatusChange && appointment.status === 'scheduled' && (
                    <div className="flex items-center justify-end space-x-2 mt-2">
                      <button
                        onClick={() => onStatusChange?.(appointment.id, 'completed', appointment.clientId)}
                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => onStatusChange?.(appointment.id, 'cancelled', appointment.clientId)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {appointments.length === 0 && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Calendar size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            There are no appointments scheduled at the moment.
          </p>
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {viewingAppointment && (
        <AppointmentDetailsModal
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
        />
      )}
    </div>
  );
};
