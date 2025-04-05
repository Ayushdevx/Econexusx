import { faker } from '@faker-js/faker';

// Types for simulated data
export interface SimulatedDataPoint {
  timestamp: number;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
}

export interface SimulatedTimeSeriesData {
  id: string;
  name: string;
  data: SimulatedDataPoint[];
  color: string;
  unit: string;
  total?: number;
  average?: number;
  min?: number;
  max?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Configuration for data simulation
export interface SimulationConfig {
  pointCount: number;
  minValue: number;
  maxValue: number;
  volatility: number;
  trend?: 'up' | 'down' | 'stable' | 'random';
  trendStrength?: number;
  unit?: string;
  color?: string;
  updateFrequency?: number;
  anomalyProbability?: number;
  anomalyMagnitude?: number;
  seasonality?: boolean;
  seasonalityPeriod?: number;
  seasonalityAmplitude?: number;
}

// Default configuration
const defaultConfig: SimulationConfig = {
  pointCount: 24,
  minValue: 0,
  maxValue: 100,
  volatility: 5,
  trend: 'random',
  trendStrength: 0.2,
  unit: '',
  color: '#3b82f6',
  updateFrequency: 5000,
  anomalyProbability: 0.05,
  anomalyMagnitude: 2.5,
  seasonality: false,
  seasonalityPeriod: 24,
  seasonalityAmplitude: 10,
};

// Generate initial time series data
export const generateTimeSeriesData = (
  name: string,
  config: Partial<SimulationConfig> = {}
): SimulatedTimeSeriesData => {
  const mergedConfig = { ...defaultConfig, ...config };
  const {
    pointCount,
    minValue,
    maxValue,
    volatility,
    trend,
    trendStrength,
    unit,
    color,
    seasonality,
    seasonalityPeriod,
    seasonalityAmplitude,
    anomalyProbability,
    anomalyMagnitude,
  } = mergedConfig;

  // Generate base value
  const baseValue = faker.number.float({
    min: minValue + (maxValue - minValue) * 0.3,
    max: maxValue - (maxValue - minValue) * 0.3,
  });

  // Generate trend factor
  let trendFactor = 0;
  if (trend === 'up') trendFactor = trendStrength || 0.2;
  else if (trend === 'down') trendFactor = -(trendStrength || 0.2);
  else if (trend === 'random') trendFactor = (Math.random() - 0.5) * (trendStrength || 0.4);

  // Generate data points
  const now = Date.now();
  const data: SimulatedDataPoint[] = [];
  let currentValue = baseValue;

  for (let i = 0; i < pointCount; i++) {
    // Apply trend
    currentValue += trendFactor * (maxValue - minValue) * (1 / pointCount);

    // Apply seasonality if enabled
    let seasonalityEffect = 0;
    if (seasonality && seasonalityPeriod && seasonalityAmplitude) {
      seasonalityEffect =
        Math.sin((2 * Math.PI * i) / seasonalityPeriod) * seasonalityAmplitude;
    }

    // Apply random volatility
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;

    // Apply anomaly if probability hits
    const anomaly = Math.random() < anomalyProbability ? (Math.random() - 0.5) * 2 * anomalyMagnitude * volatility : 0;

    // Calculate final value with constraints
    let value = currentValue + randomFactor + seasonalityEffect + anomaly;
    value = Math.max(minValue, Math.min(maxValue, value));
    currentValue = value;

    // Create data point
    const previousValue = i > 0 ? data[i - 1].value : value;
    const change = value - previousValue;
    const changePercentage = (change / previousValue) * 100;

    data.push({
      timestamp: now - (pointCount - i) * (3600000 / pointCount),
      value,
      previousValue,
      change,
      changePercentage,
    });
  }

  // Calculate statistics
  const values = data.map((d) => d.value);
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Determine overall trend
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const overallChange = lastValue - firstValue;
  let overallTrend: 'up' | 'down' | 'stable' = 'stable';
  if (overallChange > volatility) overallTrend = 'up';
  else if (overallChange < -volatility) overallTrend = 'down';

  return {
    id: faker.string.uuid(),
    name,
    data,
    color,
    unit,
    total,
    average,
    min,
    max,
    trend: overallTrend,
  };
};

// Update time series data with new point
export const updateTimeSeriesData = (
  series: SimulatedTimeSeriesData,
  config: Partial<SimulationConfig> = {}
): SimulatedTimeSeriesData => {
  const mergedConfig = { ...defaultConfig, ...config };
  const {
    minValue,
    maxValue,
    volatility,
    trend,
    trendStrength,
    seasonality,
    seasonalityPeriod,
    seasonalityAmplitude,
    anomalyProbability,
    anomalyMagnitude,
  } = mergedConfig;

  const data = [...series.data];
  const lastPoint = data[data.length - 1];
  let currentValue = lastPoint.value;

  // Apply trend
  let trendFactor = 0;
  if (trend === 'up') trendFactor = trendStrength || 0.2;
  else if (trend === 'down') trendFactor = -(trendStrength || 0.2);
  else if (trend === 'random') trendFactor = (Math.random() - 0.5) * (trendStrength || 0.4);

  currentValue += trendFactor * (maxValue - minValue) * 0.05;

  // Apply seasonality if enabled
  let seasonalityEffect = 0;
  if (seasonality && seasonalityPeriod && seasonalityAmplitude) {
    const position = (data.length % seasonalityPeriod) / seasonalityPeriod;
    seasonalityEffect = Math.sin(2 * Math.PI * position) * seasonalityAmplitude;
  }

  // Apply random volatility
  const randomFactor = (Math.random() - 0.5) * 2 * volatility;

  // Apply anomaly if probability hits
  const anomaly = Math.random() < anomalyProbability ? (Math.random() - 0.5) * 2 * anomalyMagnitude * volatility : 0;

  // Calculate final value with constraints
  let value = currentValue + randomFactor + seasonalityEffect + anomaly;
  value = Math.max(minValue, Math.min(maxValue, value));

  // Create new data point
  const newPoint: SimulatedDataPoint = {
    timestamp: Date.now(),
    value,
    previousValue: currentValue,
    change: value - currentValue,
    changePercentage: ((value - currentValue) / currentValue) * 100,
  };

  // Remove oldest point and add new point
  data.shift();
  data.push(newPoint);

  // Recalculate statistics
  const values = data.map((d) => d.value);
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Determine overall trend
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const overallChange = lastValue - firstValue;
  let overallTrend: 'up' | 'down' | 'stable' = 'stable';
  if (overallChange > volatility) overallTrend = 'up';
  else if (overallChange < -volatility) overallTrend = 'down';

  return {
    ...series,
    data,
    total,
    average,
    min,
    max,
    trend: overallTrend,
  };
};

// Generate multiple time series data sets
export const generateMultipleTimeSeries = (
  names: string[],
  configs: Partial<SimulationConfig>[] = []
): SimulatedTimeSeriesData[] => {
  return names.map((name, index) => {
    const config = configs[index] || {};
    return generateTimeSeriesData(name, config);
  });
};

// Format currency in Indian Rupees
export const formatIndianRupees = (value: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(value);
};

// Format large numbers with Indian number system (lakhs, crores)
export const formatIndianNumber = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  }
  return `₹${value}`;
};

// Generate random color
export const generateRandomColor = (): string => {
  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ef4444', // red
    '#84cc16', // lime
    '#6366f1', // indigo
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate random data for pie/donut charts
export const generatePieChartData = (
  categories: string[],
  total: number = 100
): { name: string; value: number; color: string }[] => {
  let remaining = total;
  const result = [];
  
  for (let i = 0; i < categories.length; i++) {
    const isLast = i === categories.length - 1;
    const value = isLast ? remaining : Math.floor(Math.random() * remaining * 0.7);
    remaining -= value;
    
    result.push({
      name: categories[i],
      value,
      color: generateRandomColor(),
    });
  }
  
  return result;
};

// Generate random data for heatmap
export const generateHeatmapData = (
  rows: number,
  columns: number,
  minValue: number = 0,
  maxValue: number = 100
): { x: number; y: number; value: number }[] => {
  const result = [];
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      result.push({
        x,
        y,
        value: faker.number.float({ min: minValue, max: maxValue, multipleOf: 0.01 }),
      });
    }
  }
  
  return result;
};

// Generate random network data for force-directed graphs
export const generateNetworkData = (
  nodeCount: number,
  density: number = 0.2
): { nodes: any[]; links: any[] } => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
    name: faker.company.name(),
    group: Math.floor(Math.random() * 5),
    value: faker.number.float({ min: 10, max: 100 }),
  }));
  
  const links = [];
  for (let i = 0; i < nodeCount; i++) {
    const linkCount = Math.floor(Math.random() * nodeCount * density);
    for (let j = 0; j < linkCount; j++) {
      const target = Math.floor(Math.random() * nodeCount);
      if (i !== target) {
        links.push({
          source: `node-${i}`,
          target: `node-${target}`,
          value: faker.number.float({ min: 1, max: 10 }),
        });
      }
    }
  }
  
  return { nodes, links };
};

// Generate random data for radar charts
export const generateRadarChartData = (
  categories: string[],
  seriesCount: number = 1
): any[] => {
  return Array.from({ length: seriesCount }, (_, i) => {
    const data = categories.map(category => ({
      category,
      value: faker.number.float({ min: 20, max: 100, multipleOf: 0.1 }),
    }));
    
    return {
      name: `Series ${i + 1}`,
      data,
      color: generateRandomColor(),
    };
  });
};

// Generate random data for bubble charts
export const generateBubbleChartData = (
  pointCount: number
): { x: number; y: number; z: number; name: string; color: string }[] => {
  return Array.from({ length: pointCount }, () => ({
    x: faker.number.float({ min: 0, max: 100, multipleOf: 0.1 }),
    y: faker.number.float({ min: 0, max: 100, multipleOf: 0.1 }),
    z: faker.number.float({ min: 5, max: 50, multipleOf: 0.1 }),
    name: faker.company.name(),
    color: generateRandomColor(),
  }));
};

// Generate random data for waterfall charts
export const generateWaterfallChartData = (
  categories: string[]
): { name: string; value: number; isTotal?: boolean }[] => {
  let runningTotal = faker.number.float({ min: 1000, max: 5000, multipleOf: 0.01 });
  const result = [{ name: 'Start', value: runningTotal, isTotal: true }];
  
  for (let i = 0; i < categories.length; i++) {
    const change = faker.number.float({ min: -1000, max: 1000, multipleOf: 0.01 });
    runningTotal += change;
    result.push({ name: categories[i], value: change });
  }
  
  result.push({ name: 'End', value: runningTotal, isTotal: true });
  
  return result;
};

// Generate random data for sankey diagrams
export const generateSankeyData = (
  nodeCount: number,
  linkCount: number
): { nodes: any[]; links: any[] } => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
    name: faker.company.name(),
  }));
  
  const links = Array.from({ length: linkCount }, () => {
    const source = Math.floor(Math.random() * (nodeCount - 1));
    const target = Math.floor(Math.random() * (nodeCount - source - 1)) + source + 1;
    
    return {
      source: `node-${source}`,
      target: `node-${target}`,
      value: faker.number.float({ min: 100, max: 1000 }),
    };
  });
  
  return { nodes, links };
};
