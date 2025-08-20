import { useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/supabase-admin';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/auth/auth-context';

// Predefined SQL queries
const PREDEFINED_QUERIES = {
  allBarbers: `SELECT id, name, email, specialty FROM barbers ORDER BY name;`,
  allAppointments: `SELECT 
  a.id,
  a.date,
  a.time,
  a.status,
  a.type,
  a.notes,
  a.price,
  b.name AS barber_name,
  b.id AS barber_id,
  c.name AS client_name,
  s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
ORDER BY a.date, a.time;`,
  josephAppointments: `SELECT 
  a.id,
  a.date,
  a.time,
  a.status,
  a.type,
  a.notes,
  a.price,
  b.name AS barber_name,
  c.name AS client_name,
  s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.barber_id = 'aabc6bd6-cbc2-42b3-8f14-56b86b6a0957'
ORDER BY a.date, a.time;`,
  upcomingAppointments: `SELECT 
  a.id,
  a.date,
  a.time,
  a.status,
  a.type,
  a.notes,
  a.price,
  b.name AS barber_name,
  b.id AS barber_id,
  c.name AS client_name,
  s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.date >= CURRENT_DATE
  AND a.status != 'cancelled'
ORDER BY a.date, a.time;`,
};

const DatabaseQuery = () => {
  const { isManager } = useAuth();
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle executing the SQL query
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabaseAdmin.rpc('execute_sql', { 
        query: sqlQuery
      });
      
      if (queryError) throw queryError;
      
      setResults(data);
    } catch (err) {
      console.error('SQL query error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while executing the query');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alternative direct query method if RPC is not available
  const handleDirectQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For direct queries, we need to use the appropriate table-based methods
      // This is a simplified approach for SELECT queries only
      if (sqlQuery.toLowerCase().includes('from barbers')) {
        const { data, error: queryError } = await supabaseAdmin.from('barbers').select('*');
        if (queryError) throw queryError;
        setResults(data);
      } 
      else if (sqlQuery.toLowerCase().includes('from appointments')) {
        const { data, error: queryError } = await supabaseAdmin
          .from('appointments')
          .select(`
            *,
            barber:barber_id(id, name, email),
            client:client_id(id, name, email),
            service:service_id(id, name, price)
          `);
        if (queryError) throw queryError;
        setResults(data);
      }
      else {
        setError('Only queries on barbers and appointments tables are supported in this simplified tool');
      }
    } catch (err) {
      console.error('SQL query error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while executing the query');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a predefined query
  const loadPredefinedQuery = (queryKey: keyof typeof PREDEFINED_QUERIES) => {
    setSqlQuery(PREDEFINED_QUERIES[queryKey]);
  };
  
  // Function to try checking the database directly for Joseph's appointments
  const checkJosephAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct query to check Joseph's appointments
      const { data, error: queryError } = await supabaseAdmin
        .from('appointments')
        .select(`
          *,
          barber:barber_id(id, name),
          client:client_id(id, name),
          service:service_id(id, name)
        `)
        .eq('barber_id', 'aabc6bd6-cbc2-42b3-8f14-56b86b6a0957');
      
      if (queryError) throw queryError;
      
      // Log raw data to console for debugging
      console.log('Raw Joseph appointment data:', data);
      
      setResults(data);
      
      // Also check if Joseph exists in the barbers table
      const { data: barberData, error: barberError } = await supabaseAdmin
        .from('barbers')
        .select('*')
        .eq('id', 'aabc6bd6-cbc2-42b3-8f14-56b86b6a0957');
        
      if (barberError) {
        console.error('Error checking barber:', barberError);
      } else {
        console.log('Joseph barber record:', barberData);
      }
      
    } catch (err) {
      console.error('Error checking Joseph appointments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while checking Joseph\'s appointments');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If not a manager, don't allow access to this page
  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">Only managers can access the database query tool.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Query Tool</h1>
        
        {/* Predefined queries */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Quick Queries</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadPredefinedQuery('allBarbers')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              All Barbers
            </button>
            <button
              onClick={() => loadPredefinedQuery('allAppointments')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              All Appointments
            </button>
            <button
              onClick={() => loadPredefinedQuery('josephAppointments')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Joseph's Appointments
            </button>
            <button
              onClick={() => loadPredefinedQuery('upcomingAppointments')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Upcoming Appointments
            </button>
          </div>
        </div>
        
        {/* Direct check button */}
        <div className="mb-6">
          <button
            onClick={checkJosephAppointments}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
          >
            Check Joseph's Appointments Directly
          </button>
          <p className="text-sm text-gray-500 mt-1">
            This will query the database directly and check if Joseph has any appointments.
            Results will appear below and in the console.
          </p>
        </div>
        
        {/* SQL query textarea */}
        <div className="mb-6">
          <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 mb-1">
            SQL Query
          </label>
          <textarea
            id="sqlQuery"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter your SQL query here..."
          />
        </div>
        
        {/* Execute button */}
        <div className="mb-6">
          <button
            onClick={handleDirectQuery}
            disabled={isLoading}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* Results */}
        {results && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Results ({results.length} rows)</h2>
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value: any, valueIndex) => (
                          <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value === null 
                              ? <span className="text-gray-400 italic">null</span>
                              : typeof value === 'object' 
                                ? JSON.stringify(value)
                                : String(value)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No results found</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DatabaseQuery;
