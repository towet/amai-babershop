import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { getAppointmentsByClientId } from '@/lib/services/booking-service';
import { User, Mail, Phone, Hash } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClientWithCutCount extends Client {
  totalCuts: number;
}

const ClientsManagement = () => {
  const [clients, setClients] = useState<ClientWithCutCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientsAndCuts = async () => {
      setLoading(true);
      // Fetch all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, phone');
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        setLoading(false);
        return;
      }
      if (!clientsData) {
        setClients([]);
        setLoading(false);
        return;
      }
      // For each client, fetch their appointments and count non-cancelled
      const clientCuts: ClientWithCutCount[] = await Promise.all(
        clientsData.map(async (client: Client) => {
          let totalCuts = 0;
          try {
            const { count } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', client.id)
              .eq('status', 'completed');
            totalCuts = count || 0;
          } catch (e) {
            totalCuts = 0;
          }
          return { ...client, totalCuts };
        })
      );
      setClients(clientCuts);
      setLoading(false);
    };
    fetchClientsAndCuts();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Clients</h2>
      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cuts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      {client.email || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      {client.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Hash className="h-5 w-5 text-gray-400 mr-2" />
                      {client.totalCuts}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;
