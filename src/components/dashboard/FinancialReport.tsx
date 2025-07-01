import { useState, useEffect } from 'react';
import { getFinancialData } from '@/lib/services/financial-service';
import { FinancialEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const FinancialReport = () => {
  const [data, setData] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getFinancialData(startDate, endDate);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [startDate, endDate]);

  const totalRevenue = data.reduce((acc, item) => acc + item.totalRevenue, 0);
  const totalCommission = data.reduce((acc, item) => acc + item.barberCommission, 0);
  const totalShopRevenue = totalRevenue - totalCommission;

  const pieData = [
    { name: 'Shop Revenue', value: totalShopRevenue },
    { name: 'Barber Commission', value: totalCommission },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Financial Report</h1>

      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stat Cards */}
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalShopRevenue.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barber Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{totalCommission.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        
        {/* Pie Chart Card */}
        <Card className="transform hover:scale-105 transition-transform duration-300 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent className="relative flex-grow flex flex-col items-center justify-center">
            <div className="relative w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={55} fill="#8884d8" paddingAngle={5}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${(value as number).toFixed(2)} Lira`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-500">Total Revenue</span>
                <span className="text-xl font-bold">{totalRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3" style={{ backgroundColor: COLORS[0] }}></span>
                <span>Shop</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3" style={{ backgroundColor: COLORS[1] }}></span>
                <span>Barbers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Shop Revenue</TableHead>
                  <TableHead className="text-right">Barber Commission</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>{item.barberName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-green-600">{item.shopRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-blue-600">{item.barberCommission.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{item.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No data available for the selected period.
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
