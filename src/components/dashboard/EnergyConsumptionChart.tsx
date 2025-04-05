import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Download, RefreshCw, Filter } from 'lucide-react';

interface EnergyData {
  name: string;
  total: number;
  renewable: number;
  grid: number;
}

const EnergyConsumptionChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EnergyData[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animateChart, setAnimateChart] = useState(false);

  // Mock data
  const dayData: EnergyData[] = [
    { name: '00:00', total: 120, renewable: 45, grid: 75 },
    { name: '03:00', total: 90, renewable: 40, grid: 50 },
    { name: '06:00', total: 70, renewable: 30, grid: 40 },
    { name: '09:00', total: 160, renewable: 70, grid: 90 },
    { name: '12:00', total: 190, renewable: 95, grid: 95 },
    { name: '15:00', total: 170, renewable: 85, grid: 85 },
    { name: '18:00', total: 210, renewable: 90, grid: 120 },
    { name: '21:00', total: 150, renewable: 60, grid: 90 },
  ];

  const weekData: EnergyData[] = [
    { name: 'Mon', total: 820, renewable: 350, grid: 470 },
    { name: 'Tue', total: 780, renewable: 320, grid: 460 },
    { name: 'Wed', total: 830, renewable: 370, grid: 460 },
    { name: 'Thu', total: 790, renewable: 380, grid: 410 },
    { name: 'Fri', total: 850, renewable: 400, grid: 450 },
    { name: 'Sat', total: 680, renewable: 320, grid: 360 },
    { name: 'Sun', total: 650, renewable: 310, grid: 340 },
  ];

  const monthData: EnergyData[] = [
    { name: 'Week 1', total: 5200, renewable: 2400, grid: 2800 },
    { name: 'Week 2', total: 5100, renewable: 2500, grid: 2600 },
    { name: 'Week 3', total: 5400, renewable: 2700, grid: 2700 },
    { name: 'Week 4', total: 5300, renewable: 2800, grid: 2500 },
  ];

  // Generate random data with trend continuation
  const generateRandomData = (baseData: EnergyData[]) => {
    // Create a copy to avoid modifying the original
    const newData = [...baseData];

    // Apply random variations while maintaining trends
    return newData.map(item => {
      const variationFactor = 0.15; // 15% variation
      const randomVariation = (value: number) => {
        const maxVariation = value * variationFactor;
        return value + (Math.random() * maxVariation * 2 - maxVariation);
      };

      const total = Math.max(50, randomVariation(item.total));
      const renewable = Math.max(20, randomVariation(item.renewable));
      const grid = Math.max(30, total - renewable);

      return {
        name: item.name,
        total: Math.round(total),
        renewable: Math.round(renewable),
        grid: Math.round(grid)
      };
    });
  };

  const getData = () => {
    switch (timeRange) {
      case 'day':
        return data.length > 0 ? data : dayData;
      case 'week':
        return data.length > 0 ? data : weekData;
      case 'month':
        return data.length > 0 ? data : monthData;
      default:
        return data.length > 0 ? data : dayData;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setAnimateChart(true);

    // Get the base data for the current time range
    let baseData;
    switch (timeRange) {
      case 'day':
        baseData = dayData;
        break;
      case 'week':
        baseData = weekData;
        break;
      case 'month':
        baseData = monthData;
        break;
      default:
        baseData = dayData;
    }

    // Generate new random data based on the current data or base data
    const newData = generateRandomData(data.length > 0 ? data : baseData);

    setTimeout(() => {
      setData(newData);
      setIsLoading(false);

      // Reset animation flag after a short delay
      setTimeout(() => setAnimateChart(false), 700);
    }, 800);
  };

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefresh();
      }, 8000); // Refresh every 8 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh, timeRange, data]);

  // Initialize data on mount and when time range changes
  useEffect(() => {
    handleRefresh();
  }, [timeRange]);

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 overflow-hidden"
    >
      <div className="card-body p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h3 className="card-title">Energy Consumption</h3>

          <div className="flex flex-wrap gap-2">
            <div className="join">
              <button
                className={`join-item btn btn-sm ${timeRange === 'day' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeRange('day')}
              >
                Day
              </button>
              <button
                className={`join-item btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button
                className={`join-item btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                <Calendar className="h-4 w-4" />
              </div>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact shadow bg-base-100 w-64">
                <div className="card-body">
                  <h3 className="font-bold">Select Date Range</h3>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">From</span>
                    </label>
                    <input type="date" className="input input-bordered input-sm" />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">To</span>
                    </label>
                    <input type="date" className="input input-bordered input-sm" />
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <button className="btn btn-sm btn-primary">Apply</button>
                  </div>
                </div>
              </div>
            </div>

            <button
              className={`btn btn-sm ${isAutoRefresh ? 'btn-primary' : 'btn-ghost'} ${isLoading ? 'loading' : ''}`}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              <span className="ml-1 text-xs">{isAutoRefresh ? 'Auto' : 'Manual'}</span>
            </button>

            <button
              className={`btn btn-sm btn-ghost ${isLoading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4" />}
            </button>

            <button
              className="btn btn-sm btn-ghost"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={getData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              className={animateChart ? 'animate-pulse' : ''}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRenewable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Consumption"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="renewable"
                name="Renewable Energy"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRenewable)"
              />
              <Area
                type="monotone"
                dataKey="grid"
                name="Grid Energy"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorGrid)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyConsumptionChart;
