import { useState, useEffect } from 'react';
import { getFinancialData } from '@/lib/services/financial-service';
import { addPayout, getPayouts, reversePayout, Payout } from '@/lib/services/payout-service';
import { getAllBarbers } from '@/lib/services/barber-service';
import { Barber } from '@/lib/types';
import { useAuth } from '@/lib/auth/auth-context';
import { FinancialEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChartComponent } from '@/components/dashboard/BarChartComponent';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const FinancialReport = () => {
  const [data, setData] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutReason, setPayoutReason] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const { user } = useAuth();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [result, payoutData, barbersData] = await Promise.all([
        getFinancialData(startDate, endDate),
        getPayouts(startDate, endDate),
        getAllBarbers()
      ]);
      setData(result);
      setPayouts(payoutData);
      setBarbers(barbersData);
      setLoading(false);
    };
    fetchData();
  }, [startDate, endDate]);

  const totalRevenue = data.reduce((acc, item) => acc + item.totalRevenue, 0);
  const totalCommission = data.reduce((acc, item) => acc + item.barberCommission, 0);
  const totalShopRevenue = totalRevenue - totalCommission;
  const totalPayouts = payouts.reduce((acc, p) => {
    // If it's a reversal, subtract the amount instead of adding
    if (p.reason.includes('REVERSAL of')) {
      return acc - p.amount;
    }
    return acc + p.amount;
  }, 0);
  const netShopRevenue = totalShopRevenue;
  const payoutsChartData = Object.entries(
    payouts.reduce((acc: Record<string, number>, p) => {
      const date = p.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + p.amount;
      return acc;
    }, {})
  )
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, amount]) => ({ name: date, value: amount }));

  const pieData = [
    { name: 'Net Shop Revenue', value: netShopRevenue },
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
            <CardTitle className="text-sm font-medium">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{totalPayouts.toFixed(2)} Lira</p>
          </CardContent>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Shop Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{netShopRevenue.toFixed(2)} Lira</p>
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
                <span>Net Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3" style={{ backgroundColor: COLORS[1] }}></span>
                <span>Barber Commission</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Record a Payout</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Barber</label>
            <select 
              value={selectedBarberId} 
              onChange={(e)=>setSelectedBarberId(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 p-2"
            >
              <option value="">Select Barber</option>
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>{barber.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (Lira)</label>
            <input type="number" step="0.01" value={payoutAmount} onChange={(e)=>setPayoutAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <input type="text" value={payoutReason} onChange={(e)=>setPayoutReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>
          <button
            onClick={async ()=>{
              if(!selectedBarberId||!payoutAmount||!payoutReason){alert('Please select barber, enter amount and reason');return;}
              const selectedBarber = barbers.find(b => b.id === selectedBarberId);
              const result = await addPayout(
                parseFloat(payoutAmount),
                payoutReason,
                user?.id,
                user?.email,
                selectedBarberId || undefined
              );
              if(result.success){
                setPayoutAmount(''); setPayoutReason(''); setSelectedBarberId('');
                const updated = await getPayouts(startDate,endDate);
                setPayouts(updated);
              }else{
                alert(result.error);
              }
            }}
            className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors">
            Add Payout
          </button>
        </div>
      </div>

      {/* Payouts Bar Chart */}
      {payoutsChartData.length > 0 && (
        <div className="mb-8">
          <BarChartComponent
            title="Payouts Over Time"
            data={payoutsChartData}
            bars={[{ key: 'value', color: '#f87171', name: 'Payouts' }]}
            isCurrency={true}
          />
        </div>
      )}

      {/* Payout History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length > 0 ? (
                  payouts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50">
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right text-red-600">{p.amount.toFixed(2)}</TableCell>
                      <TableCell>{p.reason}</TableCell>
                      <TableCell>{barbers.find(b => b.id === p.barber_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{p.user_name || p.user_id}</TableCell>
                      <TableCell>
                        <button
                          className="text-xs text-amber-600 hover:underline"
                          onClick={async ()=>{
                            if(!confirm('Reverse this payout?')) return;
                            try {
                              const res = await reversePayout(p, user?.id, user?.email);
                              if(res.success){
                                // Refresh both payouts and financial data
                                const [updatedPayouts, updatedFinancials] = await Promise.all([
                                  getPayouts(startDate, endDate),
                                  getFinancialData(startDate, endDate)
                                ]);
                                setPayouts(updatedPayouts);
                                setData(updatedFinancials);
                              }
                            } catch (error) {
                              console.error('Error reversing payout:', error);
                              alert('Failed to reverse payout. Please try again.');
                            }
                          }}
                        >Reverse</button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">No payouts recorded for period.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
