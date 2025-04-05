import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Lightbulb, Cpu, RefreshCw, Download } from 'lucide-react';

interface PredictionData {
  time: string;
  actual: number;
  predicted: number;
  lower: number;
  upper: number;
}

const PredictiveAnalytics: React.FC = () => {
  const [data, setData] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [predictionHorizon, setPredictionHorizon] = useState<'day' | 'week' | 'month'>('day');
  const [insights, setInsights] = useState<{
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    anomalies: number;
    recommendation: string;
  }>({ trend: 'up', percentage: 0, anomalies: 0, recommendation: '' });
  
  // Generate random prediction data
  const generateData = (horizon: 'day' | 'week' | 'month') => {
    setIsLoading(true);
    
    // Define time points based on horizon
    const timePoints = {
      day: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      month: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    };
    
    // Generate base trend with some randomness
    const baseValue = 100;
    const trendFactor = Math.random() > 0.5 ? 1 : -1;
    const volatility = Math.random() * 10 + 5;
    
    // Generate historical data (actual values)
    const historicalPoints = horizon === 'day' ? 12 : (horizon === 'week' ? 3 : 15);
    const futurePoints = timePoints[horizon].length - historicalPoints;
    
    const historicalData = Array.from({ length: historicalPoints }, (_, i) => {
      const trend = baseValue + (trendFactor * i * (Math.random() * 2 + 1));
      const random = (Math.random() - 0.5) * volatility;
      const actual = Math.max(0, trend + random);
      
      return {
        time: timePoints[horizon][i],
        actual,
        predicted: null,
        lower: null,
        upper: null
      };
    });
    
    // Calculate trend based on historical data
    const firstValue = historicalData[0].actual;
    const lastValue = historicalData[historicalData.length - 1].actual;
    const trendPercentage = ((lastValue - firstValue) / firstValue) * 100;
    const trendDirection = trendPercentage > 1 ? 'up' : (trendPercentage < -1 ? 'down' : 'stable');
    
    // Generate future predictions with confidence intervals
    const lastActual = lastValue;
    const futureData = Array.from({ length: futurePoints }, (_, i) => {
      const index = i + historicalPoints;
      const trend = lastActual + (trendFactor * i * (Math.random() * 3 + 1.5));
      const predicted = Math.max(0, trend + (Math.random() - 0.5) * volatility * 0.5);
      const confidenceInterval = volatility * (1 + i * 0.1); // Increasing uncertainty over time
      
      return {
        time: timePoints[horizon][index],
        actual: null,
        predicted,
        lower: Math.max(0, predicted - confidenceInterval),
        upper: predicted + confidenceInterval
      };
    });
    
    // Combine historical and future data
    const combinedData = [...historicalData, ...futureData];
    
    // Generate insights
    const anomalies = Math.floor(Math.random() * 3);
    const recommendations = [
      'Optimize energy usage during peak hours to reduce costs',
      'Consider increasing renewable energy capacity to meet growing demand',
      'Implement load balancing to reduce strain during high usage periods',
      'Schedule maintenance during predicted low usage periods',
      'Investigate potential equipment issues in sectors with anomalous readings'
    ];
    
    setData(combinedData);
    setInsights({
      trend: trendDirection,
      percentage: Math.abs(trendPercentage),
      anomalies,
      recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
    });
    
    setTimeout(() => setIsLoading(false), 800);
  };
  
  // Initialize data
  useEffect(() => {
    generateData(predictionHorizon);
  }, [predictionHorizon]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const hasActual = payload.some((p: any) => p.name === 'actual' && p.value !== null);
      const hasPredicted = payload.some((p: any) => p.name === 'predicted' && p.value !== null);
      
      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
          <p className="font-medium mb-1">{label}</p>
          {hasActual && (
            <p className="text-sm flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              Actual: {payload.find((p: any) => p.name === 'actual').value.toFixed(1)} kWh
            </p>
          )}
          {hasPredicted && (
            <p className="text-sm flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              Predicted: {payload.find((p: any) => p.name === 'predicted').value.toFixed(1)} kWh
            </p>
          )}
          {hasPredicted && (
            <p className="text-xs opacity-70 mt-1">
              Confidence Interval: {payload.find((p: any) => p.name === 'lower').value.toFixed(1)} - {payload.find((p: any) => p.name === 'upper').value.toFixed(1)} kWh
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card bg-base-100"
    >
      <div className="card-body p-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h3 className="card-title flex items-center gap-2">
              <Cpu className="h-5 w-5 text-secondary" />
              AI Predictive Analytics
            </h3>
            <p className="text-sm text-base-content/70">Forecasting energy consumption with machine learning</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <div className="join">
              <button 
                className={`join-item btn btn-sm ${predictionHorizon === 'day' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPredictionHorizon('day')}
              >
                Day
              </button>
              <button 
                className={`join-item btn btn-sm ${predictionHorizon === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPredictionHorizon('week')}
              >
                Week
              </button>
              <button 
                className={`join-item btn btn-sm ${predictionHorizon === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPredictionHorizon('month')}
              >
                Month
              </button>
            </div>
            
            <button 
              className={`btn btn-ghost btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={() => generateData(predictionHorizon)}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="h-4 w-4 mr-1" />}
              Refresh
            </button>
            
            <button className="btn btn-ghost btn-sm">
              <Download className="h-4 w-4 mr-1" />
              Export
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
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Reference line for current time */}
                <ReferenceLine
                  x={data.findIndex(d => d.actual === null && d.predicted !== null) > 0 
                    ? data[data.findIndex(d => d.actual === null && d.predicted !== null) - 1].time 
                    : undefined}
                  stroke="#fff"
                  strokeDasharray="3 3"
                  label={{ value: 'Now', position: 'insideTopRight', fill: '#fff' }}
                />
                
                {/* Confidence interval area */}
                <ReferenceArea
                  x1={data.find(d => d.lower !== null)?.time}
                  x2={data[data.length - 1].time}
                  y1={0}
                  y2={Math.max(...data.map(d => d.upper || 0)) * 1.1}
                  fill="url(#confidenceGradient)"
                  fillOpacity={0.1}
                />
                
                {/* Actual line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="actual"
                />
                
                {/* Predicted line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="predicted"
                />
                
                {/* Confidence interval bounds */}
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={false}
                  name="upper"
                />
                
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={false}
                  name="lower"
                />
                
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-base-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-base-content/70">Trend Analysis</h4>
              {insights.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : insights.trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-error" />
              ) : (
                <div className="h-5 w-5 border-t-2 border-warning"></div>
              )}
            </div>
            <p className="text-xl font-bold mt-1">
              {insights.trend === 'up' ? '+' : insights.trend === 'down' ? '-' : ''}
              {insights.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-base-content/70 mt-1">
              {insights.trend === 'up' 
                ? 'Increasing trend in energy consumption' 
                : insights.trend === 'down'
                ? 'Decreasing trend in energy consumption'
                : 'Stable energy consumption pattern'}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-base-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-base-content/70">Anomaly Detection</h4>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold mt-1">
              {insights.anomalies} {insights.anomalies === 1 ? 'anomaly' : 'anomalies'} detected
            </p>
            <p className="text-xs text-base-content/70 mt-1">
              {insights.anomalies === 0 
                ? 'No unusual patterns in energy consumption' 
                : `${insights.anomalies} unusual pattern${insights.anomalies === 1 ? '' : 's'} detected in the data`}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-base-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-base-content/70">AI Recommendation</h4>
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm mt-2 leading-tight">
              {insights.recommendation}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictiveAnalytics;
