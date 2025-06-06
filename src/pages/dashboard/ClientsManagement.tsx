import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { mockAppointments } from '@/lib/mock-data'; // Still using mockAppointments for now
import { Client, Barber, Appointment } from '@/lib/types'; // Added Barber, Appointment
import { PlusCircle, Search, User, Calendar, Scissors, Phone, Mail, Loader2, Trash2, Edit3, ChevronDown } from 'lucide-react'; // Added ChevronDown
import ClientForm from '@/components/dashboard/ClientForm';
import { Link } from 'react-router-dom';
import { getAllClients, createClient, updateClient, deleteClient } from '@/lib/services/client-service';
import { getAllBarbers } from '@/lib/services/barber-service'; // Added
import { getAppointmentsByClientId } from '@/lib/services/booking-service'; // Added
import { useToast } from '@/components/ui/use-toast';

const ClientsManagement = () => {
  const [isDeletingClientModalOpen, setIsDeletingClientModalOpen] = useState(false);
  const [selectedClientForDeletion, setSelectedClientForDeletion] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]); // Added barbers state
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Fetch clients on component mount
  useEffect(() => {
    const fetchClientsAndBarbers = async () => {
      try {
        setLoading(true);
        const [clientsData, barbersData] = await Promise.all([
          getAllClients(),
          getAllBarbers()
        ]);
        setClients(clientsData);
        setBarbers(barbersData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clients. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientsAndBarbers();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle client creation
  const handleCreateClient = async (newClient: Omit<Client, 'id'>) => {
    try {
      setLoading(true);
      const createdClient = await createClient(newClient);
      
      // Update local state
      setClients([...clients, createdClient]);
      setIsAddingClient(false);
      
      toast({
        title: 'Client Created',
        description: 'The client has been successfully added.',
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle client update
  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      setLoading(true);
      const result = await updateClient(updatedClient.id, updatedClient);
      
      // Update local state
      setClients(clients.map(client => 
        client.id === updatedClient.id ? result : client
      ));
      setEditingClient(null);
      
      toast({
        title: 'Client Updated',
        description: 'The client has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle client deletion
  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        setLoading(true);
        await deleteClient(id);
        
        // Update local state
        setClients(clients.filter(client => client.id !== id));
        
        toast({
          title: 'Client Deleted',
          description: 'The client has been successfully deleted.',
        });
      } catch (error) {
        console.error('Error deleting client:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete client. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Get client appointments
  // Helper function to get barber name by ID
  const getBarberNameById = (barberId: string | undefined | null): string => {
    if (!barberId) return 'N/A';
    const barber = barbers.find(b => b.id === barberId);
    return barber ? barber.name : 'Unknown Barber';
  };

  const handleToggleAppointments = async (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
      setClientAppointments([]);
      return;
    }
    setExpandedClientId(clientId);
    setAppointmentsLoading(true);
    try {
      const appointments = await getAppointmentsByClientId(clientId);
      setClientAppointments(appointments);
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments for this client.',
        variant: 'destructive',
      });
      setClientAppointments([]); // Clear on error
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const getClientAppointments = (clientId: string) => {
    // This function is now effectively replaced by handleToggleAppointments and clientAppointments state
    // If it's still used elsewhere directly, it needs to be updated or removed.
    // For now, let's assume it's primarily for the display logic we are changing.
    return []; // Return empty or handle appropriately if still needed elsewhere.
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Clients Management</h1>
            <p className="text-sm md:text-base text-gray-600">
              View and manage all your clients' information
            </p>
          </div>
          
          <div className="flex w-full sm:w-auto gap-2 sm:space-x-3 mt-3 sm:mt-0">
            <button
              onClick={() => {
                setIsDeletingClientModalOpen(true);
                setSelectedClientForDeletion(null);
              }}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 flex items-center justify-center font-medium text-xs sm:text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Delete Client</span>
            </button>
            <button
              onClick={() => setIsAddingClient(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center justify-center font-medium text-xs sm:text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Add New Client</span>
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="relative rounded-md shadow-sm w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clients..."
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Clients List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid gap-4 md:gap-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                      <User size={18} />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      {client.preferredBarberId && (
                        <div className="text-xs text-gray-500">
                          Preferred Barber: {getBarberNameById(client.preferredBarberId)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-1.5 rounded-full bg-amber-50 text-amber-600"
                      aria-label="Edit client"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1.5 rounded-full bg-red-50 text-red-600"
                      aria-label="Delete client"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone size={14} className="mr-1.5 text-gray-500" />
                      <span className="text-gray-900 truncate">{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center col-span-2">
                      <Mail size={14} className="mr-1.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Scissors size={14} className="mr-1.5 text-gray-500" />
                    <span className="text-gray-900">{client.totalVisits} visits</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1.5 text-gray-500" />
                    <span className="text-gray-900 truncate">
                      {client.lastVisit ? client.lastVisit : 'No visits yet'}
                    </span>
                  </div>
                </div>
                
                {client.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 line-clamp-2">{client.notes}</p>
                  </div>
                )}

                {/* Appointments Section */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleToggleAppointments(client.id)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center"
                  >
                    {expandedClientId === client.id ? 'Hide Appointments' : 'View Appointments'}
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${expandedClientId === client.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedClientId === client.id && (
                    <div className="mt-3 space-y-2">
                      {appointmentsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                          <span className="ml-2 text-xs text-gray-500">Loading appointments...</span>
                        </div>
                      ) : clientAppointments.length > 0 ? (
                        clientAppointments.map(appt => (
                          <div key={appt.id} className="p-2 bg-gray-50 rounded-md text-xs">
                            <div className="font-medium text-gray-700">{new Date(appt.date).toLocaleDateString()} - {appt.time}</div>
                            <div className="text-gray-600">Service: {appt.serviceName || 'N/A'}</div>
                            <div className="text-gray-600">Barber: {appt.barberName || 'N/A'}</div>
                            <div className={`capitalize px-1.5 py-0.5 inline-block rounded text-white text-[10px] ${appt.status === 'scheduled' ? 'bg-blue-500' : appt.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}>
                              {appt.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No appointments found for this client.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 bg-white rounded-lg shadow-sm p-4">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 text-gray-400 mb-3 md:mb-4">
              <User size={20} />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-2 text-xs md:text-sm text-gray-500 max-w-sm mx-auto px-4">
              {searchTerm ? 
                `No clients match "${searchTerm}". Try a different search term.` :
                "There are no clients in the system yet. Get started by adding your first client."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-gray-600 rounded-md text-xs md:text-sm font-medium hover:bg-gray-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Client Modal */}
      {isDeletingClientModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20 flex items-center justify-center p-4">
          <div className="bg-white p-5 md:p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Select Client to Delete</h2>
            <div className="mb-4">
              <label htmlFor="clientToDelete" className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                id="clientToDelete"
                name="clientToDelete"
                value={selectedClientForDeletion || ''}
                onChange={(e) => setSelectedClientForDeletion(e.target.value || null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md"
              >
                <option value="" disabled>-- Select a client --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email || client.phone || 'No contact info'})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeletingClientModalOpen(false)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-xs md:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedClientForDeletion}
                onClick={() => {
                  if (selectedClientForDeletion) {
                    handleDeleteClient(selectedClientForDeletion);
                    setIsDeletingClientModalOpen(false);
                  }
                }}
                className={`px-3 md:px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-xs md:text-sm font-medium ${
                  selectedClientForDeletion
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for adding/editing client */}
      {(isAddingClient || editingClient) && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-auto">
            <ClientForm
              client={editingClient}
              onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
              onCancel={() => {
                setIsAddingClient(false);
                setEditingClient(null);
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientsManagement;
