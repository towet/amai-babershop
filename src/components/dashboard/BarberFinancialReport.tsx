import { useState, useEffect } from 'react';
import { getBarberFinancialData } from '@/lib/services/financial-service';
import { FinancialEntry } from '@/lib/types';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const BarberFinancialReport = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    };

    const fetchData = async () => {
      setLoading(true);
      console.log('[BarberFinancialReport] Fetching with:', { startDate, endDate, userId: user.id });
      const result = await getBarberFinancialData(startDate, endDate, user.id);
      console.log('[BarberFinancialReport] Result:', result);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [startDate, endDate, user?.id]);

  const totalCommission = data.reduce((acc, item) => acc + Number(item.barberCommission), 0);
  const totalRevenueGenerated = data.reduce((acc, item) => acc + Number(item.totalRevenue), 0);
  const completedAppointments = data.length;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">My Earnings Report</h1>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalCommission.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRevenueGenerated.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedAppointments}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Service Price</TableHead>
                  <TableHead className="text-right">My Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{Number(item.totalRevenue).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">{Number(item.barberCommission).toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-600 py-8">
                      <div>No earnings data available for the selected period.</div>
                      <div className="mt-2 text-xs text-gray-500">(startDate: {startDate}, endDate: {endDate}, userId: {user?.id})</div>
                      <div className="mt-2 text-xs text-gray-400">If you expect data, please check the date range above and try again.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
