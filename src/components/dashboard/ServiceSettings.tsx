import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Trash2, Loader2, Pencil, Plus, Image as ImageIcon } from 'lucide-react';

const SERVICE_IMAGE_BUCKET = 'service-images';

const initialService = {
  id: undefined,
  name: '',
  description: '',
  duration: '',
  price: '',
  popular: false,
  category: 'haircut',
  image: ''
};

const categories = [
  { value: 'haircut', label: 'Haircut' },
  { value: 'beard', label: 'Beard' },
  { value: 'combo', label: 'Combo' },
  { value: 'special', label: 'Special' },
  { value: 'addon', label: 'Addon' }
];

const ServiceSettings = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialService);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    console.log('[DEBUG] Fetching services...');
    setLoading(true);
    const { data, error } = await supabase.from('services').select('*').order('id', { ascending: true });
    if (error) {
      toast({ title: 'Error fetching services', description: error.message, variant: 'destructive' });
    } else {
      setServices(data);
      console.log('[DEBUG] Services fetched:', data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from(SERVICE_IMAGE_BUCKET).upload(fileName, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast({ title: 'Error uploading image', description: error.message, variant: 'destructive' });
    } else {
      const { data: urlData } = await supabase.storage.from(SERVICE_IMAGE_BUCKET).getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image: urlData?.publicUrl ? `${urlData.publicUrl}?t=${Date.now()}` : '' }));
      toast({ title: 'Image uploaded successfully' });
    }
  };

  const handleEdit = (service) => {
    setEditing(service.id);
    setForm(service);
  };

  const handleDelete = async (id, imageUrl) => {
    console.log('[DEBUG] Deleting service with id:', id, 'imageUrl:', imageUrl);
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting service', description: error.message, variant: 'destructive' });
    } else {
      console.log('[DEBUG] Service deleted, removing image if present...');
      // Optionally remove image from storage
      if (imageUrl) {
        const path = imageUrl.split('/').pop().split('?')[0];
        await supabase.storage.from(SERVICE_IMAGE_BUCKET).remove([path]);
        console.log('[DEBUG] Image removed from storage:', path);
      }
      toast({ title: 'Service deleted successfully' });
      console.log('[DEBUG] Service deleted successfully, refreshing list...');
      fetchServices();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      // Update
      const { error } = await supabase.from('services').update(form).eq('id', editing);
      if (error) {
        toast({ title: 'Error updating service', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Service updated successfully' });
        setEditing(null);
        setForm(initialService);
        fetchServices();
      }
    } else {
      // Insert
      const { error } = await supabase.from('services').insert([{ ...form }]);
      if (error) {
        toast({ title: 'Error creating service', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Service created successfully' });
        setForm(initialService);
        fetchServices();
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(initialService);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Services</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={form.category} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm">
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input name="duration" value={form.duration} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input name="price" value={form.price} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
            <div className="flex items-center space-x-4 md:col-span-2">
              <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                {form.image ? (
                  <img src={form.image} alt="Service" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input type="file" accept="image/png, image/jpeg, image/jpg" id="upload-service-image" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <label htmlFor="upload-service-image" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploading ? 'Uploading...' : 'Upload/Replace'}
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <input type="checkbox" id="popular" name="popular" checked={form.popular} onChange={handleInputChange} />
              <label htmlFor="popular" className="text-sm text-gray-700">Popular</label>
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              {editing ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {editing ? 'Update Service' : 'Add Service'}
            </button>
            {editing && (
              <button type="button" onClick={handleCancel} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popular</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><Loader2 className="mx-auto animate-spin text-amber-600" /></td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No services found.</td></tr>
              ) : (
                // [DEBUG] Rendering services list. Each row uses service.id as key.
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2"><img src={service.image} alt="Service" className="w-16 h-16 object-cover rounded" /></td>
                    <td className="px-4 py-2 font-medium text-gray-900">{service.name}</td>
                    <td className="px-4 py-2">{service.category}</td>
                    <td className="px-4 py-2">{service.duration}</td>
                    <td className="px-4 py-2">{service.price}</td>
                    <td className="px-4 py-2">{service.popular ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(service)} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-amber-600 hover:bg-amber-700"><Pencil className="h-3 w-3 mr-1" />Edit</button>
                      <button onClick={() => handleDelete(service.id, service.image)} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"><Trash2 className="h-3 w-3 mr-1" />Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceSettings;
