import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, TrendingUp, Calendar, Download, RefreshCw, Filter } from 'lucide-react';

interface SavingsData {
  name: string;
  savings: number;
  potential: number;
  color?: string;
}

const CostSavingsWidget: React.FC = () => {
  const [data, setData] = useState<SavingsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [totalSavings, setTotalSavings] = useState(0);
  const [potentialSavings, setPotentialSavings] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animateChart, setAnimateChart] = useState(false);

  // Format number as Indian Rupees
  const formatIndianRupees = (value: number): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    return formatter.format(value);
  };

  // Generate random savings data
  const generateData = (range: 'week' | 'month' | 'quarter') => {
    setIsLoading(true);

    let labels: string[] = [];
    let dataPoints: SavingsData[] = [];
    let total = 0;
    let potential = 0;

    switch (range) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;
      case 'quarter':
        labels = ['Jan', 'Feb', 'Mar'];
        break;
    }

    dataPoints = labels.map(label => {
      const savings = Math.floor(Math.random() * 5000) + 1000;
      const potentialValue = Math.floor(Math.random() * 2000) + 500;

      total += savings;
      potential += potentialValue;

      return {
        name: label,
        savings,
        potential: potentialValue
      };
    });

    setTimeout(() => {
      setData(dataPoints);
      setTotalSavings(total);
      setPotentialSavings(potential);
      setIsLoading(false);
      setAnimateChart(true);

      // Reset animation flag after a short delay
      setTimeout(() => setAnimateChart(false), 700);
    }, 800);
  };

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        generateData(timeRange);
      }, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh, timeRange]);

  // Initialize data
  useEffect(() => {
    generateData(timeRange);
  }, [timeRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            Savings: {formatIndianRupees(payload[0].value)}
          </p>
          <p className="text-sm flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary/30"></span>
            Potential: {formatIndianRupees(payload[1].value)}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card bg-base-100"
    >
      <div className="card-body p-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-success" />
            <h3 className="card-title">Cost Savings</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="join">
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
              <button
                className={`join-item btn btn-sm ${timeRange === 'quarter' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeRange('quarter')}
              >
                Quarter
              </button>
            </div>

            <button
              className={`btn ${isAutoRefresh ? 'btn-primary' : 'btn-ghost'} btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              <span className="ml-1 text-xs">{isAutoRefresh ? 'Auto' : 'Manual'}</span>
            </button>

            <button
              className={`btn btn-ghost btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={() => generateData(timeRange)}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4" />}
            </button>

            <button className="btn btn-ghost btn-sm">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-base-200 rounded-lg p-4"
          >
            <div className="text-sm text-base-content/70 mb-1">Total Savings</div>
            <div className="text-3xl font-bold text-success">
              {formatIndianRupees(totalSavings)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>12.5% increase from previous period</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-base-200 rounded-lg p-4"
          >
            <div className="text-sm text-base-content/70 mb-1">Additional Potential Savings</div>
            <div className="text-3xl font-bold text-primary">
              {formatIndianRupees(potentialSavings)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
              <Filter className="h-3 w-3" />
              <span>Optimize your network to unlock these savings</span>
            </div>
          </motion.div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                className={animateChart ? 'animate-pulse' : ''}
                onMouseMove={(e) => {
                  if (e.activeTooltipIndex !== undefined) {
                    setActiveIndex(e.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="savings"
                  name="Actual Savings"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={activeIndex === index ? '#34d399' : '#10b981'}
                      className="transition-colors duration-300"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="potential"
                  name="Potential Savings"
                  fill="#10b98133"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={activeIndex === index ? '#34d39933' : '#10b98133'}
                      className="transition-colors duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-6 bg-base-200 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Optimization Recommendations</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-success"></div>
              <span>Implement peak shaving to reduce demand charges by up to 15%</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-success"></div>
              <span>Upgrade to energy-efficient equipment at high-consumption sites</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-success"></div>
              <span>Shift non-critical operations to off-peak hours for better rates</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default CostSavingsWidget;
