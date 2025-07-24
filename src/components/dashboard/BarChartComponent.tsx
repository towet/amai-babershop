import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

interface BarChartComponentProps {
  data: ChartData[];
  bars: { key: string; color: string; name?: string }[];
  title: string;
  height?: number;
  isCurrency?: boolean;
  stacked?: boolean;
  customTotal?: (payload: any[]) => number;
}

export const BarChartComponent = ({ 
  data = [],
  bars = [],
  title,
  height = 300,
  isCurrency = false,
  stacked = false,
  customTotal
}: BarChartComponentProps) => {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = customTotal ? customTotal(payload) : payload.reduce((sum, p) => sum + p.value, 0);
      return (
        <div className="bg-black p-3 rounded shadow text-white text-sm min-w-[150px]">
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.fill }}></div>
                <span>{pld.name}:</span>
              </div>
              <span className="font-semibold">{isCurrency ? '₺' : ''}{pld.value.toFixed(2)}</span>
            </div>
          ))}
          {payload.length > 1 && (
            <>
              <hr className="my-2 border-gray-600" />
              <div className="flex items-center justify-between gap-4 font-bold">
                <span>Total:</span>
                <span>{isCurrency ? '₺' : ''}{total.toFixed(2)}</span>
              </div>
            </>
          )}
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
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
          {bars.map(bar => (
            <Bar 
              key={bar.key}
              dataKey={bar.key} 
              name={bar.name}
              fill={bar.color} 
              stackId={stacked ? 'a' : undefined}
              radius={stacked ? undefined : [4, 4, 0, 0]}
              barSize={30}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
