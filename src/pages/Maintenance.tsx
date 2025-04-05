import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { LineChart, AreaChart, BarChart } from '@tremor/react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Filter, 
  Download,
  Bell,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Settings,
  History,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  Users,
  BarChart3,
  Info,
  Plane,
  Camera,
  Thermometer,
  Sun,
  Wind,
  Battery,
  RotateCcw,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Brain,
  Eye,
  Target,
  Zap,
  AlertOctagon,
  CheckCircle2,
  Cpu,
  ZapOff,
  Box,
  Radio,
  Wifi,
  Cloud,
  Droplets,
  Joystick,
  Bot,
  Crosshair,
  Lightbulb,
  Activity
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Panel {
  id: string;
  location: string;
  expectedOutput: number;
  currentOutput: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
  status: 'Normal' | 'Slight Drop' | 'Critical Drop';
  issue: string;
  assignedTechnician: string;
  resolved: boolean;
}

interface PerformanceData {
  time: string;
  expected: number;
  actual: number;
}

interface MaintenanceData {
  panels: Panel[];
  performanceHistory: PerformanceData[];
}

interface DroneTask {
  id: string;
  type: 'inspection' | 'cleaning' | 'repair';
  status: 'pending' | 'in_progress' | 'completed';
  targetPanel: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  confidence: number;
  detectedObject?: string;
  recommendation?: string;
}

interface DroneMetrics {
  temperature: number;
  altitude: number;
  speed: number;
  signalStrength: number;
  windSpeed: number;
  humidity: number;
  pitch: number;
  roll: number;
  yaw: number;
  verticalSpeed: number;
  horizontalSpeed: number;
  gpsAccuracy: number;
}

interface AIDetection {
  id: string;
  type: 'anomaly' | 'component' | 'damage' | 'corrosion' | 'thermal_anomaly' | 'structural_stress' | 'debris';
  label: string;
  confidence: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  severity: 'low' | 'medium' | 'high';
  details?: {
    temperature?: number;
    stressLevel?: number;
    degradation?: number;
    recommendation?: string;
  };
}

interface PredictiveAnalysis {
  id: string;
  type: 'degradation' | 'failure' | 'maintenance' | 'optimization' | 'weather_impact' | 'performance_forecast' | 'lifespan_prediction' | 'energy_optimization' | 'fault_prediction' | 'efficiency_trend';
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  affectedComponents: string[];
  recommendation: string;
  potentialSavings?: number;
  aiConfidence: number;
  dataPoints: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  priority: 'immediate' | 'scheduled' | 'monitoring';
  automationPossible: boolean;
}

interface DroneControls {
  flightMode: 'manual' | 'autonomous' | 'precision' | 'inspection' | 'emergency';
  stabilization: boolean;
  collisionAvoidance: boolean;
  precisionHover: boolean;
  returnToHome: boolean;
  followPath: boolean;
  inspectionMode: 'visual' | 'thermal' | 'multispectral' | 'lidar';
  gimbalControl: {
    pitch: number;
    yaw: number;
    roll: number;
    stabilized: boolean;
  };
  flightParameters: {
    maxSpeed: number;
    maxAltitude: number;
    returnAltitude: number;
    hoverPrecision: number;
  };
}

interface EnvironmentalMetrics extends DroneMetrics {
  uvIndex: number;
  solarIrradiance: number;
  dustLevel: number;
  surfaceTemperature: number;
  cloudCover: number;
  precipitationRisk: number;
  windDirection: number;
  airQuality: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
  };
  soiling: {
    rate: number;
    accumulation: number;
    impact: number;
  };
  atmosphericPressure: number;
  visibility: number;
  lightIntensity: number;
}

type AnalysisMode = 'rgb' | 'thermal' | 'infrared' | 'xray' | 'structural' | 'electromagnetic' | '3d_scan';

// Add new AI analysis types
interface AIAnalysis {
  id: string;
  type: 'anomaly' | 'prediction' | 'optimization' | 'risk' | 'pattern' | 'correlation';
  confidence: number;
  timestamp: string;
  insights: {
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
    metrics: {
      name: string;
      value: number;
      unit: string;
      trend: 'up' | 'down' | 'stable';
    }[];
  };
  relatedComponents: string[];
  aiModel: {
    name: string;
    version: string;
    accuracy: number;
  };
}

// Add enhanced drone telemetry
interface DroneTelemetry extends DroneMetrics {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    heading: number;
    strength: number;
  };
  lidar: {
    distance: number;
    pointCloud: number[];
    surfaceQuality: number;
  };
  camera: {
    zoom: number;
    focus: number;
    stabilization: number;
    resolution: string;
  };
  thermalSensor: {
    minTemp: number;
    maxTemp: number;
    avgTemp: number;
    hotspots: { x: number; y: number; temp: number }[];
  };
}

// Add new environmental sensors
interface AdvancedEnvironmentalMetrics extends EnvironmentalMetrics {
  spectralAnalysis: {
    infrared: number;
    ultraviolet: number;
    visible: number;
    nearInfrared: number;
  };
  atmosphericQuality: {
    co2: number;
    voc: number;
    aqi: number;
    pollutants: {
      type: string;
      level: number;
      threshold: number;
    }[];
  };
  weatherConditions: {
    precipitation: number;
    humidity: number;
    dewPoint: number;
    barometricPressure: number;
    windGust: number;
    windDirection: number;
    cloudBase: number;
    visibility: number;
  };
  solarMetrics: {
    directNormal: number;
    diffuseHorizontal: number;
    globalHorizontal: number;
    uvIndex: number;
    clearSkyRatio: number;
    shadingFactor: number;
  };
}

// Generate maintenance data
const generateMaintenanceData = (): MaintenanceData => {
  const panels = Array.from({ length: 12 }, (_, i) => ({
    id: `PANEL-${String(i + 1).padStart(3, '0')}`,
    location: faker.location.streetAddress(),
    expectedOutput: faker.number.int({ min: 80, max: 100 }),
    currentOutput: faker.number.int({ min: 60, max: 95 }),
    lastMaintenance: faker.date.past(),
    nextMaintenance: faker.date.future(),
    status: faker.helpers.arrayElement(['Normal', 'Slight Drop', 'Critical Drop']) as Panel['status'],
    issue: faker.helpers.arrayElement(['Dust accumulation', 'Wiring issues', 'Panel orientation', 'Aging/damage']),
    assignedTechnician: faker.person.fullName(),
    resolved: faker.datatype.boolean()
  }));

  const performanceHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    expected: faker.number.int({ min: 80, max: 100 }),
    actual: faker.number.int({ min: 60, max: 95 })
  }));

  return { panels, performanceHistory };
};

const MaintenancePanel = ({ panel, onAssignDrone }: { panel: any; onAssignDrone: () => void }) => (
  <div className="card bg-base-200 shadow-lg">
    <div className="card-body">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">Panel {panel.id}</h3>
          <p className="text-sm text-base-content/70">{panel.location}</p>
        </div>
        <div className={`badge ${
          panel.status === 'critical' ? 'badge-error' : 
          panel.status === 'warning' ? 'badge-warning' : 
          'badge-success'
        }`}>
          {panel.status}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span>Efficiency:</span>
          <span className="font-medium">{panel.efficiency}%</span>
        </div>
        <div className="flex justify-between">
          <span>Last Maintenance:</span>
          <span className="font-medium">{panel.lastMaintenance}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Check:</span>
          <span className="font-medium">{panel.nextCheck}</span>
        </div>
      </div>
      <div className="card-actions justify-end mt-4">
        <button 
          className="btn btn-primary btn-sm gap-2"
          onClick={onAssignDrone}
        >
          <Plane className="w-4 h-4" />
          Assign Drone
        </button>
      </div>
    </div>
  </div>
);

const Maintenance = () => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData>(generateMaintenanceData());
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Panel PANEL-001 needs immediate attention', time: '5m ago' },
    { id: 2, type: 'info', message: 'Maintenance scheduled for PANEL-003', time: '1h ago' },
    { id: 3, type: 'success', message: 'Panel PANEL-005 maintenance completed', time: '2h ago' }
  ]);
  const [timeRange, setTimeRange] = useState('24h');
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
  const [showDroneSimulation, setShowDroneSimulation] = useState(false);
  const [droneTasks, setDroneTasks] = useState<DroneTask[]>([
    { id: 'TASK-001', type: 'inspection', status: 'pending', targetPanel: 'PANEL-001', priority: 'high' },
    { id: 'TASK-002', type: 'cleaning', status: 'pending', targetPanel: 'PANEL-003', priority: 'medium' },
    { id: 'TASK-003', type: 'repair', status: 'pending', targetPanel: 'PANEL-005', priority: 'high' }
  ]);
  const [activeTask, setActiveTask] = useState<DroneTask | null>(null);
  const [dronePosition, setDronePosition] = useState({ x: 50, y: 50 });
  const [droneRotation, setDroneRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'3d' | 'pov'>('3d');
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Potential structural damage detected on tower segment A3',
      timestamp: new Date().toISOString(),
      confidence: 89,
      detectedObject: 'Tower Support Beam',
      recommendation: 'Schedule immediate inspection of support structure'
    },
    {
      id: '2',
      type: 'info',
      message: 'Signal strength analysis in progress',
      timestamp: new Date().toISOString(),
      confidence: 95,
      detectedObject: 'Signal Transmitter',
      recommendation: 'Monitor signal patterns for next 24 hours'
    },
    {
      id: '3',
      type: 'success',
      message: 'Equipment integrity check completed',
      timestamp: new Date().toISOString(),
      confidence: 98,
      detectedObject: 'Tower Equipment',
      recommendation: 'All systems operating within normal parameters'
    }
  ]);
  const [droneMetrics, setDroneMetrics] = useState<DroneMetrics>({
    temperature: 25,
    altitude: 15,
    speed: 5,
    signalStrength: 95,
    windSpeed: 8,
    humidity: 65,
    pitch: 0,
    roll: 0,
    yaw: 0,
    verticalSpeed: 0,
    horizontalSpeed: 0,
    gpsAccuracy: 10
  });
  const [detections, setDetections] = useState<AIDetection[]>([
    {
      id: '1',
      type: 'damage',
      label: 'Surface Crack',
      confidence: 89,
      position: { x: 25, y: 35 },
      size: { width: 100, height: 80 },
      severity: 'high',
      details: {
        stressLevel: 75,
        degradation: 45,
        recommendation: 'Immediate structural repair required'
      }
    },
    {
      id: '2',
      type: 'thermal_anomaly',
      label: 'Heat Buildup',
      confidence: 95,
      position: { x: 45, y: 25 },
      size: { width: 60, height: 60 },
      severity: 'medium',
      details: {
        temperature: 48.5,
        recommendation: 'Check cooling system'
      }
    },
    {
      id: '3',
      type: 'corrosion',
      label: 'Metal Degradation',
      confidence: 92,
      position: { x: 65, y: 45 },
      size: { width: 40, height: 40 },
      severity: 'medium',
      details: {
        degradation: 35,
        recommendation: 'Apply anti-corrosion treatment'
      }
    }
  ]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('rgb');
  const controls = useAnimation();
  const [droneControls, setDroneControls] = useState<DroneControls>({
    flightMode: 'manual',
    stabilization: true,
    collisionAvoidance: true,
    precisionHover: false,
    returnToHome: false,
    followPath: false,
    inspectionMode: 'visual',
    gimbalControl: {
      pitch: 0,
      yaw: 0,
      roll: 0,
      stabilized: true
    },
    flightParameters: {
      maxSpeed: 10,
      maxAltitude: 30,
      returnAltitude: 20,
      hoverPrecision: 0.1
    }
  });
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis[]>([
    {
      id: '1',
      type: 'performance_forecast',
      probability: 92,
      timeframe: '7 days',
      impact: 'high',
      affectedComponents: ['Solar Array Section A', 'Inverter System'],
      recommendation: 'Optimize panel angles and clean surfaces before forecasted dust storm',
      potentialSavings: 2800,
      aiConfidence: 95,
      dataPoints: 1420,
      trendDirection: 'declining',
      priority: 'immediate',
      automationPossible: true
    },
    {
      id: '2',
      type: 'fault_prediction',
      probability: 88,
      timeframe: '48 hours',
      impact: 'high',
      affectedComponents: ['DC/AC Converter', 'Power Distribution Unit'],
      recommendation: 'Schedule preventive maintenance for converter system',
      potentialSavings: 3500,
      aiConfidence: 91,
      dataPoints: 890,
      trendDirection: 'declining',
      priority: 'immediate',
      automationPossible: false
    },
    {
      id: '3',
      type: 'efficiency_trend',
      probability: 95,
      timeframe: '30 days',
      impact: 'medium',
      affectedComponents: ['Panel Cleaning System', 'Tracking Mechanism'],
      recommendation: 'Implement new cleaning schedule based on weather patterns',
      potentialSavings: 1800,
      aiConfidence: 97,
      dataPoints: 2150,
      trendDirection: 'improving',
      priority: 'scheduled',
      automationPossible: true
    }
  ]);
  const [environmentalMetrics, setEnvironmentalMetrics] = useState<EnvironmentalMetrics>({
    ...droneMetrics,
    uvIndex: 7.5,
    solarIrradiance: 850,
    dustLevel: 35,
    surfaceTemperature: 42,
    cloudCover: 15,
    precipitationRisk: 5,
    windDirection: 180,
    airQuality: {
      pm25: 12,
      pm10: 45,
      o3: 35,
      no2: 25
    },
    soiling: {
      rate: 0.15,
      accumulation: 45,
      impact: 12
    },
    atmosphericPressure: 1013,
    visibility: 85,
    lightIntensity: 95000
  });

  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis[]>([
    {
      id: '1',
      type: 'pattern',
      confidence: 95,
      timestamp: new Date().toISOString(),
      insights: {
        title: 'Performance Pattern Detected',
        description: 'Cyclic efficiency drop pattern identified during specific weather conditions',
        impact: 'high',
        actionItems: [
          'Adjust cleaning schedule to align with weather patterns',
          'Implement predictive maintenance protocol',
          'Update monitoring thresholds'
        ],
        metrics: [
          { name: 'Pattern Strength', value: 0.85, unit: 'correlation', trend: 'up' },
          { name: 'Cycle Duration', value: 72, unit: 'hours', trend: 'stable' },
          { name: 'Impact Severity', value: 15, unit: 'percent', trend: 'down' }
        ]
      },
      relatedComponents: ['Solar Array A', 'Cleaning System', 'Weather Station'],
      aiModel: {
        name: 'PatternDetectionGPT',
        version: '2.1.0',
        accuracy: 0.92
      }
    },
    {
      id: '2',
      type: 'prediction',
      confidence: 88,
      timestamp: new Date().toISOString(),
      insights: {
        title: 'Maintenance Timing Optimization',
        description: 'AI suggests optimal maintenance schedule based on performance degradation patterns',
        impact: 'medium',
        actionItems: [
          'Schedule maintenance for next Tuesday',
          'Prepare cleaning equipment',
          'Monitor weather forecast'
        ],
        metrics: [
          { name: 'Efficiency Gain', value: 12, unit: 'percent', trend: 'up' },
          { name: 'Cost Reduction', value: 2800, unit: 'USD', trend: 'up' },
          { name: 'Downtime', value: 2, unit: 'hours', trend: 'down' }
        ]
      },
      relatedComponents: ['Maintenance Schedule', 'Resource Allocation', 'Cost Analysis'],
      aiModel: {
        name: 'MaintenanceOptimizer',
        version: '1.5.0',
        accuracy: 0.89
      }
    }
  ]);

  const [droneTelemetry, setDroneTelemetry] = useState<DroneTelemetry>({
    ...droneMetrics,
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { heading: 0, strength: 0 },
    lidar: {
      distance: 0,
      pointCloud: [],
      surfaceQuality: 0
    },
    camera: {
      zoom: 1,
      focus: 1,
      stabilization: 1,
      resolution: '4K'
    },
    thermalSensor: {
      minTemp: 20,
      maxTemp: 45,
      avgTemp: 32,
      hotspots: []
    }
  });

  const [advancedEnvironmentalMetrics, setAdvancedEnvironmentalMetrics] = useState<AdvancedEnvironmentalMetrics>({
    ...environmentalMetrics,
    spectralAnalysis: {
      infrared: 0.75,
      ultraviolet: 0.45,
      visible: 0.85,
      nearInfrared: 0.65
    },
    atmosphericQuality: {
      co2: 415,
      voc: 250,
      aqi: 65,
      pollutants: [
        { type: 'PM2.5', level: 12, threshold: 35 },
        { type: 'O3', level: 45, threshold: 100 },
        { type: 'NO2', level: 25, threshold: 100 },
        { type: 'SO2', level: 15, threshold: 75 }
      ]
    },
    weatherConditions: {
      precipitation: 0,
      humidity: 65,
      dewPoint: 15,
      barometricPressure: 1013,
      windGust: 12,
      windDirection: 180,
      cloudBase: 1500,
      visibility: 10000
    },
    solarMetrics: {
      directNormal: 850,
      diffuseHorizontal: 150,
      globalHorizontal: 1000,
      uvIndex: 6.5,
      clearSkyRatio: 0.85,
      shadingFactor: 0.95
    }
  });

  // Add new interfaces for enhanced analytics
  interface MaintenanceAnalytics {
    efficiency: {
      current: number;
      historical: { date: string; value: number }[];
      trend: 'increasing' | 'decreasing' | 'stable';
      forecast: { date: string; value: number; confidence: number }[];
    };
    costs: {
      maintenance: number;
      repairs: number;
      savings: number;
      roi: number;
      forecast: { month: string; value: number }[];
    };
    performance: {
      uptime: number;
      reliability: number;
      degradation: number;
      efficiency: number;
      comparison: { metric: string; value: number; benchmark: number }[];
    };
    alerts: {
      critical: number;
      warning: number;
      info: number;
      history: { type: string; message: string; timestamp: string }[];
    };
  }

  interface MaintenanceOptimization {
    recommendations: {
      id: string;
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      savings: number;
      implementation: string[];
      priority: number;
    }[];
    schedule: {
      optimal: { panel: string; date: string; type: string }[];
      conflicts: { panel: string; reason: string }[];
      efficiency: number;
    };
    resources: {
      technicians: { id: string; name: string; expertise: string[]; availability: string[] }[];
      equipment: { id: string; name: string; status: string; nextService: string }[];
      inventory: { id: string; name: string; stock: number; reorderPoint: number }[];
    };
  }

  // Add state for new features
  const [analytics, setAnalytics] = useState<MaintenanceAnalytics>({
    efficiency: {
      current: 87,
      historical: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        value: 85 + Math.random() * 10
      })),
      trend: 'increasing',
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        value: 88 + Math.random() * 5,
        confidence: 85 + Math.random() * 10
      }))
    },
    costs: {
      maintenance: 12500,
      repairs: 8750,
      savings: 25000,
      roi: 2.1,
      forecast: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
        value: 15000 + Math.random() * 5000
      }))
    },
    performance: {
      uptime: 99.2,
      reliability: 95.5,
      degradation: 2.3,
      efficiency: 88.7,
      comparison: [
        { metric: 'Output', value: 92, benchmark: 85 },
        { metric: 'Response Time', value: 15, benchmark: 30 },
        { metric: 'Maintenance Cost', value: 0.15, benchmark: 0.25 },
        { metric: 'Reliability', value: 95.5, benchmark: 90 }
      ]
    },
    alerts: {
      critical: 2,
      warning: 5,
      info: 8,
      history: Array.from({ length: 10 }, (_, i) => ({
        type: faker.helpers.arrayElement(['critical', 'warning', 'info']),
        message: faker.helpers.arrayElement([
          'Voltage fluctuation detected',
          'Maintenance schedule optimization suggested',
          'Performance degradation warning',
          'Weather alert: High wind conditions',
          'Dust accumulation detected'
        ]),
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }))
    }
  });

  const [optimization, setOptimization] = useState<MaintenanceOptimization>({
    recommendations: [
      {
        id: '1',
        title: 'Predictive Cleaning Schedule',
        description: 'Implement AI-driven cleaning schedule based on weather patterns and performance data',
        impact: 'high',
        effort: 'medium',
        savings: 12000,
        implementation: [
          'Deploy weather monitoring system',
          'Configure AI prediction model',
          'Update maintenance scheduler',
          'Train maintenance team'
        ],
        priority: 1
      },
      {
        id: '2',
        title: 'Automated Performance Monitoring',
        description: 'Install IoT sensors for real-time performance tracking and early warning system',
        impact: 'high',
        effort: 'high',
        savings: 18000,
        implementation: [
          'Install IoT sensors',
          'Configure monitoring dashboard',
          'Set up alert system',
          'Validate data accuracy'
        ],
        priority: 2
      }
    ],
    schedule: {
      optimal: Array.from({ length: 5 }, (_, i) => ({
        panel: `PANEL-${String(i + 1).padStart(3, '0')}`,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        type: faker.helpers.arrayElement(['cleaning', 'inspection', 'repair'])
      })),
      conflicts: [
        { panel: 'PANEL-002', reason: 'Weather conditions unfavorable' },
        { panel: 'PANEL-005', reason: 'Resource unavailability' }
      ],
      efficiency: 92.5
    },
    resources: {
      technicians: Array.from({ length: 5 }, (_, i) => ({
        id: `TECH-${i + 1}`,
        name: faker.person.fullName(),
        expertise: faker.helpers.arrayElements(['Solar PV', 'Electrical', 'Mechanical', 'Drone Operation'], 2),
        availability: Array.from({ length: 7 }, () => faker.helpers.arrayElement(['morning', 'afternoon', 'unavailable']))
      })),
      equipment: Array.from({ length: 4 }, (_, i) => ({
        id: `EQ-${i + 1}`,
        name: faker.helpers.arrayElement(['Drone', 'Cleaning Robot', 'Diagnostic Tool', 'Safety Equipment']),
        status: faker.helpers.arrayElement(['available', 'in-use', 'maintenance']),
        nextService: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })),
      inventory: Array.from({ length: 6 }, (_, i) => ({
        id: `INV-${i + 1}`,
        name: faker.helpers.arrayElement(['Cleaning Solution', 'Replacement Parts', 'Sensors', 'Tools', 'Safety Gear']),
        stock: faker.number.int({ min: 5, max: 50 }),
        reorderPoint: faker.number.int({ min: 10, max: 20 })
      }))
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMaintenanceData(generateMaintenanceData());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate real-time metric updates
    const interval = setInterval(() => {
      setDroneMetrics(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() * 2 - 1),
        altitude: prev.altitude + (Math.random() * 0.5 - 0.25),
        speed: Math.max(0, prev.speed + (Math.random() * 0.4 - 0.2)),
        signalStrength: Math.min(100, Math.max(0, prev.signalStrength + (Math.random() * 2 - 1))),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() * 0.6 - 0.3)),
        humidity: Math.min(100, Math.max(0, prev.humidity + (Math.random() * 2 - 1)))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Panel['status']): string => {
    switch (status) {
      case 'Normal': return 'text-success';
      case 'Slight Drop': return 'text-warning';
      case 'Critical Drop': return 'text-error';
      default: return 'text-base-content';
    }
  };

  const getStatusBadge = (status: Panel['status']): string => {
    switch (status) {
      case 'Normal': return 'badge-success';
      case 'Slight Drop': return 'badge-warning';
      case 'Critical Drop': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const handleMarkAsDone = (panelId: string) => {
    setMaintenanceData(prev => ({
      ...prev,
      panels: prev.panels.map(panel => 
        panel.id === panelId 
          ? { ...panel, resolved: true, status: 'Normal' as Panel['status'] }
          : panel
      )
    }));
  };

  const handleSchedule = (panel: Panel) => {
    setSelectedPanel(panel);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (date: Date) => {
    if (selectedPanel) {
      setMaintenanceData(prev => ({
        ...prev,
        panels: prev.panels.map(panel => 
          panel.id === selectedPanel.id 
            ? { ...panel, nextMaintenance: date }
            : panel
        )
      }));
      setShowScheduleModal(false);
      setSelectedPanel(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMaintenanceData(generateMaintenanceData());
      setLoading(false);
    }, 1000);
  };

  const filteredPanels = maintenanceData.panels.filter(panel => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'critical' && panel.status === 'Critical Drop') ||
      (selectedFilter === 'warning' && panel.status === 'Slight Drop') ||
      (selectedFilter === 'normal' && panel.status === 'Normal');
    
    const matchesSearch = searchQuery === '' || 
      panel.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panel.issue.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getPerformanceTrend = (panel: Panel) => {
    const trend = ((panel.currentOutput - panel.expectedOutput) / panel.expectedOutput) * 100;
    return {
      value: trend,
      icon: trend > 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingUp className="w-4 h-4 text-error rotate-180" />,
      color: trend > 0 ? 'text-success' : 'text-error'
    };
  };

  const MaintenanceCard = ({ panel }: { panel: Panel }) => {
    const trend = getPerformanceTrend(panel);
    const isExpanded = expandedPanel === panel.id;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="card-title">{panel.id}</h2>
              <p className="text-base-content/70">{panel.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`badge ${getStatusBadge(panel.status)}`}>
                {panel.status}
              </div>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setExpandedPanel(isExpanded ? null : panel.id)}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-base-content/70">Expected Output</p>
              <p className="font-semibold">{panel.expectedOutput}%</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Current Output</p>
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${getStatusColor(panel.status)}`}>
                  {panel.currentOutput}%
                </p>
                <span className={`flex items-center gap-1 ${trend.color}`}>
                  {trend.icon}
                  {Math.abs(trend.value).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-base-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">Issue</span>
                    <span className="text-sm font-medium">{panel.issue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">Last Maintenance</span>
                    <span className="text-sm font-medium">
                      {new Date(panel.lastMaintenance).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">Next Maintenance</span>
                    <span className="text-sm font-medium">
                      {new Date(panel.nextMaintenance).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">Assigned Technician</span>
                    <span className="text-sm font-medium">{panel.assignedTechnician}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="card-actions justify-end mt-4">
            <button 
              className="btn btn-sm btn-success gap-2"
              onClick={() => handleMarkAsDone(panel.id)}
              disabled={panel.resolved}
            >
              <CheckCircle className="w-4 h-4" />
              {panel.resolved ? 'Completed' : 'Mark as Done'}
            </button>
            <button 
              className="btn btn-sm btn-primary gap-2"
              onClick={() => handleSchedule(panel)}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const MaintenanceList = ({ panel }: { panel: Panel }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`badge ${getStatusBadge(panel.status)}`}>
              {panel.status}
            </div>
            <div>
              <h2 className="card-title">{panel.id}</h2>
              <p className="text-base-content/70">{panel.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-sm btn-success gap-2"
              onClick={() => handleMarkAsDone(panel.id)}
              disabled={panel.resolved}
            >
              <CheckCircle className="w-4 h-4" />
              {panel.resolved ? 'Completed' : 'Done'}
            </button>
            <button 
              className="btn btn-sm btn-primary gap-2"
              onClick={() => handleSchedule(panel)}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-base-content/70">Expected Output</p>
            <p className="font-semibold">{panel.expectedOutput}%</p>
          </div>
          <div>
            <p className="text-sm text-base-content/70">Current Output</p>
            <p className={`font-semibold ${getStatusColor(panel.status)}`}>
              {panel.currentOutput}%
            </p>
          </div>
          <div>
            <p className="text-sm text-base-content/70">Issue</p>
            <p className="font-semibold">{panel.issue}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/70">Next Maintenance</p>
            <p className="font-semibold">
              {new Date(panel.nextMaintenance).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Maintenance Report', 20, 20);
    doc.setFontSize(12);
    
    // Add date
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add performance summary
    doc.setFontSize(14);
    doc.text('Performance Summary', 20, 40);
    doc.setFontSize(12);
    
    const normalCount = maintenanceData.panels.filter(p => p.status === 'Normal').length;
    const warningCount = maintenanceData.panels.filter(p => p.status === 'Slight Drop').length;
    const criticalCount = maintenanceData.panels.filter(p => p.status === 'Critical Drop').length;
    
    doc.text(`Normal Status: ${normalCount}`, 20, 50);
    doc.text(`Warning Status: ${warningCount}`, 20, 60);
    doc.text(`Critical Status: ${criticalCount}`, 20, 70);
    
    // Add panel details table
    const tableData = maintenanceData.panels.map(panel => [
      panel.id,
      panel.location,
      panel.status,
      `${panel.currentOutput}%`,
      panel.issue,
      new Date(panel.nextMaintenance).toLocaleDateString(),
      panel.assignedTechnician
    ]);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Panel ID', 'Location', 'Status', 'Output', 'Issue', 'Next Maintenance', 'Technician']],
      body: tableData,
      theme: 'grid'
    });
    
    // Save the PDF
    doc.save('maintenance-report.pdf');
  };

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Maintenance Dashboard</h1>
            <p className="text-base-content/70 max-w-2xl">
              Track and diagnose performance degradation in solar panels and energy towers.
              Get AI-powered maintenance recommendations and schedule repairs.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-ghost btn-circle"
              onClick={() => setShowDroneSimulation(!showDroneSimulation)}
            >
              <Plane className="w-5 h-5" />
            </button>
            <button 
              className="btn btn-ghost btn-circle"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="btn btn-ghost btn-circle"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drone Simulation Panel */}
        <AnimatePresence>
          {showDroneSimulation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card bg-base-200 shadow-xl"
            >
              <div className="card-body p-0">
                <div className="p-4 flex justify-between items-center">
                  <h3 className="card-title">Drone Control Center</h3>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-primary gap-2"
                      onClick={() => setActiveTask(droneTasks[0])}
                      disabled={activeTask !== null}
                    >
                      <Camera className="w-4 h-4" />
                      Start Inspection
                    </button>
                    <button className="btn btn-sm btn-ghost">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="tabs tabs-boxed bg-base-300 p-2">
                  <button 
                    className={`tab ${activeTab === '3d' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('3d')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    3D Simulation
                  </button>
                  <button 
                    className={`tab ${activeTab === 'pov' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('pov')}
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    AI-Powered POV
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                  {/* Main View */}
                  <div className="lg:col-span-2">
                    <div className="aspect-video w-full bg-base-300 rounded-lg overflow-hidden relative">
                      {activeTab === '3d' ? (
                        <>
                          <iframe
                            title="Drone Inspection Simulation"
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; fullscreen; xr-spatial-tracking"
                            xr-spatial-tracking
                            execution-while-out-of-viewport
                            execution-while-not-rendered
                            web-share
                            src="https://sketchfab.com/models/0334cdb8a8114349bb73fbb8985f4fe7/embed"
                          />
                          <div 
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at ${dronePosition.x}% ${dronePosition.y}%, rgba(0, 255, 0, 0.2) 0%, transparent 50%)`
                            }}
                          />
                        </>
                      ) : (
                        <div className="relative w-full h-full">
                          <motion.div
                            initial={{ filter: 'brightness(1) contrast(1)' }}
                            animate={{ 
                              filter: analysisMode === 'thermal' 
                                ? 'brightness(1.2) contrast(1.5) hue-rotate(180deg)' 
                                : analysisMode === 'infrared'
                                  ? 'brightness(0.8) contrast(2) hue-rotate(90deg)'
                                  : 'brightness(1) contrast(1)'
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <video
                              className="w-full h-full object-cover"
                              src="/videoplayback (1).mp4"
                              autoPlay
                              loop
                              muted
                            />
                          </motion.div>
                          
                          <div className="absolute top-0 left-0 w-full h-full">
                            {/* Analysis Mode Selector */}
                            <div className="absolute top-4 left-4 bg-base-300/80 p-2 rounded-lg space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-primary animate-pulse" />
                                <span className="text-sm font-medium">Analysis Mode</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {([
                                  { mode: 'rgb', icon: <Eye className="w-3 h-3" /> },
                                  { mode: 'thermal', icon: <Thermometer className="w-3 h-3" /> },
                                  { mode: 'infrared', icon: <Sun className="w-3 h-3" /> },
                                  { mode: 'xray', icon: <ZapOff className="w-3 h-3" /> },
                                  { mode: 'structural', icon: <Box className="w-3 h-3" /> },
                                  { mode: 'electromagnetic', icon: <Radio className="w-3 h-3" /> },
                                  { mode: '3d_scan', icon: <Eye className="w-3 h-3" /> }
                                ] as const).map(({ mode, icon }) => (
                                  <button
                                    key={mode}
                                    onClick={() => setAnalysisMode(mode)}
                                    className={`btn btn-xs ${analysisMode === mode ? 'btn-primary' : 'btn-ghost'} flex items-center gap-1`}
                                  >
                                    {icon}
                                    {mode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Enhanced AI Detections */}
                            <div className="absolute inset-0">
                              {detections.map(detection => (
                                <motion.div
                                  key={detection.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute"
                                  style={{
                                    left: `${detection.position.x}%`,
                                    top: `${detection.position.y}%`,
                                    width: `${detection.size.width}px`,
                                    height: `${detection.size.height}px`
                                  }}
                                >
                                  <motion.div 
                                    className={`absolute inset-0 border-2 ${
                                      detection.severity === 'high' ? 'border-error' :
                                      detection.severity === 'medium' ? 'border-warning' :
                                      'border-success'
                                    } rounded-lg`}
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                  <div className="absolute -top-12 left-0 bg-base-300/90 px-2 py-1 rounded text-xs space-y-1">
                                    <div className="flex items-center gap-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                        detection.severity === 'high' ? 'bg-error' :
                                        detection.severity === 'medium' ? 'bg-warning' :
                                        'bg-success'
                                      } animate-pulse`} />
                                      <span className="font-medium">{detection.label}</span>
                                      <span className="text-base-content/70">{detection.confidence}%</span>
                                    </div>
                                    {detection.details && (
                                      <div className="text-[10px] space-y-0.5">
                                        {detection.details.temperature && (
                                          <div className="flex justify-between gap-2">
                                            <span>Temp:</span>
                                            <span>{detection.details.temperature}°C</span>
                                          </div>
                                        )}
                                        {detection.details.stressLevel && (
                                          <div className="flex justify-between gap-2">
                                            <span>Stress:</span>
                                            <span>{detection.details.stressLevel}%</span>
                                          </div>
                                        )}
                                        {detection.details.degradation && (
                                          <div className="flex justify-between gap-2">
                                            <span>Wear:</span>
                                            <span>{detection.details.degradation}%</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Enhanced Environmental Analysis */}
                            <div className="absolute bottom-4 left-4 right-4 bg-base-300/80 p-4 rounded-lg">
                              <div className="grid grid-cols-3 gap-4">
                                <motion.div 
                                  className="stat"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <div className="stat-title text-xs flex items-center gap-1">
                                    <Thermometer className="w-3 h-3" />
                                    Temperature
                                  </div>
                                  <div className="stat-value text-lg">
                                    {droneMetrics.temperature.toFixed(1)}°C
                                    <motion.span 
                                      className={`text-xs ml-1 ${
                                        droneMetrics.temperature > 35 ? 'text-error' :
                                        droneMetrics.temperature > 30 ? 'text-warning' :
                                        'text-success'
                                      }`}
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      {droneMetrics.temperature > 35 ? '↑' : 
                                       droneMetrics.temperature > 30 ? '→' : '↓'}
                                    </motion.span>
                                  </div>
                                </motion.div>
                                
                                <motion.div 
                                  className="stat"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                                >
                                  <div className="stat-title text-xs flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    Altitude
                                  </div>
                                  <div className="stat-value text-lg flex items-center">
                                    {droneMetrics.altitude.toFixed(1)}m
                                    <motion.div 
                                      className="ml-2 w-16 h-1 bg-base-200 rounded-full overflow-hidden"
                                      title={`Safe range: 10-20m`}
                                    >
                                      <motion.div 
                                        className={`h-full ${
                                          droneMetrics.altitude > 20 || droneMetrics.altitude < 10 
                                            ? 'bg-error' : 'bg-success'
                                        }`}
                                        style={{ width: `${(droneMetrics.altitude / 30) * 100}%` }}
                                      />
                                    </motion.div>
                                  </div>
                                </motion.div>

                                <motion.div 
                                  className="stat"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                                >
                                  <div className="stat-title text-xs flex items-center gap-1">
                                    <Wind className="w-3 h-3" />
                                    Wind Speed
                                  </div>
                                  <div className="stat-value text-lg">
                                    {droneMetrics.windSpeed.toFixed(1)}m/s
                                    <motion.span 
                                      className={`text-xs ml-1 ${
                                        droneMetrics.windSpeed > 10 ? 'text-error' :
                                        droneMetrics.windSpeed > 7 ? 'text-warning' :
                                        'text-success'
                                      }`}
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      {droneMetrics.windSpeed > 10 ? '⚠' : 
                                       droneMetrics.windSpeed > 7 ? '!' : '✓'}
                                    </motion.span>
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            {/* Enhanced Status Indicators */}
                            <div className="absolute top-4 right-4 space-y-2">
                              <motion.div 
                                className="bg-base-300/80 p-2 rounded-lg"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-success" />
                                  <span className="text-sm">Object Detection</span>
                                </div>
                                <div className="mt-1 w-full bg-base-200 rounded-full h-1">
                                  <motion.div 
                                    className="bg-success h-1 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                </div>
                              </motion.div>

                              <motion.div 
                                className="bg-base-300/80 p-2 rounded-lg"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Wifi className="w-4 h-4 text-primary" />
                                  <span className="text-sm">Signal: {droneMetrics.signalStrength.toFixed(0)}%</span>
                                </div>
                                <div className="mt-1 w-full bg-base-200 rounded-full h-1">
                                  <motion.div 
                                    className="bg-primary h-1 rounded-full"
                                    style={{ width: `${droneMetrics.signalStrength}%` }}
                                  />
                                </div>
                              </motion.div>

                              <motion.div 
                                className="bg-base-300/80 p-2 rounded-lg"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Battery className="w-4 h-4 text-warning" />
                                  <span className="text-sm">Battery: 85%</span>
                                </div>
                                <div className="mt-1 w-full bg-base-200 rounded-full h-1">
                                  <motion.div 
                                    className="bg-warning h-1 rounded-full"
                                    style={{ width: '85%' }}
                                  />
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Insights Panel */}
                    {activeTab === 'pov' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-base-300 rounded-lg p-4"
                      >
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          Real-time AI Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium">Detected Issues</h5>
                            {aiInsights.map(insight => (
                              <motion.div 
                                key={insight.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={`bg-base-200 p-3 rounded-lg border-l-4 ${
                                  insight.type === 'warning' ? 'border-warning' :
                                  insight.type === 'success' ? 'border-success' :
                                  'border-info'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-2">
                                    {insight.type === 'warning' ? (
                                      <AlertOctagon className="w-4 h-4 text-warning mt-1" />
                                    ) : insight.type === 'success' ? (
                                      <CheckCircle2 className="w-4 h-4 text-success mt-1" />
                                    ) : (
                                      <Info className="w-4 h-4 text-info mt-1" />
                                    )}
                                    <div>
                                      <p className="font-medium">{insight.message}</p>
                                      <p className="text-sm text-base-content/70 mt-1">
                                        {insight.detectedObject && (
                                          <span className="mr-2">Object: {insight.detectedObject}</span>
                                        )}
                                        <span>Confidence: {insight.confidence}%</span>
                                      </p>
                                      {insight.recommendation && (
                                        <p className="text-sm text-primary mt-2">
                                          Recommendation: {insight.recommendation}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-base-content/50">
                                    {new Date(insight.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium">Environmental Analysis</h5>
                            <div className="bg-base-200 p-4 rounded-lg space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Temperature</span>
                                  <span>{droneMetrics.temperature.toFixed(1)}°C</span>
                                </div>
                                <div className="w-full bg-base-300 rounded-full h-2">
                                  <motion.div 
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${(droneMetrics.temperature / 50) * 100}%` }}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Humidity</span>
                                  <span>{droneMetrics.humidity.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-base-300 rounded-full h-2">
                                  <motion.div 
                                    className="bg-info h-2 rounded-full"
                                    style={{ width: `${droneMetrics.humidity}%` }}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Signal Strength</span>
                                  <span>{droneMetrics.signalStrength.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-base-300 rounded-full h-2">
                                  <motion.div 
                                    className="bg-success h-2 rounded-full"
                                    style={{ width: `${droneMetrics.signalStrength}%` }}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Controls and Info */}
                  <div className="space-y-4">
                    {/* Drone Controls */}
                    <div className="card bg-base-300">
                      <div className="card-body">
                        <h4 className="card-title text-sm flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          Enhanced Drone Controls
                        </h4>
                        <div className="space-y-4">
                          {/* Flight Mode Selector */}
                          <div className="grid grid-cols-2 gap-2">
                            {(['manual', 'autonomous', 'precision', 'inspection'] as const).map(mode => (
                              <button
                                key={mode}
                                onClick={() => setDroneControls(prev => ({ ...prev, flightMode: mode }))}
                                className={`btn btn-sm ${droneControls.flightMode === mode ? 'btn-primary' : 'btn-ghost'}`}
                              >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </button>
                            ))}
                          </div>

                          {/* Safety Features */}
                          <div className="grid grid-cols-2 gap-2">
                            <label className="label cursor-pointer">
                              <span className="label-text">Stabilization</span>
                              <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={droneControls.stabilization}
                                onChange={e => setDroneControls(prev => ({
                                  ...prev,
                                  stabilization: e.target.checked
                                }))}
                              />
                            </label>
                            <label className="label cursor-pointer">
                              <span className="label-text">Collision Avoidance</span>
                              <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={droneControls.collisionAvoidance}
                                onChange={e => setDroneControls(prev => ({
                                  ...prev,
                                  collisionAvoidance: e.target.checked
                                }))}
                              />
                            </label>
                          </div>

                          {/* Gimbal Controls */}
                          <div className="space-y-2">
                            <label className="label">
                              <span className="label-text">Gimbal Control</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-xs">Pitch</span>
                                <input
                                  type="range"
                                  className="range range-xs"
                                  min="-90"
                                  max="90"
                                  value={droneControls.gimbalControl.pitch}
                                  onChange={e => setDroneControls(prev => ({
                                    ...prev,
                                    gimbalControl: {
                                      ...prev.gimbalControl,
                                      pitch: parseInt(e.target.value)
                                    }
                                  }))}
                                />
                              </div>
                              <div>
                                <span className="text-xs">Yaw</span>
                                <input
                                  type="range"
                                  className="range range-xs"
                                  min="-180"
                                  max="180"
                                  value={droneControls.gimbalControl.yaw}
                                  onChange={e => setDroneControls(prev => ({
                                    ...prev,
                                    gimbalControl: {
                                      ...prev.gimbalControl,
                                      yaw: parseInt(e.target.value)
                                    }
                                  }))}
                                />
                              </div>
                              <div>
                                <span className="text-xs">Roll</span>
                                <input
                                  type="range"
                                  className="range range-xs"
                                  min="-90"
                                  max="90"
                                  value={droneControls.gimbalControl.roll}
                                  onChange={e => setDroneControls(prev => ({
                                    ...prev,
                                    gimbalControl: {
                                      ...prev.gimbalControl,
                                      roll: parseInt(e.target.value)
                                    }
                                  }))}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Flight Parameters */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text text-xs">Max Speed (m/s)</span>
                              </label>
                              <input
                                type="range"
                                className="range range-primary range-xs"
                                min="0"
                                max="20"
                                step="0.5"
                                value={droneControls.flightParameters.maxSpeed}
                                onChange={e => setDroneControls(prev => ({
                                  ...prev,
                                  flightParameters: {
                                    ...prev.flightParameters,
                                    maxSpeed: parseFloat(e.target.value)
                                  }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="label">
                                <span className="label-text text-xs">Max Altitude (m)</span>
                              </label>
                              <input
                                type="range"
                                className="range range-primary range-xs"
                                min="0"
                                max="50"
                                step="1"
                                value={droneControls.flightParameters.maxAltitude}
                                onChange={e => setDroneControls(prev => ({
                                  ...prev,
                                  flightParameters: {
                                    ...prev.flightParameters,
                                    maxAltitude: parseFloat(e.target.value)
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Task */}
                    {activeTask && (
                      <div className="card bg-base-300">
                        <div className="card-body">
                          <h4 className="card-title text-sm">Active Task</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Task ID:</span>
                              <span className="text-sm font-medium">{activeTask.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Type:</span>
                              <span className="text-sm font-medium capitalize">{activeTask.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Target Panel:</span>
                              <span className="text-sm font-medium">{activeTask.targetPanel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Priority:</span>
                              <span className={`badge badge-${activeTask.priority === 'high' ? 'error' : activeTask.priority === 'medium' ? 'warning' : 'success'}`}>
                                {activeTask.priority}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Status:</span>
                              <span className={`badge badge-${activeTask.status === 'in_progress' ? 'primary' : 'ghost'}`}>
                                {activeTask.status}
                              </span>
                            </div>
                          </div>
                          <div className="card-actions justify-end mt-4">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setDroneTasks(prev => prev.map(task => 
                                  task.id === activeTask.id 
                                    ? { ...task, status: 'completed' }
                                    : task
                                ));
                                setActiveTask(null);
                              }}
                            >
                              Complete Task
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Task Queue */}
                    <div className="card bg-base-300">
                      <div className="card-body">
                        <h4 className="card-title text-sm">Task Queue</h4>
                        <div className="space-y-2">
                          {droneTasks.map(task => (
                            <div 
                              key={task.id}
                              className={`p-2 rounded-lg ${
                                task.id === activeTask?.id 
                                  ? 'bg-primary/20' 
                                  : task.status === 'completed'
                                    ? 'bg-success/20'
                                    : 'bg-base-200'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{task.id}</span>
                                <span className={`badge badge-${task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="text-xs text-base-content/70">
                                {task.type} - {task.targetPanel}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Drone Status */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="stat bg-base-300 rounded-lg p-4">
                        <div className="stat-title">Battery</div>
                        <div className="stat-value text-2xl">85%</div>
                        <div className="stat-desc">4h 30m remaining</div>
                      </div>
                      <div className="stat bg-base-300 rounded-lg p-4">
                        <div className="stat-title">Status</div>
                        <div className="stat-value text-2xl">
                          {activeTask ? 'On Task' : 'Ready'}
                        </div>
                        <div className="stat-desc">Last active: 2m ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card bg-base-200 shadow-xl"
            >
              <div className="card-body">
                <h3 className="card-title">Notifications</h3>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 bg-base-300 rounded-lg">
                      <div className={`badge ${notification.type === 'warning' ? 'badge-warning' : 
                        notification.type === 'success' ? 'badge-success' : 'badge-info'}`}>
                        {notification.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                         notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                         <Info className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-base-content/70">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('grid')}
              className={`btn ${selectedView === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`btn ${selectedView === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            >
              List View
            </button>
          </div>
          <div className="flex gap-2">
            <div className="join">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  className={`join-item btn ${timeRange === range ? 'btn-active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search panels..."
                  className="input input-bordered"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <button className="btn btn-square">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <select
              className="select select-bordered"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Panels</option>
              <option value="critical">Critical Issues</option>
              <option value="warning">Warning Status</option>
              <option value="normal">Normal Status</option>
            </select>
            <button 
              className={`btn btn-primary gap-2 ${loading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Performance Trends</h2>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
                >
                  {showPerformanceDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              <AreaChart
                className="h-72 mt-4"
                data={maintenanceData.performanceHistory}
                index="time"
                categories={['expected', 'actual']}
                colors={['blue', 'green']}
                valueFormatter={(value) => `${value}%`}
              />
              <AnimatePresence>
                {showPerformanceDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-base-300"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-base-content/70">Average Output</p>
                        <p className="font-semibold">
                          {(maintenanceData.performanceHistory.reduce((acc, curr) => acc + curr.actual, 0) / 
                            maintenanceData.performanceHistory.length).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/70">Peak Output</p>
                        <p className="font-semibold">
                          {Math.max(...maintenanceData.performanceHistory.map(p => p.actual))}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Status Distribution</h2>
              <div className="h-72 mt-4 flex items-center justify-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success rounded-full"></div>
                    <span>Normal: {maintenanceData.panels.filter(p => p.status === 'Normal').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning rounded-full"></div>
                    <span>Slight Drop: {maintenanceData.panels.filter(p => p.status === 'Slight Drop').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-error rounded-full"></div>
                    <span>Critical: {maintenanceData.panels.filter(p => p.status === 'Critical Drop').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Efficiency Metrics */}
          <motion.div
            className="card bg-base-200 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Efficiency Analytics
              </h3>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Current Efficiency</span>
                  <span className="text-xl font-bold">{analytics.efficiency.current}%</span>
                </div>
                <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${analytics.efficiency.current}%` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="mt-4">
                  <LineChart
                    className="h-48"
                    data={analytics.efficiency.historical}
                    index="date"
                    categories={['value']}
                    colors={['blue']}
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    showLegend={false}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Trend</div>
                    <div className="stat-value text-lg flex items-center gap-1">
                      {analytics.efficiency.trend === 'increasing' ? (
                        <>
                          <ArrowUp className="w-4 h-4 text-success" />
                          <span className="text-success">Up</span>
                        </>
                      ) : analytics.efficiency.trend === 'decreasing' ? (
                        <>
                          <ArrowDown className="w-4 h-4 text-error" />
                          <span className="text-error">Down</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 text-warning" />
                          <span className="text-warning">Stable</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Forecast</div>
                    <div className="stat-value text-lg">
                      {analytics.efficiency.forecast[0].value.toFixed(1)}%
                    </div>
                    <div className="stat-desc">
                      {analytics.efficiency.forecast[0].confidence}% confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cost Analysis */}
          <motion.div
            className="card bg-base-200 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Cost Analysis
              </h3>
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Maintenance</div>
                    <div className="stat-value text-lg">${analytics.costs.maintenance.toLocaleString()}</div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Repairs</div>
                    <div className="stat-value text-lg">${analytics.costs.repairs.toLocaleString()}</div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Savings</div>
                    <div className="stat-value text-lg text-success">
                      ${analytics.costs.savings.toLocaleString()}
                    </div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">ROI</div>
                    <div className="stat-value text-lg text-primary">{analytics.costs.roi}x</div>
                  </div>
                </div>
                <div className="mt-4">
                  <BarChart
                    className="h-48"
                    data={analytics.costs.forecast}
                    index="month"
                    categories={['value']}
                    colors={['purple']}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    showLegend={false}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            className="card bg-base-200 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Performance Metrics
              </h3>
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Uptime</div>
                    <div className="stat-value text-lg">{analytics.performance.uptime}%</div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Reliability</div>
                    <div className="stat-value text-lg">{analytics.performance.reliability}%</div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Degradation</div>
                    <div className="stat-value text-lg text-warning">
                      {analytics.performance.degradation}%
                    </div>
                  </div>
                  <div className="stat bg-base-300 rounded-lg p-3">
                    <div className="stat-title text-xs">Efficiency</div>
                    <div className="stat-value text-lg">{analytics.performance.efficiency}%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Benchmark Comparison</h4>
                  <div className="space-y-3">
                    {analytics.performance.comparison.map(metric => (
                      <div key={metric.metric}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{metric.metric}</span>
                          <span className={metric.value >= metric.benchmark ? 'text-success' : 'text-error'}>
                            {metric.value} vs {metric.benchmark}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${metric.value >= metric.benchmark ? 'bg-success' : 'bg-error'}`}
                            style={{ width: `${(metric.value / (metric.benchmark * 1.5)) * 100}%` }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Optimization Recommendations */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Optimization Recommendations
            </h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {optimization.recommendations.map(rec => (
                <motion.div
                  key={rec.id}
                  className="card bg-base-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h4 className="card-title text-base">{rec.title}</h4>
                      <div className="flex gap-2">
                        <span className={`badge ${
                          rec.impact === 'high' ? 'badge-error' :
                          rec.impact === 'medium' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {rec.impact}
                        </span>
                        <span className={`badge ${
                          rec.effort === 'high' ? 'badge-error' :
                          rec.effort === 'medium' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {rec.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{rec.description}</p>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Implementation Steps:</div>
                      <div className="space-y-2">
                        {rec.implementation.map((step, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-sm">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-success font-medium">
                        Potential Savings: ${rec.savings.toLocaleString()}
                      </div>
                      <button className="btn btn-primary btn-sm">
                        Implement
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Technician Schedule */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Technician Schedule
              </h3>
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Expertise</th>
                        <th>Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimization.resources.technicians.map(tech => (
                        <tr key={tech.id}>
                          <td>{tech.name}</td>
                          <td>
                            <div className="flex gap-1">
                              {tech.expertise.map(exp => (
                                <span key={exp} className="badge badge-sm">{exp}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              {tech.availability.map((avail, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    avail === 'morning' ? 'bg-success' :
                                    avail === 'afternoon' ? 'bg-warning' :
                                    'bg-error'
                                  }`}
                                  title={avail}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment & Inventory */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Equipment & Inventory
              </h3>
              <div className="mt-4">
                <div className="tabs tabs-boxed">
                  <button className="tab tab-active">Equipment</button>
                  <button className="tab">Inventory</button>
                </div>
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Status</th>
                          <th>Next Service</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimization.resources.equipment.map(eq => (
                          <tr key={eq.id}>
                            <td>{eq.name}</td>
                            <td>
                              <span className={`badge ${
                                eq.status === 'available' ? 'badge-success' :
                                eq.status === 'in-use' ? 'badge-warning' :
                                'badge-error'
                              }`}>
                                {eq.status}
                              </span>
                            </td>
                            <td>{new Date(eq.nextService).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert History */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Alert History
              </h3>
              <div className="flex gap-2">
                <div className="badge badge-error gap-2">
                  <AlertOctagon className="w-3 h-3" />
                  {analytics.alerts.critical}
                </div>
                <div className="badge badge-warning gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  {analytics.alerts.warning}
                </div>
                <div className="badge badge-info gap-2">
                  <Info className="w-3 h-3" />
                  {analytics.alerts.info}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-4">
                {analytics.alerts.history.map((alert, index) => (
                  <motion.div
                    key={index}
                    className={`bg-base-300 p-4 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'border-error' :
                      alert.type === 'warning' ? 'border-warning' :
                      'border-info'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        {alert.type === 'critical' ? (
                          <AlertOctagon className="w-5 h-5 text-error mt-1" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-warning mt-1" />
                        ) : (
                          <Info className="w-5 h-5 text-info mt-1" />
                        )}
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-base-content/70 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm">
                        Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Content */}
        <AnimatePresence mode="wait">
          {selectedView === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPanels.map((panel) => (
                <MaintenanceCard key={panel.id} panel={panel} />
              ))}
            </motion.div>
          )}

          {selectedView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredPanels.map((panel) => (
                <MaintenanceList key={panel.id} panel={panel} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Modal */}
        {showScheduleModal && selectedPanel && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Schedule Maintenance</h3>
              <div className="py-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleScheduleSubmit(new Date(e.target.value))}
                  />
                </div>
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Settings</h3>
              <div className="py-4 space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Update Frequency</span>
                  </label>
                  <select className="select select-bordered">
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every minute</option>
                    <option value="300">Every 5 minutes</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Notifications</span>
                  </label>
                  <div className="space-y-2">
                    <label className="label cursor-pointer">
                      <span className="label-text">Critical Issues</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                    <label className="label cursor-pointer">
                      <span className="label-text">Maintenance Updates</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowSettings(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={generatePDFReport}
            className="btn btn-primary btn-lg gap-2"
          >
            <Download className="w-5 h-5" />
            Export Maintenance Report
          </button>
        </div>

        {/* Add Predictive Analysis Panel */}
        <div className="card bg-base-300 mt-4">
          <div className="card-body">
            <h4 className="card-title text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Predictive Analysis
            </h4>
            <div className="space-y-4">
              {predictiveAnalysis.map(analysis => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-base-200 p-3 rounded-lg border-l-4 ${
                    analysis.impact === 'high' ? 'border-error' :
                    analysis.impact === 'medium' ? 'border-warning' :
                    'border-info'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          analysis.type === 'failure' ? 'badge-error' :
                          analysis.type === 'degradation' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {analysis.type.toUpperCase()}
                        </span>
                        <span className="font-medium">
                          Probability: {analysis.probability}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm">
                        {analysis.recommendation}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.affectedComponents.map(component => (
                          <span key={component} className="badge badge-ghost badge-sm">
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-base-content/70">
                        Timeframe: {analysis.timeframe}
                      </span>
                      {analysis.potentialSavings && (
                        <div className="mt-1 text-xs text-success">
                          Potential Savings: ${analysis.potentialSavings}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Enhanced Environmental Analysis */}
        <div className="card bg-base-300 mt-4">
          <div className="card-body">
            <h4 className="card-title text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-warning" />
              Environmental Analysis
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Solar and Temperature Metrics */}
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-xs">Solar Irradiance (W/m²)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{environmentalMetrics.solarIrradiance}</span>
                    <motion.div 
                      className="w-full bg-base-200 rounded-full h-2"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <motion.div 
                        className="bg-warning h-2 rounded-full"
                        style={{ width: `${(environmentalMetrics.solarIrradiance / 1000) * 100}%` }}
                      />
                    </motion.div>
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-xs">Surface Temperature (°C)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{environmentalMetrics.surfaceTemperature}</span>
                    <motion.div 
                      className="w-full bg-base-200 rounded-full h-2"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <motion.div 
                        className={`h-2 rounded-full ${
                          environmentalMetrics.surfaceTemperature > 45 ? 'bg-error' :
                          environmentalMetrics.surfaceTemperature > 35 ? 'bg-warning' :
                          'bg-success'
                        }`}
                        style={{ width: `${(environmentalMetrics.surfaceTemperature / 60) * 100}%` }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Air Quality and Weather */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Air Quality</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(environmentalMetrics.airQuality).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-base-content/70">{key.toUpperCase()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{value}</span>
                          <motion.div 
                            className="w-full bg-base-200 rounded-full h-1.5"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <motion.div 
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${(value / 100) * 100}%` }}
                            />
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Weather Conditions</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-base-content/70">Wind Speed</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{environmentalMetrics.windSpeed} m/s</span>
                        <motion.div 
                          className={`w-2 h-2 rounded-full ${
                            environmentalMetrics.windSpeed > 10 ? 'bg-error' :
                            environmentalMetrics.windSpeed > 7 ? 'bg-warning' :
                            'bg-success'
                          }`}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-base-content/70">Humidity</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{environmentalMetrics.humidity}%</span>
                        <motion.div 
                          className="w-full bg-base-200 rounded-full h-1.5"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <motion.div 
                            className="bg-info h-1.5 rounded-full"
                            style={{ width: `${environmentalMetrics.humidity}%` }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spectral Analysis */}
              <div>
                <h5 className="text-sm font-medium mb-2">Spectral Analysis</h5>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(advancedEnvironmentalMetrics.spectralAnalysis).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-xs text-base-content/70">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{(value * 100).toFixed(1)}%</span>
                        <motion.div 
                          className="w-full bg-base-200 rounded-full h-1.5"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <motion.div 
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${value * 100}%` }}
                            animate={{ 
                              backgroundColor: ['#3b82f6', '#8b5cf6', '#3b82f6']
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solar Performance */}
              <div>
                <h5 className="text-sm font-medium mb-2">Solar Performance</h5>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(advancedEnvironmentalMetrics.solarMetrics).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-xs text-base-content/70">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </span>
                        {typeof value === 'number' && (
                          <motion.div 
                            className="w-full bg-base-200 rounded-full h-1.5"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <motion.div 
                              className="bg-warning h-1.5 rounded-full"
                              style={{ width: `${(value / 1000) * 100}%` }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add AI Insights Panel */}
        <div className="card bg-base-300 mt-4">
          <div className="card-body">
            <h4 className="card-title text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI-Powered Insights
            </h4>
            <div className="space-y-4">
              {aiAnalysis.map(analysis => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-base-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          analysis.type === 'prediction' ? 'badge-primary' :
                          analysis.type === 'anomaly' ? 'badge-error' :
                          analysis.type === 'optimization' ? 'badge-success' :
                          'badge-info'
                        }`}>
                          {analysis.type.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium">
                          Confidence: {analysis.confidence}%
                        </span>
                      </div>
                      <h3 className="font-medium">{analysis.insights.title}</h3>
                      <p className="text-sm text-base-content/70">
                        {analysis.insights.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-base-content/50">
                        {new Date(analysis.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="mt-1 text-xs">
                        Model: {analysis.aiModel.name} v{analysis.aiModel.version}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Metrics:</div>
                    <div className="grid grid-cols-3 gap-4">
                      {analysis.insights.metrics.map(metric => (
                        <motion.div
                          key={metric.name}
                          className="bg-base-300 p-2 rounded"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-base-content/70">{metric.name}</div>
                          <div className="font-medium">
                            {metric.value} {metric.unit}
                            <motion.span 
                              className={`ml-1 ${
                                metric.trend === 'up' ? 'text-success' :
                                metric.trend === 'down' ? 'text-error' :
                                'text-warning'
                              }`}
                              animate={{ y: metric.trend === 'up' ? [0, -2, 0] : 
                                       metric.trend === 'down' ? [0, 2, 0] : 
                                       [0, 0, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {metric.trend === 'up' ? '↑' : 
                               metric.trend === 'down' ? '↓' : 
                               '→'}
                            </motion.span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium">Action Items:</div>
                    <div className="mt-2 space-y-2">
                      {analysis.insights.actionItems.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance; 