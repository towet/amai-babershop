import React, { useState, useEffect } from 'react';
import { Activity, Clock, Database, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  queryCount: number;
  cacheHits: number;
  networkStatus: 'online' | 'offline';
  lastUpdate: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    queryCount: 0,
    cacheHits: 0,
    networkStatus: 'online',
    lastUpdate: new Date().toLocaleTimeString()
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setMetrics(prev => ({ ...prev, networkStatus: 'online' }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, networkStatus: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance observer for load times
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setMetrics(prev => ({
              ...prev,
              loadTime: Math.round(entry.duration),
              lastUpdate: new Date().toLocaleTimeString()
            }));
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Performance Monitor (Ctrl+Shift+P)"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <Clock className="w-3 h-3" />
            Load Time
          </span>
          <span className={`font-mono ${metrics.loadTime > 3000 ? 'text-red-600' : metrics.loadTime > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.loadTime}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <Database className="w-3 h-3" />
            Query Count
          </span>
          <span className="font-mono text-blue-600">
            {metrics.queryCount}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600">
            <Wifi className="w-3 h-3" />
            Network
          </span>
          <span className={`font-mono ${metrics.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.networkStatus}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          Last update: {metrics.lastUpdate}
        </div>
        
        <div className="text-xs text-gray-400 pt-1">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
};
