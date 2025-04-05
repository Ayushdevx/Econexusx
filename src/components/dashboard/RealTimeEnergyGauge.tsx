import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Battery, Wind, Sun, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface GaugeProps {
  value: number;
  max: number;
  title: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

const Gauge: React.FC<GaugeProps> = ({ value, max, title, unit, color, icon, trend, trendValue }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isHigh = percentage > 80;
  const isMedium = percentage > 50 && percentage <= 80;
  
  return (
    <motion.div 
      className="bg-base-200 rounded-lg p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-${color}/20`}>
            {icon}
          </div>
          <span className="font-medium">{title}</span>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-success' : 
            trend === 'down' ? 'text-error' : 
            'text-base-content/70'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            <span>{trendValue ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : ''}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-2xl font-bold">{value.toLocaleString()}</span>
          <span className="text-xs text-base-content/70">{unit}</span>
        </div>
        
        <div className="w-full bg-base-300 rounded-full h-3 relative overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${
              isHigh ? 'bg-error' : isMedium ? 'bg-warning' : `bg-${color}`
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Animated pulse effect for high values */}
          {isHigh && (
            <motion.div 
              className="absolute inset-0 bg-error/30 rounded-full"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        
        <div className="flex justify-between text-xs mt-1">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    </motion.div>
  );
};

const RealTimeEnergyGauge: React.FC = () => {
  const [data, setData] = useState({
    current: 0,
    voltage: 0,
    power: 0,
    renewable: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  
  // Generate random data with trends
  const generateData = () => {
    setIsLoading(true);
    
    // Get previous values to create trends
    const prevCurrent = data.current || 0;
    const prevVoltage = data.voltage || 0;
    const prevPower = data.power || 0;
    const prevRenewable = data.renewable || 0;
    
    // Generate new values with some randomness but maintain trends
    const newCurrent = Math.max(50, Math.min(150, prevCurrent + (Math.random() * 20 - 10)));
    const newVoltage = Math.max(200, Math.min(250, prevVoltage + (Math.random() * 10 - 5)));
    const newPower = Math.max(2000, Math.min(8000, prevPower + (Math.random() * 500 - 250)));
    const newRenewable = Math.max(20, Math.min(80, prevRenewable + (Math.random() * 10 - 5)));
    
    // Show alert if power is too high
    if (newPower > 7000 && !showAlert) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
    
    setTimeout(() => {
      setData({
        current: Math.round(newCurrent * 10) / 10,
        voltage: Math.round(newVoltage * 10) / 10,
        power: Math.round(newPower),
        renewable: Math.round(newRenewable)
      });
      setIsLoading(false);
    }, 800);
  };
  
  // Calculate trends
  const calculateTrend = (current: number, previous: number): { direction: 'up' | 'down' | 'stable', value: number } => {
    if (!previous) return { direction: 'stable', value: 0 };
    
    const percentChange = ((current - previous) / previous) * 100;
    
    if (Math.abs(percentChange) < 1) {
      return { direction: 'stable', value: 0 };
    }
    
    return {
      direction: percentChange > 0 ? 'up' : 'down',
      value: Math.round(percentChange * 10) / 10
    };
  };
  
  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        generateData();
      }, 3000); // Refresh every 3 seconds
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh, data]);
  
  // Initialize data
  useEffect(() => {
    generateData();
  }, []);
  
  // Calculate trends
  const currentTrend = calculateTrend(data.current, data.current * 0.95);
  const voltageTrend = calculateTrend(data.voltage, data.voltage * 0.98);
  const powerTrend = calculateTrend(data.power, data.power * 0.97);
  const renewableTrend = calculateTrend(data.renewable, data.renewable * 0.94);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card bg-base-100"
    >
      <div className="card-body p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-warning" />
            <h3 className="card-title">Real-Time Energy Monitoring</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className={`btn ${isAutoRefresh ? 'btn-primary' : 'btn-ghost'} btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              <span className="ml-1 text-xs">{isAutoRefresh ? 'Live' : 'Paused'}</span>
            </button>
            
            <button 
              className={`btn btn-ghost btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={generateData}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showAlert && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="alert alert-warning mb-4"
            >
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-bold">High Power Consumption Detected</h3>
                <div className="text-xs">Consider optimizing energy usage to reduce costs</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Gauge 
            value={data.current}
            max={150}
            title="Current"
            unit="Amperes"
            color="info"
            icon={<Zap className="h-5 w-5 text-info" />}
            trend={currentTrend.direction}
            trendValue={currentTrend.value}
          />
          
          <Gauge 
            value={data.voltage}
            max={250}
            title="Voltage"
            unit="Volts"
            color="warning"
            icon={<Battery className="h-5 w-5 text-warning" />}
            trend={voltageTrend.direction}
            trendValue={voltageTrend.value}
          />
          
          <Gauge 
            value={data.power}
            max={8000}
            title="Power"
            unit="Watts"
            color="error"
            icon={<Zap className="h-5 w-5 text-error" />}
            trend={powerTrend.direction}
            trendValue={powerTrend.value}
          />
          
          <Gauge 
            value={data.renewable}
            max={100}
            title="Renewable"
            unit="Percent"
            color="success"
            icon={<Sun className="h-5 w-5 text-success" />}
            trend={renewableTrend.direction}
            trendValue={renewableTrend.value}
          />
        </div>
        
        <div className="mt-4 bg-base-200 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">System Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm">All systems operational</span>
          </div>
          <p className="text-xs text-base-content/70 mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RealTimeEnergyGauge;
