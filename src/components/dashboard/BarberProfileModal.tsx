import { useState } from 'react';
import { Barber } from '@/lib/types';
import { X, Scissors, Calendar, Star, DollarSign, Clock, Users, Info, Mail, Phone, MessageSquare } from 'lucide-react';

interface BarberProfileModalProps {
  barber: Barber;
  onClose: () => void;
}

const BarberProfileModal = ({ barber, onClose }: BarberProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'reviews'>('profile');

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= Math.round(rating)
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Barber Profile
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-50 to-white border-b">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {barber.photoUrl ? (
                <img src={barber.photoUrl} alt={barber.name} className="h-full w-full object-cover" />
              ) : (
                <Scissors size={32} className="text-gray-400" />
              )}
            </div>
            {barber.active ? (
              <span className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
            ) : (
              <span className="absolute bottom-0 right-0 h-5 w-5 bg-gray-500 rounded-full border-2 border-white" />
            )}
          </div>
          <h3 className="mt-4 text-xl font-bold">{barber.name}</h3>
          <p className="text-sm text-gray-500">{barber.specialty || 'Master Barber'}</p>
          
          {barber.rating && (
            <div className="mt-2">
              {renderStarRating(barber.rating)}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${barber.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {barber.active ? 'Active' : 'Inactive'}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
              {barber.commissionRate}% Commission
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'profile'
                ? 'text-black border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'stats'
                ? 'text-black border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'reviews'
                ? 'text-black border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium flex items-center">
                    <Info className="mr-2" size={18} />
                    Personal Information
                  </h4>
                  
                  <div className="space-y-2">
                    {barber.age && (
                      <div className="flex items-start">
                        <span className="text-sm font-medium w-24">Age:</span>
                        <span>{barber.age} years</span>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Join Date:</span>
                      <span>{new Date(barber.joinDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Specialty:</span>
                      <span>{barber.specialty || 'General'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium flex items-center">
                    <Mail className="mr-2" size={18} />
                    Contact Information
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Email:</span>
                      <span>{barber.email}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Phone:</span>
                      <span>{barber.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {barber.bio && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Biography</h4>
                  <p className="text-sm text-gray-600">{barber.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-3">
                    <Scissors size={20} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Total Haircuts</p>
                  <p className="text-xl font-bold">{barber.totalCuts}</p>
                </div>
                
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-3">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">Appointments</p>
                  <p className="text-xl font-bold">{barber.appointmentCuts}</p>
                </div>
                
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mb-3">
                    <Users size={20} className="text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-500">Walk-ins</p>
                  <p className="text-xl font-bold">{barber.walkInCuts}</p>
                </div>
                
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mb-3">
                    <DollarSign size={20} className="text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500">Commission</p>
                  <p className="text-xl font-bold">₺{barber.totalCommission.toLocaleString()}</p>
                </div>
              </div>

              {/* Performance Charts (placeholder) */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Monthly Performance</h4>
                <div className="h-64 bg-gray-50 rounded-lg border flex items-center justify-center">
                  <p className="text-gray-400">Performance charts will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Client Reviews</h4>
                {/* Overall rating is displayed at the top of the modal, 
                    but if needed here for context, ensure barber.rating is the approved one */}
                {typeof barber.rating === 'number' && barber.rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Overall Approved Rating:</span>
                    {renderStarRating(barber.rating)}
                  </div>
                )}
              </div>

              {barber.reviews && barber.reviews.length > 0 ? (
                <div className="space-y-4">
                  {barber.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {renderStarRating(review.rating)}
                          <span className={`ml-3 px-2.5 py-0.5 text-xs font-semibold rounded-full ${ 
                            review.approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800' 
                          }`}>
                            {review.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date N/A'}
                        </span>
                      </div>
                      {review.clientName && (
                        <p className="text-sm font-semibold text-gray-700 mb-1">{review.clientName}</p>
                      )}
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">No reviews available for this barber yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarberProfileModal;
