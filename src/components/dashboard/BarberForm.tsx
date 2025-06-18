import { useState, useEffect } from 'react';
import { Barber } from '@/lib/types';
import { X, Eye, EyeOff } from 'lucide-react';

interface BarberFormProps {
  barber?: Barber | null;
  onSubmit: (barber: Barber) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const defaultBarber: Barber = {
  id: '',
  name: '',
  email: '',
  phone: '',
  specialty: '',
  bio: '',
  photoUrl: '',
  joinDate: new Date().toISOString().split('T')[0],
  totalCuts: 0,
  appointmentCuts: 0,
  walkInCuts: 0,
  commissionRate: 50, // Default 50%
  totalCommission: 0,
  active: true,
  password: '',
  age: 0
};

import { supabase } from '@/lib/supabase/supabase';
import { Loader2 } from 'lucide-react';

const BarberForm = ({ barber, onSubmit, onCancel, isSubmitting = false }: BarberFormProps) => {
  const isEditing = Boolean(barber);
  const [form, setForm] = useState<Barber>(barber || defaultBarber);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState("");

  useEffect(() => {
    if (barber) {
      setForm(barber);
    }
  }, [barber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle numeric inputs
    if (type === 'number') {
      setForm({
        ...form,
        [name]: parseFloat(value)
      });
    } else if (name === 'active') {
      // Handle checkbox for active status
      const checkbox = e.target as HTMLInputElement;
      setForm({
        ...form,
        active: checkbox.checked
      });
    } else {
      // Handle text inputs
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (form.commissionRate < 0 || form.commissionRate > 100) {
      newErrors.commissionRate = 'Commission rate must be between 0 and 100';
    }
    
    // Password validation
    if (!isEditing && !form.password) {
      newErrors.password = 'Password is required for new barbers';
    }
    
    if (form.password && form.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Generate ID if it's a new barber
    const submittedBarber: Barber = {
      ...form,
      id: form.id || `barber-${Date.now()}`
    };

    onSubmit(submittedBarber);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? `Edit ${barber?.name}` : 'Add New Barber'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                min="18"
                max="100"
                value={form.age || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Password Section */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  placeholder={isEditing ? "Leave blank to keep current password" : ""}
                  className={`mt-1 block w-full border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 mt-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isEditing ? "Leave blank to keep current password" : ""}
                className={`mt-1 block w-full border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={form.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            {/* Specialty */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <input
                type="text"
                name="specialty"
                id="specialty"
                value={form.specialty || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            {/* Join Date */}
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
                Join Date
              </label>
              <input
                type="date"
                name="joinDate"
                id="joinDate"
                value={form.joinDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            {/* Commission Rate */}
            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">
                Commission Rate (%)
              </label>
              <input
                type="number"
                name="commissionRate"
                id="commissionRate"
                min="0"
                max="100"
                value={form.commissionRate}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.commissionRate ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
              />
              {errors.commissionRate && <p className="mt-1 text-sm text-red-600">{errors.commissionRate}</p>}
            </div>

            {/* Photo Upload and URL */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">
                Photo (URL or Upload)
              </label>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                  type="text"
                  name="photoUrl"
                  id="photoUrl"
                  value={form.photoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingPhoto(true);
                    setPhotoUploadError("");
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `barber-${Date.now()}.${fileExt}`;
                      const { data, error } = await supabase.storage.from('barber-images').upload(fileName, file, { upsert: true });
                      if (error) throw error;
                      const { data: urlData } = await supabase.storage.from('barber-images').getPublicUrl(fileName);
                      setForm((prev) => ({ ...prev, photoUrl: urlData?.publicUrl || "" }));
                    } catch (err: any) {
                      setPhotoUploadError(err.message || 'Error uploading image');
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                  className="mt-1 block"
                />
              </div>
              {uploadingPhoto && (
                <div className="text-amber-600 text-xs mt-1 flex items-center gap-1"><Loader2 className="animate-spin h-4 w-4" /> Uploading...</div>
              )}
              {photoUploadError && (
                <div className="text-red-600 text-xs mt-1">{photoUploadError}</div>
              )}
              {form.photoUrl && (
                <div className="mt-2"><img src={form.photoUrl} alt="Barber" className="h-24 w-24 object-cover rounded" /></div>
              )}
            </div>

            {/* Bio */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                rows={3}
                value={form.bio || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>

            {/* Active Status */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active (available for booking)
                </label>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics</h3>
            <p className="text-sm text-gray-500 italic mb-4">
              These statistics are automatically calculated and cannot be directly edited.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Cuts</p>
                <p className="text-lg font-bold">{form.totalCuts}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Appointments</p>
                <p className="text-lg font-bold">{form.appointmentCuts}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Walk-ins</p>
                <p className="text-lg font-bold">{form.walkInCuts}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-700">Total Commission</p>
                <p className="text-lg font-bold text-amber-700">₺{form.totalCommission}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Barber' : 'Add Barber'}
          </button>
          {isEditing && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the password?')) {
                  setForm({...form, password: 'temp123'});
                  setConfirmPassword('temp123');
                  setShowPassword(true);
                  alert('Password has been set to a temporary value. Please submit to save changes.');
                }
              }}
              className="py-2 px-4 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Reset Password
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BarberForm;
