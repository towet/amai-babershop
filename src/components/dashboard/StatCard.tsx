import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  description?: string;
  isCurrency?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  description,
  isCurrency = false
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isCurrency && '₺'}{value}
          </p>
          {trend !== undefined && (
            <div className={`mt-1 flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-gray-500 text-xs">vs last week</span>
            </div>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          <div className="text-amber-500">{icon}</div>
        </div>
      </div>
    </div>
  );
};
