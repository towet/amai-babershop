import { useState, useEffect } from 'react';
import { Client, Barber } from '@/lib/types';
import { X, Loader2 } from 'lucide-react';
import { getAllBarbers } from '@/lib/services/barber-service';


interface ClientFormProps {
  client?: Client | null;
  onSubmit: (client: Omit<Client, 'id'> | Client) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const defaultClient: Client = {
  id: '',
  name: '',
  email: '',
  phone: '',
  totalVisits: 0,
  notes: ''
};

const ClientForm = ({ client, onSubmit, onCancel, onDelete }: ClientFormProps) => {
  const isEditing = Boolean(client);
  const [form, setForm] = useState<Client>(client || defaultClient);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  // Update form state when client prop changes
  useEffect(() => {
    setForm(client || defaultClient);
  }, [client]);

  // Fetch barbers for preferred barber dropdown
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const barbersData = await getAllBarbers();
        setBarbers(barbersData);
      } catch (error) {
        console.error('Error fetching barbers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBarbers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: value
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // For editing, keep the id. For creating, let Supabase generate it
    if (isEditing) {
      // Make sure we're sending the complete client object with ID for updates
      onSubmit(form);
    } else {
      // For new clients, remove the id field and let Supabase generate it
      const { id, ...clientWithoutId } = form;
      onSubmit(clientWithoutId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? `Edit ${client?.name}` : 'Add New Client'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Client Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                className={`mt-1 block w-full border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                placeholder="+90 5XX XXX XX XX"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email || ''}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                placeholder="client@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Preferred Barber */}
            <div>
              <label htmlFor="preferredBarberId" className="block text-sm font-medium text-gray-700">
                Preferred Barber
              </label>
              <select
                id="preferredBarberId"
                name="preferredBarberId"
                value={form.preferredBarberId || ''}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                disabled={loading}
              >
                <option value="">No preference</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
              {loading && <div className="mt-1 text-xs text-gray-500 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading barbers...</div>}
            </div>

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
                placeholder="Any special preferences or notes about this client..."
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Visit History</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Visits</p>
                <p className="text-lg font-semibold text-gray-900">
                  {form.totalVisits}
                </p>
              </div>
              {form.lastVisit && (
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Last Visit</p>
                  <p className="text-lg font-semibold text-gray-900">{form.lastVisit}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Visit history is automatically tracked and cannot be edited directly.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(form.id)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-auto"
            >
              Delete Client
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            disabled={loading}
          >
            {isEditing ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
