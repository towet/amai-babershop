import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType } from '@/lib/types';
import { X, Trash2, Loader2 } from 'lucide-react';
import { getAllBarbers } from '@/lib/services/barber-service';
import { getAllServices } from '@/lib/services/service-service';
import { getAllClients } from '@/lib/services/client-service';
import { Barber, Service, Client } from '@/lib/types';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (appointment: Appointment) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const defaultAppointment: Appointment = {
  id: '',
  clientId: '',
  barberId: '',
  serviceId: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  status: 'scheduled',
  type: 'appointment',
  duration: 60,
  price: 0,
  commissionAmount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  walkInClientName: '' // New field for walk-in clients
};

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 10; i <= 22; i++) {
    slots.push(`${i}:00`);
    if (i < 22) slots.push(`${i}:30`);
  }
  return slots;
};

const AppointmentForm = ({ appointment, onSubmit, onCancel, onDelete }: AppointmentFormProps) => {
  const [liveBarbers, setLiveBarbers] = useState<Barber[]>([]);
  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [liveClients, setLiveClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(appointment);
  const [form, setForm] = useState<Appointment>(appointment || defaultAppointment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<Barber | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(form.type === 'walk-in');

  // Generate time slots for appointment
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [barbersData, servicesData, clientsData] = await Promise.all([
          getAllBarbers(),
          getAllServices(),
          getAllClients()
        ]);
        setLiveBarbers(barbersData);
        setLiveServices(servicesData);
        setLiveClients(clientsData);

        // Initialize selectedBarber and selectedService if appointment data is present
        if (appointment) {
          setSelectedService(servicesData.find(s => s.id === appointment.serviceId));
          setSelectedBarber(barbersData.find(b => b.id === appointment.barberId));
        } else {
            // Set default selected barber and service if creating a new appointment and data is available
            if (servicesData.length > 0 && !form.serviceId) {
                setSelectedService(servicesData[0]);
                setForm(prev => ({...prev, serviceId: servicesData[0].id})); 
            }
            if (barbersData.length > 0 && !form.barberId) {
                setSelectedBarber(barbersData[0]);
                setForm(prev => ({...prev, barberId: barbersData[0].id}));
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error (e.g., show a toast notification)
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointment, form.serviceId, form.barberId]); // Fetch data on mount with dependencies

  useEffect(() => {
    if (appointment && liveServices.length > 0 && liveBarbers.length > 0) {
      setForm(appointment);
      setSelectedService(liveServices.find(s => s.id === appointment.serviceId));
      setSelectedBarber(liveBarbers.find(b => b.id === appointment.barberId));
    }
  }, [appointment]);

  useEffect(() => {
    // When service changes, update price and duration in the form
    if (selectedService) {
      const price = selectedService.price;
      const duration = selectedService.duration;
      const commissionAmount = selectedBarber ? (price * selectedBarber.commissionRate) / 100 : 0;
      
      setForm(prev => ({
        ...prev,
        serviceId: selectedService.id,
        price,
        duration,
        commissionAmount
      }));
    }
  }, [selectedService, selectedBarber]);

  useEffect(() => {
    // When barber changes, update commission in the form
    if (selectedBarber && selectedService) {
      const commissionAmount = (selectedService.price * selectedBarber.commissionRate) / 100;
      
      setForm(prev => ({
        ...prev,
        barberId: selectedBarber.id,
        commissionAmount
      }));
    }
  }, [selectedBarber, selectedService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For select fields that need UUIDs, ensure we're storing proper values
    if (name === 'barberId' || name === 'serviceId' || name === 'clientId') {
      // If value is empty, keep it empty, otherwise use as is (should be a valid UUID from select option)
      setForm({
        ...form,
        [name]: value === '' ? '' : value
      });
    } else {
      // For other fields, store as normal
      setForm({
        ...form,
        [name]: value
      });
    }

    // Handle appointment type change
    if (name === 'type') {
      const newType = value as AppointmentType;
      setIsWalkIn(newType === 'walk-in');
      setForm(prev => ({
        ...prev,
        type: newType,
        clientId: '', // Reset client ID
        walkInClientName: '' // Reset walk-in name
      }));
    }

    // Special handling for service and barber selection
    if (name === 'serviceId') {
      const service = liveServices.find(s => s.id === value);
      setSelectedService(service);
    }
    
    if (name === 'barberId') {
      const barber = liveBarbers.find(b => b.id === value);
      setSelectedBarber(barber);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isWalkIn) {
      if (!form.clientId) { 
        newErrors.clientId = 'For walk-ins, a client must be selected.';
      }
    } else { // Regular appointment
      if (!form.clientId) {
        newErrors.clientId = 'Client is required';
      }
    }

    if (!form.barberId) {
      newErrors.barberId = 'Barber is required';
    }

    if (!form.serviceId) {
      newErrors.serviceId = 'Service is required';
    }

    if (!form.date) {
      newErrors.date = 'Date is required';
    }

    if (!form.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // For new appointments, don't generate an ID - let Supabase handle it
    // For existing appointments, keep the existing ID
    const submittedAppointmentData: Partial<Appointment> = {
      ...form,
      updatedAt: new Date().toISOString()
    };

    // Remove the ID completely for new appointments so Supabase will generate a proper UUID
    if (!isEditing) {
      delete submittedAppointmentData.id;
    }
    
    // Ensure walkInClientName is not sent as it's no longer used for walk-ins via this form
    if (submittedAppointmentData.type === 'walk-in') {
        submittedAppointmentData.walkInClientName = undefined; 
    }

    onSubmit(submittedAppointmentData as Appointment);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? `Edit ${form.type === 'appointment' ? 'Appointment' : 'Walk-in'}` : 'New Appointment'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appointment Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                id="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="appointment">Scheduled Appointment</option>
                <option value="walk-in">Walk-in</option>
              </select>
            </div>

            {/* Client Selection Logic */}
            {isWalkIn ? (
              // Walk-in: Must select an existing client
              <div>
                <label htmlFor="clientIdWalkIn" className="block text-sm font-medium text-gray-700">
                  Client (Walk-in) <span className="text-red-500">*</span>
                </label>
                <select
                  name="clientId" // Name is 'clientId'
                  id="clientIdWalkIn" // Unique ID for the walk-in version
                  value={form.clientId}
                  onChange={handleChange} // Use the main handleChange
                  className={`mt-1 block w-full border ${ 
                    errors.clientId ? 'border-red-300' : 'border-gray-300' // Error display tied to errors.clientId
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                >
                  <option value="">Select client for walk-in</option>
                  {loading ? (
                    <option disabled>Loading clients...</option>
                  ) : liveClients.length === 0 ? (
                    <option disabled>No clients available</option>
                  ) : (
                    liveClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone && `(${client.phone})`}
                      </option>
                    ))
                  )}
                </select>
                {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
              </div>
            ) : (
              // Regular Appointment: Select Client
              <div>
                <label htmlFor="clientIdScheduled" className="block text-sm font-medium text-gray-700">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  name="clientId" // Name is 'clientId'
                  id="clientIdScheduled" // Unique ID for the scheduled version
                  value={form.clientId}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.clientId ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                >
                  <option value="">Select a client</option>
                  {loading ? (
                    <option disabled>Loading clients...</option>
                  ) : liveClients.length === 0 ? (
                    <option disabled>No clients available</option>
                  ) : (
                    liveClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.phone && `(${client.phone})`}
                      </option>
                    ))
                  )}
                </select>
                {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
              </div>
            )}

            {/* Barber Selection */}
            <div>
              <label htmlFor="barberId" className="block text-sm font-medium text-gray-700">
                Barber <span className="text-red-500">*</span>
              </label>
              <select
                name="barberId"
                id="barberId"
                value={form.barberId}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.barberId ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              >
                <option value="">Select a barber</option>
                {liveBarbers
                  .filter(barber => barber.active)
                  .map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name} {barber.specialty && `(${barber.specialty})`}
                    </option>
                  ))}
              </select>
              {errors.barberId && <p className="mt-1 text-sm text-red-600">{errors.barberId}</p>}
            </div>

            {/* Service Selection */}
            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceId"
                id="serviceId"
                value={form.serviceId}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.serviceId ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              >
                <option value="">Select a service</option>
                {liveServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (₺{service.price} - {service.duration} min)
                  </option>
                ))}
              </select>
              {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={form.date}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                id="time"
                value={form.time}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
            </div>
          </div>

          {/* Pricing and Duration Info */}
          {selectedService && (
            <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-md">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{selectedService.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-lg font-semibold text-gray-900">₺{selectedService.price}</p>
              </div>
              {selectedBarber && (
                <div>
                  <p className="text-sm text-gray-500">Barber Commission ({selectedBarber.commissionRate}%)</p>
                  <p className="text-lg font-semibold text-amber-600">
                    ₺{(selectedService.price * selectedBarber.commissionRate / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={form.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder="Any special requests or notes about this appointment..."
            />
          </div>
        </div>

        <div className="flex justify-between space-x-3 pt-4 border-t border-gray-200">
          {isEditing && onDelete && (
            <div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 inline-flex items-center border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600">Confirm delete?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {isEditing ? 'Update' : 'Create'} {form.type === 'appointment' ? 'Appointment' : 'Walk-in'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
