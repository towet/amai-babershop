import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Bar, Pie, Line } from 'recharts';
import { BarChartComponent } from '@/components/dashboard/BarChartComponent';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockAppointments, mockBarbers, mockClients } from '@/lib/mock-data';
import { ArrowRight, TrendingUp, TrendingDown, Users, Calendar, Scissors, DollarSign } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartType, setChartType] = useState<'revenue' | 'appointments' | 'services'>('revenue');
  
  // Calculate some metrics from mock data
  const totalAppointments = mockAppointments.length;
  const completedAppointments = mockAppointments.filter(app => app.status === 'completed').length;
  const totalBarbers = mockBarbers.filter(b => b.active).length;
  const totalClients = mockClients.length;
  
  // Calculate total revenue
  const totalRevenue = mockAppointments
    .filter(app => app.status === 'completed')
    .reduce((sum, app) => sum + app.price, 0);
  
  // Calculate average revenue per appointment
  const avgRevenue = totalRevenue / (completedAppointments || 1);
  
  // Weekly revenue data
  const weeklyRevenueData = [
    { name: 'Mon', value: 2800, fill: '#000' },
    { name: 'Tue', value: 1800, fill: '#000' },
    { name: 'Wed', value: 3500, fill: '#000' },
    { name: 'Thu', value: 2900, fill: '#000' },
    { name: 'Fri', value: 4500, fill: '#000' },
    { name: 'Sat', value: 5200, fill: '#000' },
    { name: 'Sun', value: 2100, fill: '#000' },
  ];
  
  // Monthly revenue data
  const monthlyRevenueData = [
    { name: 'Jan', value: 12500, fill: '#000' },
    { name: 'Feb', value: 14500, fill: '#000' },
    { name: 'Mar', value: 13200, fill: '#000' },
    { name: 'Apr', value: 15800, fill: '#000' },
    { name: 'May', value: 16900, fill: '#000' },
    { name: 'Jun', value: 18500, fill: '#000' },
    { name: 'Jul', value: 17200, fill: '#000' },
    { name: 'Aug', value: 19800, fill: '#000' },
    { name: 'Sep', value: 20100, fill: '#000' },
    { name: 'Oct', value: 22500, fill: '#000' },
    { name: 'Nov', value: 24800, fill: '#000' },
    { name: 'Dec', value: 29900, fill: '#000' },
  ];
  
  // Service breakdown data
  const serviceData = [
    { name: 'Haircut', value: 35, fill: '#000' },
    { name: 'Hair + Beard', value: 25, fill: '#d4af37' },
    { name: 'Beard Trim', value: 15, fill: '#555' },
    { name: 'Hair Wash', value: 10, fill: '#999' },
    { name: 'Color', value: 15, fill: '#777' },
  ];
  
  // Barber performance data
  const barberPerformanceData = mockBarbers
    .filter(barber => barber.active)
    .map(barber => ({
      name: barber.name.split(' ')[0],
      appointments: Math.floor(Math.random() * 50) + 30,
      revenue: Math.floor(Math.random() * 5000) + 3000,
      fill: '#000'
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Get chart data based on selected type and date range
  const getChartData = () => {
    if (chartType === 'revenue') {
      return dateRange === 'week' ? weeklyRevenueData : monthlyRevenueData;
    } else if (chartType === 'appointments') {
      return dateRange === 'week' 
        ? weeklyRevenueData.map(item => ({ ...item, value: Math.floor(item.value / 100) })) 
        : monthlyRevenueData.map(item => ({ ...item, value: Math.floor(item.value / 100) }));
    } else {
      return serviceData;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review shop performance metrics, revenue, and team statistics
          </p>
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`₺${totalRevenue.toLocaleString()}`} 
            description="In completed appointments (+5.3% vs. last period)" 
            icon={<DollarSign className="h-5 w-5" />}
            trend={5.3}
          />
          <StatCard 
            title="Avg. Per Customer" 
            value={`₺${avgRevenue.toFixed(0)}`} 
            description="Average revenue (+2.1% vs. last period)" 
            icon={<Users className="h-5 w-5" />}
            trend={2.1}
          />
          <StatCard 
            title="Appointments" 
            value={totalAppointments.toString()} 
            description={`${completedAppointments} completed (+8.2% vs. last period)`} 
            icon={<Calendar className="h-5 w-5" />}
            trend={8.2}
          />
          <StatCard 
            title="Clients" 
            value={totalClients.toString()} 
            description={`${totalBarbers} active barbers (+3.7% vs. last period)`} 
            icon={<Scissors className="h-5 w-5" />}
            trend={3.7}
          />
        </div>
        
        {/* Chart Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <p className="text-sm text-gray-500">Visualize your shop's performance</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setChartType('revenue')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-md ${
                    chartType === 'revenue' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartType('appointments')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    chartType === 'appointments' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setChartType('services')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-md ${
                    chartType === 'services' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Services
                </button>
              </div>
              
              {chartType !== 'services' && (
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-l-md ${
                      dateRange === 'week' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-3 py-1.5 text-sm font-medium ${
                      dateRange === 'month' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setDateRange('quarter')}
                    className={`px-3 py-1.5 text-sm font-medium ${
                      dateRange === 'quarter' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Quarter
                  </button>
                  <button
                    onClick={() => setDateRange('year')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-r-md ${
                      dateRange === 'year' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Year
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-80">
            <BarChartComponent 
              data={getChartData()} 
              dataKey="value"
              title={chartType === 'revenue' ? 'Revenue (₺)' : chartType === 'appointments' ? 'Number of Appointments' : 'Services Distribution'}
              barColor="#000"
              isCurrency={chartType === 'revenue'}
              height={300}
            />
          </div>
        </div>
        
        {/* Top Performers & Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Barbers</h2>
            
            <div className="space-y-4">
              {barberPerformanceData.slice(0, 5).map((barber, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{barber.name}</span>
                      <span className="text-sm font-bold">₺{barber.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${(barber.revenue / barberPerformanceData[0].revenue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{barber.appointments} appointments</span>
                      <span className="text-xs text-gray-500">₺{Math.round(barber.revenue / barber.appointments)} avg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <a href="#" className="mt-6 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800">
              View all barber performance
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Service Type</h3>
                <div className="space-y-3">
                  {serviceData.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: service.fill }}
                        ></div>
                        <span className="text-sm text-gray-700">{service.name}</span>
                      </div>
                      <span className="text-sm font-medium">{service.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Revenue Sources</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-black mr-2"></div>
                      <span className="text-sm text-gray-700">Appointments</span>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Walk-ins</span>
                    </div>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Products</span>
                    </div>
                    <span className="text-sm font-medium">14%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
                      <span className="text-sm text-gray-700">Other</span>
                    </div>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Monthly Growth</h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold text-green-500">+12.5%</span>
                <span className="text-sm text-gray-500">compared to last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
