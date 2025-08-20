import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarberCard } from '@/components/dashboard/BarberCard';
import { Barber } from '@/lib/types';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import BarberForm from '@/components/dashboard/BarberForm';
import { getAllBarbers, createBarber, updateBarber, deleteBarber } from '@/lib/services/barber-service';
import { toast } from '@/components/ui/use-toast';

const BarbersManagement = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingBarber, setIsAddingBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Load barbers on component mount
  useEffect(() => {
    loadBarbers();
  }, []);
  
  // Load barbers from Supabase
  const loadBarbers = async () => {
    try {
      setLoading(true);
      const data = await getAllBarbers();
      setBarbers(data);
    } catch (error) {
      console.error('Error loading barbers:', error);
      toast({
        title: "Error",
        description: "Failed to load barbers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter barbers based on search term
  const filteredBarbers = barbers.filter(barber => 
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (barber.specialty && barber.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle barber creation
  const handleCreateBarber = async (newBarber: Omit<Barber, 'id'> & { id?: string }) => {
    try {
      setSubmitting(true);
      const createdBarber = await createBarber(newBarber);
      setBarbers([...barbers, createdBarber]);
      setIsAddingBarber(false);
      toast({
        title: "Success",
        description: `Barber ${createdBarber.name} was created successfully.`,
      });
    } catch (error) {
      console.error('Error creating barber:', error);
      toast({
        title: "Error",
        description: "Failed to create barber. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle barber update
  const handleUpdateBarber = async (updatedBarber: Barber) => {
    try {
      setSubmitting(true);
      const result = await updateBarber(updatedBarber.id, updatedBarber);
      setBarbers(barbers.map(barber => 
        barber.id === result.id ? result : barber
      ));
      setEditingBarber(null);
      toast({
        title: "Success",
        description: `Barber ${result.name} was updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating barber:', error);
      toast({
        title: "Error",
        description: "Failed to update barber. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle barber deletion
  const handleDeleteBarber = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this barber?')) {
      try {
        setSubmitting(true);
        await deleteBarber(id);
        setBarbers(barbers.filter(barber => barber.id !== id));
        toast({
          title: "Success",
          description: "Barber was deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting barber:', error);
        toast({
          title: "Error",
          description: "Failed to delete barber. Please try again.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barbers Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage barber profiles, commissions, and status
            </p>
          </div>
          
          <button
            onClick={() => setIsAddingBarber(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            disabled={loading || submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4 mr-2" />
            )}
            Add New Barber
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search barbers by name, email, or specialty..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2 text-gray-600">Loading barbers...</span>
          </div>
        ) : filteredBarbers.length > 0 ? (
          /* Barber Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => (
              <div key={barber.id} className="relative group">
                <BarberCard barber={barber} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
                    <button
                      onClick={() => setEditingBarber(barber)}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors"
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No barbers found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm ? 
                `No barbers match "${searchTerm}". Try a different search term.` :
                "There are no barbers in the system yet. Get started by adding your first barber."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Modal for adding/editing barber */}
      {(isAddingBarber || editingBarber) && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-auto">
            <BarberForm
              barber={editingBarber}
              onSubmit={editingBarber ? handleUpdateBarber : handleCreateBarber}
              onCancel={() => {
                setIsAddingBarber(false);
                setEditingBarber(null);
              }}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BarbersManagement;
