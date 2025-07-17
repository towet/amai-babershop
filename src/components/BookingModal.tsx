import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, User, Mail, Phone, Scissors, Star, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllBarbersAvailability, getAvailableTimeSlotsForBarber, BarberAvailability } from "@/lib/services/booking-service";
import { createPublicAppointment } from "@/lib/services/booking-api"; // Import the new secure API
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getAllServices } from "@/lib/services/service-service";
import { toast } from "@/components/ui/use-toast";
import { getAllBarbers } from "@/lib/services/barber-service";
import { Barber, Service } from "@/lib/types";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    service: "",
    barber: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
  });

  const [barberAvailability, setBarberAvailability] = useState<BarberAvailability[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [conflictingBarbers, setConflictingBarbers] = useState<string[]>([]);
  const [alternativeBarbers, setAlternativeBarbers] = useState<Barber[]>([]);
  
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBarberProfiles, setShowBarberProfiles] = useState(false);

  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Load data when modal opens
      loadInitialData();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load services
      const servicesData = await getAllServices();
      setServices(servicesData);
      
      // Load barbers
      const barbersData = await getAllBarbers();
      setBarbers(barbersData.filter(barber => barber.active)); // Only show active barbers
      
      // Load barber availability
      const allBarbersAvailability = await getAllBarbersAvailability();
      setBarberAvailability(allBarbersAvailability);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update formData when calendar date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      // Check for barber availability on this date
      if (selectedBarberId) {
        // Use an immediate async function inside the effect to handle the Promise
        const fetchTimeSlots = async () => {
          try {
            const slots = await getAvailableTimeSlotsForBarber(selectedBarberId, formattedDate);
            setAvailableTimeSlots(slots);
          } catch (error) {
            console.error('Error getting time slots:', error);
            setAvailableTimeSlots([]);
          }
        };
        
        fetchTimeSlots();
      }
    }
  }, [selectedDate, selectedBarberId]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Update available time slots when date or barber changes
    if (name === 'date' && selectedBarberId) {
      try {
        const slots = await getAvailableTimeSlotsForBarber(selectedBarberId, value);
        setAvailableTimeSlots(slots); // This is fine because we're awaiting the result
      } catch (error) {
        console.error('Error getting time slots:', error);
        setAvailableTimeSlots([]);
        toast({
          title: "Error",
          description: "Failed to get available time slots. Please try again.",
          variant: "destructive"
        });
      }
    } else if (name === 'barber') {
      // Extract barber ID from selection (format: "barber_id:barber_name")
      const barberId = value.split(':')[0];
      setSelectedBarberId(barberId);
      
      if (formData.date) {
        try {
          const slots = await getAvailableTimeSlotsForBarber(barberId, formData.date);
          setAvailableTimeSlots(slots); // This is fine because we're awaiting the result
        } catch (error) {
          console.error('Error getting time slots:', error);
          setAvailableTimeSlots([]);
        }
      }
    } else if (name === 'service') {
      // Extract service ID from selection (format: "service_id:service_name")
      const serviceId = value.split(':')[0];
      setSelectedServiceId(serviceId);
    } else if (name === 'time' && selectedBarberId && formData.date) {
      // Removed the call to checkForAlternativeBarbers
    }
  };

  // Removed the checkForAlternativeBarbers function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Extract barber ID from the form data (format: "barber_id:barber_name")
      const barberId = formData.barber.split(':')[0];
      
      // Find the selected service to get price and duration
      const selectedService = services.find(s => s.id === selectedServiceId);
      
      if (!selectedService) {
        throw new Error('Selected service not found');
      }
      
      // Create the appointment using the secure API
      await createPublicAppointment({
        clientId: 'guest', // Since we don't have a client account system yet
        barberId: barberId,
        serviceId: selectedServiceId,
        date: formData.date,
        time: formData.time,
        status: 'scheduled',
        type: 'appointment',
        price: selectedService.price,
        duration: selectedService.duration,
        commissionAmount: 0, // Will be calculated by the service
        notes: `Client: ${formData.name}, Email: ${formData.email}, Phone: ${formData.phone}`,
        walkInClientName: formData.name // Store the client name for guests
      });
      
      // Show success message
      setIsSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setCurrentStep(1);
        setFormData({
          service: "",
          barber: "",
          date: "",
          time: "",
          name: "",
          email: "",
          phone: "",
        });
      }, 3000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // Show a more specific error message
      let errorMessage = "There was a problem creating your appointment. Please try again.";
      if (error && typeof error === 'object' && 'message' in error) {
        // Debug: log the error object
        // eslint-disable-next-line no-console
        console.error('Booking error object:', error);
        if (
          error.message && error.message.includes('This barber is already booked for the selected time')
        ) {
          errorMessage = 'This barber is already booked for the selected time. Please select a different time slot.';
        } else {
          errorMessage = `Booking failed: ${error.message}`;
        }
      } else {
        // Show the raw error for debugging
        errorMessage = `Raw error: ${JSON.stringify(error)}`;
      }
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // The services and barbers are now loaded dynamically from Supabase
  // Services and barbers state variables were defined above

  // Generate time slots from 10:00 to 22:00 (last appointment at 22:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 10; i <= 22; i++) {
      slots.push(`${i}:00`);
      if (i < 22) slots.push(`${i}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate dates for the next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    
    return dates;
  };

  const dates = generateDates();

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-md z-10 max-h-[90vh] sm:max-h-[85vh]"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-colors duration-200 z-10"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Book Your Appointment</h2>
              <p className="text-white/80 mt-1">Experience premium grooming at Amai Men's Care</p>
            </div>

            {/* Form */}
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-300">
                    Your appointment has been scheduled successfully. We'll send a confirmation to your email shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm font-medium">Select Service</label>
                        <div className="relative">
                          <select
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                          >
                            <option value="" disabled className="bg-gray-800">
                              Choose a service
                            </option>
                            {services.map((service) => (
                              <option 
                                key={service.id} 
                                value={`${service.id}:${service.name}`} 
                                className="bg-gray-800"
                                onClick={() => setSelectedServiceId(service.id)}
                              >
                                {service.name} - {service.duration} - {service.price.toLocaleString()} Lira
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <Scissors className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-gray-300 text-sm font-medium">Select Barber</label>
                          <button 
                            type="button"
                            onClick={() => setShowBarberProfiles(!showBarberProfiles)}
                            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            {showBarberProfiles ? 'Hide barber profiles' : 'View barber profiles'}
                          </button>
                        </div>
                        
                        {showBarberProfiles && (
                          <div className="grid grid-cols-1 gap-4 my-4 max-h-64 overflow-y-auto pr-2">
                            {barbers.map((barber) => (
                              <div 
                                key={barber.id}
                                className="bg-gray-800/70 rounded-lg p-4 flex gap-3 border border-gray-700"
                              >
                                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                                  <img 
                                    src={barber.photoUrl} 
                                    alt={barber.name}
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.jpg';
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">{barber.name}</h4>
                                  <p className="text-gray-400 text-sm">{barber.specialty}</p>
                                  <div className="flex items-center mt-1">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          size={14} 
                                          className={i < Math.round(barber.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-gray-400 text-xs ml-1">{barber.rating.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="relative">
                          <select
                            name="barber"
                            value={formData.barber}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                          >
                            <option value="" disabled className="bg-gray-800">
                              Choose a barber
                            </option>
                            {barbers.map((barber) => (
                              <option key={barber.id} value={`${barber.id}:${barber.name}`} className="bg-gray-800">
                                {barber.name} {barber.specialty ? `- ${barber.specialty}` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm font-medium">Select Date</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCalendarOpen(!calendarOpen)}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white text-left flex justify-between items-center focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                          >
                            <span>
                              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Choose a date'}
                            </span>
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                          </button>
                          
                          {calendarOpen && (
                            <div className="absolute z-50 mt-1 bg-gray-900 border border-gray-700 rounded-lg p-1 sm:p-2 shadow-lg left-0 right-0 md:left-auto md:right-auto">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date);
                                  setCalendarOpen(false);
                                }}
                                disabled={{
                                  before: new Date(),
                                }}
                                className="bg-gray-900 text-white scale-[0.85] sm:scale-100 origin-top"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 text-sm font-medium">Select Time</label>
                        
                        {selectedBarberId && formData.date ? (
                          availableTimeSlots.length > 0 ? (
                            <div className="space-y-4">
                              {/* Conflict notification */}
                              {formData.time && !availableTimeSlots.includes(formData.time) && (
                                <div className="p-3 sm:p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg mb-3 sm:mb-4">
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-amber-400 text-xs sm:text-sm font-medium mb-2">
                                        {barbers.find(b => b.id === selectedBarberId)?.name || 'This barber'} is already booked at this time.
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <button
                                          type="button"
                                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors border border-gray-700"
                                          onClick={() => {
                                            setFormData(prev => ({
                                              ...prev,
                                              time: ""
                                            }));
                                          }}
                                        >
                                          Choose different time
                                        </button>
                                        <button
                                          type="button"
                                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors border border-gray-700"
                                          onClick={() => {
                                            setSelectedDate(undefined);
                                            setFormData(prev => ({
                                              ...prev,
                                              date: "",
                                              time: ""
                                            }));
                                          }}
                                        >
                                          Choose different date
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Time selection dropdown */}
                              <div className="relative">
                                <select
                                  name="time"
                                  value={formData.time}
                                  onChange={handleChange}
                                  required
                                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                                >
                                  <option value="" disabled className="bg-gray-800">
                                    Choose a time
                                  </option>
                                  {availableTimeSlots.map((time, index) => (
                                    <option key={index} value={time} className="bg-gray-800">
                                      {time}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <Clock className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-amber-500 text-sm">
                              No available time slots for the selected barber on this date. Please choose another date or barber.
                            </div>
                          )
                        ) : (
                          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 text-sm">
                            Please select a barber and date first to see available time slots.
                          </div>
                        )}
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                        >
                          <span>Next</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Your Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-gray-800/50 border border-gray-700 w-full py-2 pl-8 sm:pl-10 pr-3 rounded-md text-white text-sm sm:text-base placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                            placeholder="John Doe"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-gray-800/50 border border-gray-700 w-full py-2 pl-8 sm:pl-10 pr-3 rounded-md text-white text-sm sm:text-base placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                            placeholder="john.doe@example.com"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Phone Number</label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="bg-gray-800/50 border border-gray-700 w-full py-2 pl-8 sm:pl-10 pr-3 rounded-md text-white text-sm sm:text-base placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                            placeholder="+1 (123) 456-7890"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <Phone className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
                        <h3 className="text-white font-medium mb-2">Appointment Summary</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li className="flex justify-between">
                            <span>Service:</span>
                            <span className="text-amber-400">{formData.service}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Barber:</span>
                            <span className="text-amber-400">{formData.barber}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Date:</span>
                            <span className="text-amber-400">
                              {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>Time:</span>
                            <span className="text-amber-400">{formData.time}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3 sm:space-y-4 pt-2">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-700 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none transition duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm Booking</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
