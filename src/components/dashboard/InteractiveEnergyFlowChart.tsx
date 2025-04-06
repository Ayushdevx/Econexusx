import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Scatter, ScatterChart, ZAxis, ReferenceLine } from 'recharts';
import { RefreshCw, Download, Maximize2, Minimize2, Info, Zap, BarChart3, TrendingUp, Filter } from 'lucide-react';
import gsap from 'gsap';

interface DataPoint {
  name: string;
  value: number;
  efficiency: number;
  prediction: number;
  anomaly: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAnomaly = data.anomaly;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-base-100 p-4 rounded-lg shadow-xl border ${isAnomaly ? 'border-red-500' : 'border-primary/30'}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isAnomaly ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}></div>
          <span className="font-bold">{label}</span>
          {isAnomaly && (
            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Anomaly Detected</span>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Energy Value:</span>
            <span className="font-medium">{data.value.toFixed(2)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Efficiency:</span>
            <span className="font-medium">{data.efficiency}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm opacity-70">Prediction:</span>
            <span className="font-medium">{data.prediction.toFixed(2)} kWh</span>
          </div>
        </div>
        
        {isAnomaly && (
          <div className="mt-2 text-xs text-red-500">
            This data point shows unusual energy consumption patterns.
          </div>
        )}
      </motion.div>
    );
  }
  
  return null;
};

// Energy flow particle animation component
const EnergyFlowAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particleCount = 50;
    
    // Clear any existing particles
    container.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full bg-primary opacity-70';
      container.appendChild(particle);
      
      // Random starting position
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      
      // Set initial position
      gsap.set(particle, {
        left: `${startX}%`,
        top: `${startY}%`,
        scale: Math.random() * 0.5 + 0.5,
      });
      
      // Animate the particle
      gsap.to(particle, {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 4 + 3,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
      });
      
      // Pulse animation
      gsap.to(particle, {
        opacity: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        delay: Math.random(),
      });
    }
    
    return () => {
      // Cleanup animations when component unmounts
      gsap.killTweensOf(container.children);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    />
  );
};

const InteractiveEnergyFlowChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [animateChart, setAnimateChart] = useState(false);
  const [viewMode, setViewMode] = useState<'line' | 'scatter'>('line');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartControls = useAnimation();
  
  // Generate random data with some patterns and occasional anomalies
  const generateData = () => {
    const timePoints = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const baseValue = 50;
    const trend = Math.random() * 10 - 5; // Random trend direction
    
    return timePoints.map((time, index) => {
      // Create a daily pattern with morning and evening peaks
      let patternValue = baseValue;
      
      // Morning peak (around 8:00)
      if (time === '08:00') patternValue += 30;
      // Evening peak (around 18:00-20:00)
      if (time === '18:00' || time === '20:00') patternValue += 25;
      
      // Add trend component
      patternValue += trend * (index / timePoints.length);
      
      // Add some randomness
      const randomFactor = Math.random() * 15 - 7.5;
      const value = Math.max(10, patternValue + randomFactor);
      
      // Determine if this is an anomaly (rare, random occurrence)
      const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly
      
      // If anomaly, add a significant spike or drop
      const anomalyValue = isAnomaly ? value * (Math.random() < 0.5 ? 1.5 : 0.5) : value;
      
      // Calculate efficiency (higher for normal points, lower for anomalies)
      const efficiency = isAnomaly 
        ? Math.floor(Math.random() * 20 + 60) // 60-80% for anomalies
        : Math.floor(Math.random() * 15 + 80); // 80-95% for normal points
      
      // Generate a prediction (close to actual for normal points, off for anomalies)
      const prediction = isAnomaly
        ? value * (0.8 + Math.random() * 0.4) // Prediction doesn't match anomaly
        : anomalyValue * (0.95 + Math.random() * 0.1); // Prediction close to actual
      
      return {
        name: time,
        value: anomalyValue,
        efficiency,
        prediction,
        anomaly: isAnomaly
      };
    });
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
      }, 8000); // Refresh every 8 seconds
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh]);
  
  // Handle data refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setAnimateChart(true);
    
    // Animate chart out
    chartControls.start({
      opacity: 0.5,
      scale: 0.98,
      transition: { duration: 0.3 }
    }).then(() => {
      // Update data
      setData(generateData());
      
      // Animate chart back in
      chartControls.start({
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      });
      
      setIsLoading(false);
      
      // Reset animation flag after a short delay
      setTimeout(() => setAnimateChart(false), 700);
    });
  };
  
  // Handle data point click
  const handleDataPointClick = (data: any) => {
    setSelectedDataPoint(data);
    setShowInfoPanel(true);
  };
  
  // Export data as CSV
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Time,Energy Value (kWh),Efficiency (%),Prediction (kWh),Anomaly\n"
      + data.map(item => {
          return `${item.name},${item.value.toFixed(2)},${item.efficiency},${item.prediction.toFixed(2)},${item.anomaly}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "energy_flow_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`card bg-base-100 overflow-hidden relative ${isExpanded ? 'col-span-1 lg:col-span-2' : ''}`}
    >
      {/* Background energy flow animation */}
      <EnergyFlowAnimation />
      
      <div className="card-body p-6 relative z-10">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <h3 className="card-title">Interactive Energy Flow</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="join">
              <button
                className={`join-item btn btn-sm ${viewMode === 'line' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('line')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Line
              </button>
              <button
                className={`join-item btn btn-sm ${viewMode === 'scatter' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('scatter')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Scatter
              </button>
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
            
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                <Info className="h-4 w-4" />
              </div>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact shadow bg-base-100 w-64">
                <div className="card-body">
                  <h3 className="font-bold">About This Chart</h3>
                  <p className="text-sm">
                    This interactive chart shows energy flow patterns over time. 
                    Red dots indicate anomalies in energy consumption.
                    Click on data points for detailed information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          className="h-80 relative"
          animate={chartControls}
          initial={{ opacity: 1, scale: 1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'line' ? (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                className={animateChart ? 'animate-pulse' : ''}
                onClick={(data) => data && data.activePayload && handleDataPointClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--color-text-base)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--color-text-base)' }}
                  label={{ 
                    value: 'Energy (kWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'var(--color-text-base)' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Prediction line (dashed) */}
                <Line
                  type="monotone"
                  dataKey="prediction"
                  name="Predicted"
                  stroke="#8884d8"
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />
                
                {/* Actual value line with custom dots for anomalies */}
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Actual"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isAnomaly = payload.anomaly;
                    
                    return (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isAnomaly ? 6 : 4}
                          fill={isAnomaly ? '#ff4d4f' : '#82ca9d'}
                          stroke={isAnomaly ? '#ff4d4f' : '#82ca9d'}
                          className={isAnomaly ? 'animate-pulse' : ''}
                        />
                        {isAnomaly && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={10}
                            fill="none"
                            stroke="#ff4d4f"
                            strokeWidth={1}
                            opacity={0.5}
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  }}
                  activeDot={{ r: 8, onClick: (data) => handleDataPointClick(data.payload) }}
                />
              </LineChart>
            ) : (
              <ScatterChart
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                className={animateChart ? 'animate-pulse' : ''}
                onClick={(data) => data && data.activePayload && handleDataPointClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="category"
                  dataKey="name" 
                  name="Time"
                  tick={{ fill: 'var(--color-text-base)' }}
                />
                <YAxis 
                  type="number"
                  dataKey="value" 
                  name="Energy"
                  tick={{ fill: 'var(--color-text-base)' }}
                  label={{ 
                    value: 'Energy (kWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'var(--color-text-base)' }
                  }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="efficiency" 
                  range={[60, 400]} 
                  name="Efficiency" 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Reference line for average */}
                <ReferenceLine 
                  y={data.reduce((sum, item) => sum + item.value, 0) / data.length} 
                  stroke="#888" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'Average', 
                    position: 'right',
                    style: { fill: 'var(--color-text-base)' }
                  }}
                />
                
                <Scatter 
                  name="Energy Flow" 
                  data={data} 
                  fill="#8884d8"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const isAnomaly = payload.anomaly;
                    
                    return (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isAnomaly ? 8 : 6}
                          fill={isAnomaly ? '#ff4d4f' : '#8884d8'}
                          opacity={0.7}
                          className={isAnomaly ? 'animate-pulse' : ''}
                        />
                        {isAnomaly && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={12}
                            fill="none"
                            stroke="#ff4d4f"
                            strokeWidth={1}
                            opacity={0.5}
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </motion.div>
        
        {/* Data point details panel */}
        <AnimatePresence>
          {showInfoPanel && selectedDataPoint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-base-200 rounded-lg p-4 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedDataPoint.anomaly ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}></div>
                  <h4 className="font-bold text-lg">{selectedDataPoint.name}</h4>
                  {selectedDataPoint.anomaly && (
                    <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Anomaly</span>
                  )}
                </div>
                <button 
                  className="btn btn-sm btn-ghost btn-circle"
                  onClick={() => setShowInfoPanel(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-base-300 rounded-lg p-3">
                  <div className="text-sm opacity-70 mb-1">Energy Value</div>
                  <div className="text-2xl font-bold">{selectedDataPoint.value.toFixed(2)} kWh</div>
                  <div className="text-xs opacity-50 mt-1">
                    {selectedDataPoint.value > 80 ? 'High consumption' : selectedDataPoint.value < 40 ? 'Low consumption' : 'Normal consumption'}
                  </div>
                </div>
                
                <div className="bg-base-300 rounded-lg p-3">
                  <div className="text-sm opacity-70 mb-1">Efficiency</div>
                  <div className="text-2xl font-bold">{selectedDataPoint.efficiency}%</div>
                  <div className="text-xs opacity-50 mt-1">
                    {selectedDataPoint.efficiency > 85 ? 'Excellent' : selectedDataPoint.efficiency > 75 ? 'Good' : 'Needs improvement'}
                  </div>
                </div>
                
                <div className="bg-base-300 rounded-lg p-3">
                  <div className="text-sm opacity-70 mb-1">Prediction Accuracy</div>
                  <div className="text-2xl font-bold">
                    {Math.abs(((selectedDataPoint.prediction - selectedDataPoint.value) / selectedDataPoint.value) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs opacity-50 mt-1">
                    {Math.abs(selectedDataPoint.prediction - selectedDataPoint.value) < 5 ? 'High accuracy' : 'Low accuracy'}
                  </div>
                </div>
              </div>
              
              {selectedDataPoint.anomaly && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                >
                  <h5 className="font-bold text-red-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    Anomaly Analysis
                  </h5>
                  <p className="text-sm mt-1">
                    This data point shows unusual energy consumption patterns that deviate from predicted values.
                    Possible causes include equipment malfunction, unexpected usage patterns, or energy leakage.
                  </p>
                  <div className="mt-2">
                    <button className="btn btn-xs btn-outline btn-error">Investigate</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InteractiveEnergyFlowChart;
