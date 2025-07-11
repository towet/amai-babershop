import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Upload, Trash2, Edit, PlusCircle, Loader2, Image as ImageIcon } from 'lucide-react';

// Define the type for a service
export type Service = {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  discount_percentage: number;
  is_popular: boolean;
  image_key?: string;
  imageUrl?: string;
};

export const ServicesSettings = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data: servicesData, error } = await supabase.from('services').select('*').order('created_at');
    if (error) {
      toast({ title: 'Error fetching services', description: error.message, variant: 'destructive' });
    } else if (servicesData) {
      const servicesWithUrls = await Promise.all(servicesData.map(async (service) => {
        let imageUrl = null;
        if (service.image_key) {
          const { data: urlData } = await supabase.storage.from('service-images').getPublicUrl(service.image_key);
          const res = await fetch(urlData.publicUrl);
          if (res.ok) imageUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
        }
        return { ...service, imageUrl };
      }));
      setServices(servicesWithUrls);
      console.log('[DEBUG] Services fetched:', servicesWithUrls);
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      price: Number(formData.get('price')),
      duration: parseInt(formData.get('duration') as string, 10) || 0,
      discount_percentage: Number(formData.get('discount_percentage')),
      is_popular: formData.get('is_popular') === 'on',
    };

    let image_key = editingService?.image_key || null;
    if (imageFile) {
      image_key = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(image_key, imageFile, { upsert: true });

      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = { ...serviceData, image_key };

    if (editingService) {
      // Update existing service
      const { error } = await supabase.from('services').update(payload).eq('id', editingService.id);
      if (error) {
        toast({ title: 'Error updating service', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Service updated successfully' });
      }
    } else {
      // Create new service
      console.log('[DEBUG] Submitting service payload:', payload);
      const { error } = await supabase.from('services').insert(payload);
      if (error) {
        toast({ title: 'Error creating service', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Service created successfully' });
      }
    }

    setIsSubmitting(false);
    setIsDialogOpen(false);
    setEditingService(null);
    setImageFile(null);
    fetchServices();
  };

  const handleDelete = async (serviceId: string, imageKey?: string) => {
    console.log('[DEBUG] Attempting to delete service with id:', serviceId);
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    if (error) {
      console.error('[DEBUG] Error deleting service from database:', error);
      toast({ title: 'Error deleting service', description: error.message, variant: 'destructive' });
      return;
    }

    console.log('[DEBUG] Service successfully deleted from database.');
    toast({ title: 'Service deleted' });

    if (imageKey) {
      console.log('[DEBUG] Removing image from storage:', imageKey);
      const { error: storageError } = await supabase.storage.from('service-images').remove([imageKey]);
      if (storageError) {
        // Log the error but don't block the UI update, as the main record is gone.
        console.error('[DEBUG] Error removing image from storage:', storageError);
        toast({ title: 'Could not delete image file', description: storageError.message, variant: 'destructive' });
      } else {
        console.log('[DEBUG] Image successfully removed from storage.');
      }
    }

    // Update UI state immediately
    setServices(currentServices =>
      currentServices.filter(service => service.id !== serviceId)
    );
    console.log('[DEBUG] Service removed from local state, UI should update.');
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
    setImageFile(null);
  };

  const openNewDialog = () => {
    setEditingService(null);
    setIsDialogOpen(true);
    setImageFile(null);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Manage Services</h2>
          <Button onClick={openNewDialog} variant="default" className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Add New Service</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={editingService?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" name="price" type="number" defaultValue={editingService?.price} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" name="description" defaultValue={editingService?.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration (min)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={editingService?.duration} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_percentage" className="text-right">Discount (%)</Label>
                <Input id="discount_percentage" name="discount_percentage" type="number" defaultValue={editingService?.discount_percentage || 0} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_popular" className="text-right">Popular</Label>
                <Switch id="is_popular" name="is_popular" defaultChecked={editingService?.is_popular} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  {editingService ? 'Save Changes' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>
        ) : (
          <div className="space-y-4">
            // [DEBUG] Rendering services list. Each row uses service.id as key.
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.price} Lira - {service.duration} min</p>
                    {service.discount_percentage > 0 && <p className="text-sm text-green-600">{service.discount_percentage}% off</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(service)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(service.id, service.image_key)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("id", { ascending: true });
    if (error) {
      toast({ title: "Error fetching services", description: error.message, variant: "destructive" });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setForm(service);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({});
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting service", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Service deleted" });
      fetchServices();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      // Update
      const { error } = await supabase.from("services").update(form).eq("id", editingId);
      if (error) {
        toast({ title: "Error updating service", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Service updated" });
        setEditingId(null);
        setForm({});
        fetchServices();
      }
    } else {
      // Create
      const { error } = await supabase.from("services").insert([{ ...form, price: Number(form.price), duration: parseInt((form as any).duration, 10) || 0 }]);
      if (error) {
        toast({ title: "Error adding service", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Service added" });
        setForm({});
        fetchServices();
      }
    }
    setSaving(false);
  };

