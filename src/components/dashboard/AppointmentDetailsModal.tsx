import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types';
import { X, Calendar, Clock, User, Scissors, DollarSign, FileText } from 'lucide-react';
import { getClientById } from '@/lib/services/client-service';
import { getBarberById } from '@/lib/services/barber-service';
import { getServiceById } from '@/lib/services/service-service';
import { Client, Barber, Service } from '@/lib/types';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

const AppointmentDetailsModal = ({ appointment, onClose }: AppointmentDetailsModalProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Client
        if (appointment.clients && 'totalVisits' in appointment.clients) {
          setClient(appointment.clients as Client); // It's a full client object
        } else if (appointment.clientId) {
          const clientData = await getClientById(appointment.clientId);
          setClient(clientData);
        } else {
          setClient(null); // No client info available
        }

        // Barber
        if (appointment.barbers && 'email' in appointment.barbers) { // 'email' is a good indicator of a full Barber object
          setBarber(appointment.barbers as Barber);
        } else if (appointment.barberId) {
          const barberData = await getBarberById(appointment.barberId);
          setBarber(barberData);
        } else {
          setBarber(null); // No barber info available
        }

        // Service
        // The partial 'services' type in Appointment already has all fields of the 'Service' type
        if (appointment.services) {
          setService(appointment.services as Service);
        } else if (appointment.serviceId) {
          const serviceData = await getServiceById(appointment.serviceId);
          setService(serviceData);
        } else {
          setService(null); // No service info available
        }

      } catch (error) {
        console.error("Error fetching details for modal:", error);
        setClient(null);
        setBarber(null);
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointment]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'appointment' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto my-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Appointment Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto max-h-[70vh] sm:max-h-[80vh]">
          {/* Status and Type */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
              {appointment.type === 'appointment' ? 'Appointment' : 'Walk-in'}
            </span>
          </div>
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Client Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="inline mr-2" size={18} />
                Client Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {appointment.type === 'walk-in' && appointment.walkInClientName ? (
                  <div className="space-y-2">
                    <p className="font-medium">Name: {appointment.walkInClientName}</p>
                    <p className="text-sm text-gray-500">Walk-in client</p>
                  </div>
                ) : client ? (
                  <div className="space-y-2">
                    <p className="font-medium">Name: {client.name}</p>
                    <p className="text-sm">Phone: {client.phone || 'Not provided'}</p>
                    <p className="text-sm">Email: {client.email || 'Not provided'}</p>
                    <p className="text-sm">Visits: {client.totalVisits}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{loading ? 'Loading client...' : 'Client information not available'}</p>
                )}
              </div>
            </div>

            {/* Barber Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Scissors className="inline mr-2" size={18} />
                Barber Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {barber ? (
                  <div className="space-y-2">
                    <p className="font-medium">Name: {barber.name}</p>
                    <p className="text-sm">Specialty: {barber.specialty || 'General'}</p>
                    {barber.rating && (
                      <p className="text-sm">Rating: {barber.rating.toFixed(1)} ★</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{loading ? 'Loading barber...' : 'Barber information not available'}</p>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="inline mr-2" size={18} />
                Service Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {service ? (
                  <div className="space-y-2">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm">Duration: {service.duration} min</p>
                    <p className="text-sm">Price: ₺{service.price.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{loading ? 'Loading service...' : 'Service information not available'}</p>
                )}
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="inline mr-2" size={18} />
                Schedule Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="font-medium">Date: {new Date(appointment.date).toLocaleDateString()}</p>
                  <p className="text-sm">Time: {appointment.time}</p>
                  <p className="text-sm">Duration: {appointment.duration} min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="inline mr-2" size={18} />
              Financial Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">₺{appointment.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Barber Commission</p>
                  <p className="font-medium">₺{appointment.commissionAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 sm:p-6 border-t">
          <button
            onClick={onClose}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
