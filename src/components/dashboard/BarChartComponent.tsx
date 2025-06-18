import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface BarChartComponentProps {
  data: ChartData[];
  dataKey: string;
  barColor?: string;
  title: string;
  height?: number;
  isCurrency?: boolean;
}

export const BarChartComponent = ({ 
  data,
  dataKey,
  barColor = "#F59E0B",
  title,
  height = 300,
  isCurrency = false
}: BarChartComponentProps) => {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black p-3 rounded shadow text-white text-sm">
          <p className="mb-1">{`${label}`}</p>
          <p className="text-amber-400 font-semibold">
            {isCurrency ? '₺' : ''}{payload[0].value}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => isCurrency ? `₺${value}` : value.toString()}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Bar 
            dataKey={dataKey} 
            fill={barColor} 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
