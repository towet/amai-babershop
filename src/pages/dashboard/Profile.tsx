import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { Barber } from '@/lib/types';
import { getBarberById, updateBarber } from '@/lib/services/barber-service';
import { Camera, Scissors, ChevronRight, PiggyBank, Calendar, Award, Loader2, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialty: '',
  });
  const [barberData, setBarberData] = useState<Barber | null>(null);

  const renderStarRating = (rating: number, starSize: number = 5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = typeof rating === 'number' && !isNaN(rating) && rating % 1 >= 0.25 && rating % 1 < 0.75; 
    const effectivelyFullStars = Math.round(rating); // Use Math.round for display simplicity

    for (let i = 0; i < effectivelyFullStars; i++) {
      stars.push(
        <Star key={`full-${i}-${Math.random()}`} className={`w-${starSize} h-${starSize} fill-amber-500 text-amber-500`} />
      );
    }

    const emptyStarsCount = 5 - effectivelyFullStars;
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <Star key={`empty-${effectivelyFullStars + i}-${Math.random()}`} className={`w-${starSize} h-${starSize} text-gray-300`} />
      );
    }
    return <div className="flex items-center">{stars} <span className="ml-1 text-sm text-gray-600">({rating && typeof rating === 'number' && !isNaN(rating) ? rating.toFixed(1) : 'N/A'})</span></div>;
  };

  
  useEffect(() => {
    // Load user data
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        phone: '',
        bio: '',
        specialty: '',
      });
      
      loadBarberData();
    }
  }, [user]);
  
  const loadBarberData = async () => {
    // If user is a barber, load barber-specific data
    if (user?.role === 'barber' && user.barberId) {
      setLoading(true);
      try {
        const barber = await getBarberById(user.barberId);
        if (barber) {
          setBarberData(barber);
          setUserData(prev => ({
            ...prev,
            phone: barber.phone || '',
            bio: barber.bio || '',
            specialty: barber.specialty || '',
          }));
        }
      } catch (error) {
        console.error('Error loading barber data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (user?.role === 'barber' && user.barberId && barberData) {
        // Update barber profile in Supabase
        await updateBarber(user.barberId, {
          name: userData.name,
          phone: userData.phone,
          bio: userData.bio,
          specialty: userData.specialty,
        });
        
        // Reload barber data to get the updated information
        await loadBarberData();
        
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
      } else {
        // For non-barber users, we would update their profile
        // This could be implemented later when we have a user service
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        
        {loading && (
          <div className="flex items-center space-x-2 text-amber-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading profile data...</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <Card className="col-span-2 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              {/* Profile Image */}
              <div className="flex-shrink-0 relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
                  {user?.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <span className="text-3xl text-white font-bold">
                      {user?.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-500">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
                {user?.role === 'barber' && barberData && barberData.rating !== undefined && (
                  <div className="mt-2 flex items-center">
                    {renderStarRating(barberData.rating, 5)} 
                  </div>
                )}
                
                {user?.role === 'barber' && barberData && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {barberData.specialty && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        {barberData.specialty}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Joined {new Date(barberData.joinDate).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {barberData.commissionRate}% Commission
                    </span>
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  {user?.role === 'barber' && (
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input 
                        id="specialty"
                        name="specialty"
                        value={userData.specialty}
                        onChange={handleInputChange}
                        placeholder="Your barbering specialty"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Email</h3>
                    <p>{userData.email}</p>
                  </div>
                  
                  {userData.phone && (
                    <div>
                      <h3 className="font-medium text-gray-500">Phone</h3>
                      <p>{userData.phone}</p>
                    </div>
                  )}
                  
                  {userData.specialty && (
                    <div>
                      <h3 className="font-medium text-gray-500">Specialty</h3>
                      <p>{userData.specialty}</p>
                    </div>
                  )}
                </div>
                
                {userData.bio && (
                  <div>
                    <h3 className="font-medium text-gray-500">Bio</h3>
                    <p className="mt-1 text-gray-800">{userData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Approved Reviews Section for Barbers */} 
          {user?.role === 'barber' && barberData && barberData.reviews && (
            <Card className="mt-6 p-6 shadow-sm col-span-1 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">My Approved Reviews</h3>
              {(() => {
                const approvedReviews = barberData.reviews.filter(review => review.approved);
                if (approvedReviews.length > 0) {
                  return (
                    <div className="space-y-4">
                      {approvedReviews.map(review => (
                        <div key={review.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            {renderStarRating(review.rating, 4)}
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date N/A'}
                            </span>
                          </div>
                          {review.clientName && (
                            <p className="text-sm font-semibold text-gray-700">{review.clientName}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return <p className="text-gray-500">You have no approved reviews yet.</p>;
                }
              })()}
            </Card>
          )}
          
          {/* Additional Information for Barbers */}
          {user?.role === 'barber' && barberData && (
            <div className="col-span-1 space-y-5">
              {/* Commission Data */}
              <Card className="p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-amber-500" />
                    Commission
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission Rate</span>
                    <span className="font-medium">{barberData.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Commission</span>
                    <span className="font-medium">₺{barberData.totalCommission}</span>
                  </div>
                </div>
              </Card>
              
              {/* Performance Stats */}
              <Card className="p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-500" />
                    Performance
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cuts</span>
                    <span className="font-medium">{barberData.totalCuts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Appointments</span>
                    <span className="font-medium">{barberData.appointmentCuts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Walk-ins</span>
                    <span className="font-medium">{barberData.walkInCuts}</span>
                  </div>
                </div>
              </Card>
              
              {/* Experience */}
              <Card className="p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Experience
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Join Date</span>
                    <span className="font-medium">{new Date(barberData.joinDate).toLocaleDateString()}</span>
                  </div>
                  {barberData.rating && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-medium flex items-center">
                        <Award className="w-4 h-4 text-amber-500 mr-1" />
                        {barberData.rating}/5
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
