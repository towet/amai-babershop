import { useState, useEffect } from 'react';
import { toast } from '../ui/use-toast';
import { Appointment } from '@/lib/types';
import { X, Loader2 } from 'lucide-react';
import { getAllClients } from '@/lib/services/client-service';
import { getAllBarbers } from '@/lib/services/barber-service';
import { getAllServices } from '@/lib/services/service-service';

interface WalkInFormProps {
  onSubmit: (walkIn: Appointment) => void;
  onCancel: () => void;
}

const defaultWalkIn: Appointment = {
  id: '',
  clientId: '',
  barberId: '',
  serviceId: '',
  date: new Date().toISOString().split('T')[0], // Today's date
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), // Current time
  status: 'scheduled',
  type: 'walk-in',
  duration: 60,
  price: 0,
  commissionAmount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const WalkInForm = ({ onSubmit, onCancel }: WalkInFormProps) => {
  const [form, setForm] = useState<Appointment>(defaultWalkIn);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch clients, barbers, and services
        const [clientsData, barbersData, servicesData] = await Promise.all([
          getAllClients(),
          getAllBarbers(),
          getAllServices()
        ]);
        
        setClients(clientsData);
        setBarbers(barbersData.filter(barber => barber.active));
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // When service changes, update price and duration in the form
    if (selectedService) {
      const price = selectedService.price;
      const duration = selectedService.duration;
      const commissionAmount = selectedBarber ? (price * selectedBarber.commission_rate) / 100 : 0;
      
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
      const commissionAmount = (selectedService.price * selectedBarber.commission_rate) / 100;
      
      setForm(prev => ({
        ...prev,
        barberId: selectedBarber.id,
        commissionAmount
      }));
    }
  }, [selectedBarber, selectedService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: value
    });

    // Special handling for service and barber selection
    if (name === 'serviceId') {
      const service = services.find(s => s.id === value);
      setSelectedService(service);
    }
    
    if (name === 'barberId') {
      const barber = barbers.find(b => b.id === value);
      setSelectedBarber(barber);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!form.barberId) {
      newErrors.barberId = 'Barber is required';
    }

    if (!form.serviceId) {
      newErrors.serviceId = 'Service is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submittedWalkIn: Appointment = {
      ...form,
      type: 'walk-in',
      updatedAt: new Date().toISOString()
    };

    try {
      await onSubmit(submittedWalkIn);
    } catch (error) {
      let errorMessage = 'There was a problem creating this walk-in appointment. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        if (
          error.message === 'This barber is already booked for the selected time. Please choose a different time.'
        ) {
          errorMessage = 'This barber is already booked for the selected time. Please select a different time slot.';
        } else {
          errorMessage = `Booking failed: ${error.message}`;
        }
      }
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Available barbers are already filtered in the useEffect

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Record Walk-in</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={18} className="md:hidden" />
          <X size={20} className="hidden md:block" />
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center my-3 md:my-4">
          <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-amber-600" />
          <span className="ml-2 text-xs md:text-sm text-gray-600">Loading...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Walk-in Information */}
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Client Selection */}
            <div>
              <label htmlFor="clientId" className="block text-xs md:text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="clientId"
                id="clientId"
                value={form.clientId}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.phone && `(${client.phone})`}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.clientId}</p>}
            </div>

            {/* Barber Selection */}
            <div>
              <label htmlFor="barberId" className="block text-xs md:text-sm font-medium text-gray-700">
                Barber <span className="text-red-500">*</span>
              </label>
              <select
                name="barberId"
                id="barberId"
                value={form.barberId}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.barberId ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              >
                <option value="">Select a barber</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} {barber.specialty && `(${barber.specialty})`}
                  </option>
                ))}
              </select>
              {errors.barberId && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.barberId}</p>}
            </div>

            {/* Service Selection */}
            <div>
              <label htmlFor="serviceId" className="block text-xs md:text-sm font-medium text-gray-700">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceId"
                id="serviceId"
                value={form.serviceId}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.serviceId ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (₺{service.price} - {service.duration} min)
                  </option>
                ))}
              </select>
              {errors.serviceId && <p className="mt-1 text-xs md:text-sm text-red-600">{errors.serviceId}</p>}
            </div>
          </div>

          {/* Pricing and Duration Info */}
          {selectedService && (
            <div className="bg-gray-50 p-3 md:p-4 rounded-md mt-3 md:mt-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
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
                    <p className="text-sm text-gray-500">Barber Commission ({selectedBarber.commission_rate}%)</p>
                    <p className="text-lg font-semibold text-amber-600">
                      ₺{(selectedService.price * selectedBarber.commission_rate / 100).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-xs md:text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={form.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="Any special requests or notes about this walk-in"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-xs md:text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Record Walk-in
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalkInForm;
