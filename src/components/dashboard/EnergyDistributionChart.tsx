import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip, Legend } from 'recharts';
import { Zap, Wind, Sun, Battery, RefreshCw, Info } from 'lucide-react';

interface EnergySource {
  name: string;
  value: number;
  color: string;
  icon: React.ElementType;
}

const EnergyDistributionChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EnergySource[]>([]);
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

  // Generate random data
  const generateData = () => {
    const total = 100;
    const solar = Math.floor(Math.random() * 30) + 15; // 15-45%
    const wind = Math.floor(Math.random() * 25) + 10;  // 10-35%
    const hydro = Math.floor(Math.random() * 15) + 5;  // 5-20%
    const grid = total - solar - wind - hydro;         // Remaining %

    return [
      { name: 'Solar', value: solar, color: '#f59e0b', icon: Sun },
      { name: 'Wind', value: wind, color: '#3b82f6', icon: Wind },
      { name: 'Hydro', value: hydro, color: '#06b6d4', icon: Battery },
      { name: 'Grid', value: grid, color: '#8b5cf6', icon: Zap },
    ];
  };

  // Initialize data
  useEffect(() => {
    setData(generateData());
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefresh();
      }, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh]);

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setAnimateChart(true);
    setTimeout(() => {
      setData(generateData());
      setIsLoading(false);

      // Reset animation flag after a short delay
      setTimeout(() => setAnimateChart(false), 700);
    }, 800);
  };

  // Custom active shape for the pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="drop-shadow-lg"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
          className="animate-pulse"
        />
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;

      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4" style={{ color: data.color }} />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="text-lg font-bold">{data.value}%</div>
          <div className="text-xs opacity-70 mt-1">of total energy mix</div>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Energy Distribution</h3>

          <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                <Info className="h-4 w-4" />
              </div>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact shadow bg-base-100 w-64">
                <div className="card-body">
                  <h3 className="font-bold">About This Chart</h3>
                  <p className="text-sm">Shows the current distribution of energy sources in your network. Click on segments for details.</p>
                </div>
              </div>
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
              className={`btn btn-ghost btn-sm btn-circle ${isLoading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className={animateChart ? 'animate-pulse' : ''}>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300"
                    style={{ filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry: any) => {
                  const Icon = entry.payload.icon;
                  return (
                    <span className="flex items-center gap-1">
                      <Icon className="h-4 w-4" style={{ color: entry.color }} />
                      <span>{value}</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {data.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-base-200 rounded-lg p-3 flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setActiveIndex(index)}
              onHoverEnd={() => setActiveIndex(null)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${source.color}20` }}
              >
                <source.icon className="h-5 w-5" style={{ color: source.color }} />
              </div>
              <div className="text-lg font-bold">{source.value}%</div>
              <div className="text-xs opacity-70">{source.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyDistributionChart;
