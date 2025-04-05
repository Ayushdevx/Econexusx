import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, CloudSnow, CloudLightning, RefreshCw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy';
  impact: 'positive' | 'negative' | 'neutral';
  impactValue: number;
  forecast: Array<{
    day: string;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy';
    temperature: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

const WeatherImpactWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate random weather data
  const generateWeatherData = () => {
    setIsLoading(true);
    
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'windy'] as const;
    const impacts = ['positive', 'negative', 'neutral'] as const;
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const currentImpact = getWeatherImpact(currentCondition);
    
    const data: WeatherData = {
      temperature: Math.floor(Math.random() * 35) - 5, // -5 to 30°C
      humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
      windSpeed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
      condition: currentCondition,
      impact: currentImpact.impact,
      impactValue: currentImpact.value,
      forecast: days.map(day => {
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const impact = getWeatherImpact(condition);
        return {
          day,
          condition,
          temperature: Math.floor(Math.random() * 35) - 5,
          impact: impact.impact
        };
      })
    };
    
    setTimeout(() => {
      setWeatherData(data);
      setIsLoading(false);
    }, 800);
  };
  
  // Determine weather impact on energy production
  const getWeatherImpact = (condition: WeatherData['condition']): { impact: WeatherData['impact']; value: number } => {
    switch (condition) {
      case 'sunny':
        return { impact: 'positive', value: Math.floor(Math.random() * 15) + 10 }; // 10-25%
      case 'cloudy':
        return { impact: 'neutral', value: Math.floor(Math.random() * 10) - 5 }; // -5 to 5%
      case 'rainy':
        return { impact: 'negative', value: -(Math.floor(Math.random() * 15) + 5) }; // -5 to -20%
      case 'snowy':
        return { impact: 'negative', value: -(Math.floor(Math.random() * 20) + 10) }; // -10 to -30%
      case 'stormy':
        return { impact: 'negative', value: -(Math.floor(Math.random() * 25) + 15) }; // -15 to -40%
      case 'windy':
        return { impact: 'positive', value: Math.floor(Math.random() * 20) + 5 }; // 5-25%
      default:
        return { impact: 'neutral', value: 0 };
    }
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-warning" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-base-content/70" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-info" />;
      case 'snowy':
        return <CloudSnow className="h-6 w-6 text-info" />;
      case 'stormy':
        return <CloudLightning className="h-6 w-6 text-warning" />;
      case 'windy':
        return <Wind className="h-6 w-6 text-primary" />;
      default:
        return <Sun className="h-6 w-6 text-warning" />;
    }
  };
  
  // Get impact color
  const getImpactColor = (impact: WeatherData['impact']) => {
    switch (impact) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      case 'neutral':
        return 'text-base-content/70';
      default:
        return 'text-base-content/70';
    }
  };
  
  // Initialize data
  useEffect(() => {
    generateWeatherData();
  }, []);
  
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 h-full"
      >
        <div className="card-body p-6 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </motion.div>
    );
  }
  
  if (!weatherData) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card bg-base-100 h-full"
    >
      <div className="card-body p-6">
        <div className="flex justify-between items-start">
          <h3 className="card-title">Weather Impact</h3>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={generateWeatherData}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Current Weather */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-base-200 rounded-xl">
                {getWeatherIcon(weatherData.condition)}
              </div>
              <div>
                <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
                <div className="text-base-content/70 capitalize">{weatherData.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-error" />
                <span className="text-sm">{weatherData.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" />
                <span className="text-sm">{weatherData.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-primary" />
                <span className="text-sm">{weatherData.windSpeed} km/h</span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Energy Production Impact</div>
              <div className={`text-xl font-bold ${getImpactColor(weatherData.impact)}`}>
                {weatherData.impactValue > 0 ? '+' : ''}{weatherData.impactValue}%
              </div>
              <p className="text-xs text-base-content/70 mt-1">
                {weatherData.impact === 'positive'
                  ? 'Current weather conditions are boosting energy production'
                  : weatherData.impact === 'negative'
                  ? 'Current weather conditions are reducing energy production'
                  : 'Current weather has minimal impact on energy production'}
              </p>
            </div>
          </div>
          
          {/* Weather Forecast */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-base-300 pt-4 md:pt-0 md:pl-6">
            <h4 className="font-medium mb-4">7-Day Forecast</h4>
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8">{getWeatherIcon(day.condition)}</div>
                    <span className="w-20">{day.day}</span>
                    <span className="text-sm">{day.temperature}°C</span>
                  </div>
                  <div className={`badge ${
                    day.impact === 'positive' ? 'badge-success' : 
                    day.impact === 'negative' ? 'badge-error' : 
                    'badge-ghost'
                  }`}>
                    {day.impact === 'positive' ? 'Good' : 
                     day.impact === 'negative' ? 'Poor' : 
                     'Neutral'}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 bg-base-200 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Weather Optimization Tip</h4>
              <p className="text-xs">
                {weatherData.impact === 'positive'
                  ? 'Maximize energy collection during these favorable conditions by ensuring all systems are operational.'
                  : weatherData.impact === 'negative'
                  ? 'Consider shifting non-essential operations to days with better forecasted conditions.'
                  : 'Current conditions are stable. Maintain regular operations and monitor for changes.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherImpactWidget;
