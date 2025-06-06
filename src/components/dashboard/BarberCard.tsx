import { useState } from 'react';
import { Barber } from '@/lib/types';
import { Scissors, Calendar, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarberProfileModal from './BarberProfileModal';

interface BarberCardProps {
  barber: Barber;
}

export const BarberCard = ({ barber }: BarberCardProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const calculateAppointmentPercentage = () => {
    if (barber.totalCuts === 0) return 0;
    return Math.round((barber.appointmentCuts / barber.totalCuts) * 100);
  };

  const calculateWalkInPercentage = () => {
    if (barber.totalCuts === 0) return 0;
    return Math.round((barber.walkInCuts / barber.totalCuts) * 100);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="relative h-32 bg-gradient-to-r from-gray-800 to-black">
          {/* Status indicator */}
          <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
            barber.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {barber.active ? 'Active' : 'Inactive'}
          </div>
          
          {/* Profile photo */}
          <div className="absolute -bottom-10 left-6">
            <div className="h-20 w-20 rounded-full border-4 border-white bg-amber-100 flex items-center justify-center overflow-hidden">
              {barber.photoUrl ? (
                <img 
                  src={barber.photoUrl} 
                  alt={barber.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-amber-600 text-3xl font-bold">
                  {barber.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-12 pb-6 px-6">
          <h3 className="text-xl font-semibold text-gray-900">{barber.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{barber.specialty || 'Barber'}</p>
          
          {/* Rating display */}
          {barber.rating && (
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${star <= Math.round(barber.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-500">({barber.rating.toFixed(1)})</span>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">Total Cuts</span>
              <span className="text-2xl font-bold text-gray-900">{barber.totalCuts}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">Commission</span>
              <span className="text-2xl font-bold text-gray-900">₺{barber.totalCommission}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Appointments ({barber.appointmentCuts})</span>
                <span className="text-blue-600 font-medium">{calculateAppointmentPercentage()}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${calculateAppointmentPercentage()}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Walk-ins ({barber.walkInCuts})</span>
                <span className="text-amber-600 font-medium">{calculateWalkInPercentage()}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${calculateWalkInPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="py-2 px-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors duration-200 text-center"
            >
              View Profile
            </button>
            <Link 
              to={`/dashboard/appointments?barber=${barber.id}`}
              className="py-2 px-3 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Calendar size={14} />
              <span>Appointments</span>
            </Link>
          </div>
        </div>
      </div>
    
      {showProfileModal && (
        <BarberProfileModal
          barber={barber}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};
