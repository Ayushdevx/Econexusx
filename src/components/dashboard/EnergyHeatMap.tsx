import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { Thermometer, Zap, RefreshCw, Info, Download } from 'lucide-react';

interface HeatPoint {
  x: number;
  y: number;
  z: number;
  value: number;
  name: string;
}

const EnergyHeatMap: React.FC = () => {
  const [data, setData] = useState<HeatPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animateChart, setAnimateChart] = useState(false);
  const [highUsageAlert, setHighUsageAlert] = useState(false);

  // Helper function to generate a grid of points
  const generateGridPoints = () => {
    const gridPoints: HeatPoint[] = [];
    const gridSize = 10; // 10x10 grid
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Create a heat distribution pattern
        // Center of heat at (5,5)
        const distanceFromCenter = Math.sqrt(Math.pow(x - 5, 2) + Math.pow(y - 5, 2));
        
        // Random hotspots
        const hotspots = [
          { x: 2, y: 7, intensity: 8 },
          { x: 8, y: 3, intensity: 7 },
          { x: 4, y: 2, intensity: 6 }
        ];
        
        let value = 0;
        // Add base heat (inverse of distance from center)
        value += Math.max(0, 10 - distanceFromCenter) * 10;
        
        // Add hotspot contributions
        hotspots.forEach(hotspot => {
          const distFromHotspot = Math.sqrt(Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2));
          value += Math.max(0, hotspot.intensity - distFromHotspot) * 15;
        });
        
        // Add some randomness
        value += Math.random() * 20;
        
        // Determine Z value (size) based on the heat value
        const z = Math.max(30, Math.min(100, value / 3));
        
        // Create names for significant points
        let name = `Grid Point ${x},${y}`;
        if (value > 100) {
          name = `High Usage Area ${x},${y}`;
        } else if (value > 80) {
          name = `Moderate Usage Area ${x},${y}`;
        }
        
        gridPoints.push({
          x,
          y,
          z,
          value,
          name
        });
      }
    }
    
    // Check if we have any high usage alerts
    const hasHighUsage = gridPoints.some(point => point.value > 120);
    setHighUsageAlert(hasHighUsage);
    
    return gridPoints;
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setAnimateChart(true);
    
    setTimeout(() => {
      const newData = generateGridPoints();
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
      }, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh]);

  // Initialize data
  useEffect(() => {
    handleRefresh();
  }, []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
          <div className="font-medium mb-1">{data.name}</div>
          <div className="text-sm flex items-center gap-1">
            <Thermometer className="h-4 w-4 text-error" />
            <span>Energy Usage: {data.value.toFixed(1)} kWh</span>
          </div>
          <div className="text-sm mt-1">Grid Position: ({data.x}, {data.y})</div>
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
            <Zap className={`h-6 w-6 ${highUsageAlert ? 'text-error animate-pulse' : 'text-primary'}`} />
            <h3 className="card-title">Energy Consumption Heat Map</h3>
            {highUsageAlert && (
              <div className="badge badge-error badge-sm animate-pulse">High Usage Detected</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                <Info className="h-4 w-4" />
              </div>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact shadow bg-base-100 w-64">
                <div className="card-body">
                  <h3 className="font-bold">About This Visualization</h3>
                  <p className="text-sm">This heat map shows energy consumption intensity across your network. Larger, redder points indicate higher energy usage areas.</p>
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
              className={`btn btn-ghost btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4" />}
            </button>

            <button className="btn btn-ghost btn-sm">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
                className={animateChart ? 'animate-pulse' : ''}
              >
                <XAxis type="number" dataKey="x" name="X-Axis" domain={[0, 9]} />
                <YAxis type="number" dataKey="y" name="Y-Axis" domain={[0, 9]} />
                <ZAxis type="number" dataKey="z" range={[30, 350]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Energy Usage" data={data}>
                  {data.map((entry, index) => {
                    // Color based on value (green to red scale)
                    const intensity = Math.min(1, entry.value / 150);
                    const r = Math.floor(255 * intensity);
                    const g = Math.floor(255 * (1 - intensity));
                    const b = 0;
                    const color = `rgb(${r}, ${g}, ${b})`;
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Energy Intensity Scale</div>
            {highUsageAlert && (
              <div className="text-xs text-error flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                <span>High consumption detected in some areas</span>
              </div>
            )}
          </div>
          <div className="w-full h-2 mt-1 rounded-full" style={{ background: 'linear-gradient(to right, #10b981, #fbbf24, #ef4444)' }}></div>
          <div className="flex justify-between text-xs mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyHeatMap; 