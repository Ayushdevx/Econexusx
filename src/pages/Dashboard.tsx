import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataStore } from '../store/dataStore';
import { useAppStore } from '../store/appStore';
import DashboardStats from '../components/dashboard/DashboardStats';
import EnergyConsumptionChart from '../components/dashboard/EnergyConsumptionChart';
import SiteOverview from '../components/dashboard/SiteOverview';
import EnergyMap from '../components/dashboard/EnergyMap';
import EnergyDistributionChart from '../components/dashboard/EnergyDistributionChart';
import EnergyHeatMap from '../components/dashboard/EnergyHeatMap';
import PredictiveAnalytics from '../components/dashboard/PredictiveAnalytics';
import WeatherImpactWidget from '../components/dashboard/WeatherImpactWidget';
import CostSavingsWidget from '../components/dashboard/CostSavingsWidget';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import RealTimeEnergyGauge from '../components/dashboard/RealTimeEnergyGauge';
import InteractiveEnergyFlowChart from '../components/dashboard/InteractiveEnergyFlowChart';
import {
  Battery,
  Zap,
  Wind,
  AlertTriangle,
  Sun,
  Cloud,
  Droplet,
  Temperature,
  Bell,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Save,
  PieChart,
  Activity,
  ThermometerSun,
  Calendar,
  LayoutDashboard,
  Map,
  BarChart,
  Cpu,
  Grid,
  LineChart,
  Gauge,
  Layers,
  Lightbulb,
  Cog,
  Plus,
  Minus,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
} from 'lucide-react';

// Enhanced data generation with more metrics
const generateTimeSeriesData = (hours = 24) => {
  const data = [];
  for (let i = 0; i < hours; i++) {
    data.push({
      hour: `${String(i).padStart(2, '0')}:00`,
      consumption: Math.floor(Math.random() * 150) + 50,
      renewable: Math.floor(Math.random() * 80) + 20,
      grid: Math.floor(Math.random() * 120) + 30,
      solar: Math.floor(Math.random() * 60) + 10,
      wind: Math.floor(Math.random() * 40) + 5,
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 30) + 40,
      batteryLevel: Math.floor(Math.random() * 100),
      efficiency: Math.floor(Math.random() * 20) + 80,
      co2Savings: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
};

const Dashboard = () => {
  // State management with Zustand
  const { fetchSites, sites, isLoading } = useDataStore();
  const { theme, addNotification } = useAppStore();

  // Local state
  const [energyData, setEnergyData] = useState(generateTimeSeriesData());
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState(5000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    showSolar: true,
    showWind: true,
    showGrid: true,
    showConsumption: true,
  });

  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Persisting theme in local storage
  }, [theme]);

  // Enhanced data update logic
  const updateData = useCallback(() => {
    const hoursMap = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };

    setEnergyData(generateTimeSeriesData(hoursMap[selectedTimeRange]));
  }, [selectedTimeRange]);

  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(updateData, updateFrequency);
    }
    return () => clearInterval(interval);
  }, [updateData, updateFrequency, isAutoRefresh]);

  // Enhanced notification system
  const generateNotification = useCallback(() => {
    const types = [
      { title: 'High Consumption Alert', type: 'error' },
      { title: 'Low Renewable Input', type: 'warning' },
      { title: 'System Performance Update', type: 'info' },
      { title: 'Energy Savings Achievement', type: 'success' },
    ];

    const selected = types[Math.floor(Math.random() * types.length)];
    return {
      id: Date.now().toString(),
      title: selected.title,
      message: `${selected.title} detected at ${new Date().toLocaleTimeString()}`,
      type: selected.type,
      read: false,
      timestamp: Date.now(),
    };
  }, []);

  useEffect(() => {
    let interval;
    if (notificationsEnabled) {
      interval = setInterval(() => {
        const newNotification = generateNotification();
        // Add to local state for display
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));
        // Add to global state
        addNotification(newNotification);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [notificationsEnabled, generateNotification, addNotification]);

  // Enhanced KPI calculations
  const kpiCards = [
    {
      title: 'Total Energy Usage',
      value: `${(energyData.reduce((acc, curr) => acc + curr.consumption, 0)).toFixed(0)} kWh`,
      change: '+5.2%',
      icon: Zap,
    },
    {
      title: 'Renewable Energy',
      value: `${(energyData.reduce((acc, curr) => acc + curr.renewable, 0)).toFixed(0)} kWh`,
      change: '+12.3%',
      icon: Wind,
    },
    {
      title: 'Grid Consumption',
      value: `${(energyData.reduce((acc, curr) => acc + curr.grid, 0)).toFixed(0)} kWh`,
      change: '-3.1%',
      icon: Battery,
    },
    {
      title: 'System Efficiency',
      value: `${energyData[energyData.length - 1]?.efficiency}%`,
      change: '+1.5%',
      icon: Activity,
    },
    {
      title: 'CO2 Savings',
      value: `${(energyData.reduce((acc, curr) => acc + curr.co2Savings, 0) / 1000).toFixed(1)} tons`,
      change: '+8.7%',
      icon: ThermometerSun,
    },
  ];

  // Export functionality
  const exportData = () => {
    const dataStr = JSON.stringify(energyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `energy-data-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine text color based on theme
  const textColorClass = theme === 'light' ? 'text-black' : 'text-white';

  // Dashboard layout configuration
  const [dashboardLayout, setDashboardLayout] = useState({
    overview: {
      expanded: false,
      widgets: [
        { id: 'stats', visible: true },
        { id: 'realtime', visible: true },
        { id: 'consumption', visible: true },
        { id: 'interactive', visible: true },
        { id: 'distribution', visible: true },
        { id: 'heatmap', visible: true },
        { id: 'map', visible: true },
        { id: 'predictive', visible: true },
        { id: 'weather', visible: true },
        { id: 'savings', visible: true },
        { id: 'alerts', visible: true },
      ]
    }
  });

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    setDashboardLayout(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        widgets: prev.overview.widgets.map(widget =>
          widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
        )
      }
    }));
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setDashboardLayout(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        expanded: !prev.overview.expanded
      }
    }));
  };

  // Check if widget is visible
  const isWidgetVisible = (widgetId: string) => {
    return dashboardLayout.overview.widgets.find(w => w.id === widgetId)?.visible ?? true;
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-base-content/70">Monitor and manage your energy consumption</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="join">
            <button
              className={`join-item btn ${selectedView === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedView('overview')}
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Overview
            </button>
            <button
              className={`join-item btn ${selectedView === 'sites' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedView('sites')}
            >
              <Map className="h-4 w-4 mr-1" />
              Sites
            </button>
            <button
              className={`join-item btn ${selectedView === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedView('analytics')}
            >
              <BarChart className="h-4 w-4 mr-1" />
              Analytics
            </button>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <Layers className="h-5 w-5" />
            </div>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <div className="menu-title">Dashboard Widgets</div>
              {dashboardLayout.overview.widgets.map(widget => (
                <li key={widget.id}>
                  <a
                    onClick={() => toggleWidget(widget.id)}
                    className={widget.visible ? 'active' : ''}
                  >
                    {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {widget.id.charAt(0).toUpperCase() + widget.id.slice(1)}
                  </a>
                </li>
              ))}
              <div className="divider my-1"></div>
              <li>
                <a onClick={toggleExpanded}>
                  {dashboardLayout.overview.expanded ?
                    <Minimize className="h-4 w-4" /> :
                    <Maximize className="h-4 w-4" />}
                  {dashboardLayout.overview.expanded ? 'Compact View' : 'Expanded View'}
                </a>
              </li>
            </div>
          </div>

          <button className="btn btn-ghost" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {selectedView === 'overview' && (
        <>
          {/* Dashboard Stats */}
          {isWidgetVisible('stats') && <DashboardStats />}

          {/* Real-time Energy Gauge */}
          {isWidgetVisible('realtime') && <RealTimeEnergyGauge />}

          {/* Main Dashboard Grid */}
          <div className={`grid ${dashboardLayout.overview.expanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 mt-6`}>
            {/* Energy Consumption Chart */}
            {isWidgetVisible('consumption') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <EnergyConsumptionChart />
              </div>
            )}

            {/* Interactive Energy Flow Chart */}
            {isWidgetVisible('interactive') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <InteractiveEnergyFlowChart />
              </div>
            )}

            {/* Energy Distribution Chart */}
            {isWidgetVisible('distribution') && (
              <EnergyDistributionChart />
            )}

            {/* Energy Heat Map */}
            {isWidgetVisible('heatmap') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <EnergyHeatMap />
              </div>
            )}

            {/* Energy Network Map */}
            {isWidgetVisible('map') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <EnergyMap />
              </div>
            )}

            {/* Predictive Analytics */}
            {isWidgetVisible('predictive') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <PredictiveAnalytics />
              </div>
            )}

            {/* Weather Impact Widget */}
            {isWidgetVisible('weather') && (
              <WeatherImpactWidget />
            )}

            {/* Cost Savings Widget */}
            {isWidgetVisible('savings') && (
              <CostSavingsWidget />
            )}

            {/* Alerts Widget */}
            {isWidgetVisible('alerts') && (
              <div className={dashboardLayout.overview.expanded ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
                <AlertsWidget />
              </div>
            )}
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-end mt-6">
            <button
              className={`btn btn-sm ${isAutoRefresh ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              {isAutoRefresh ? 'Auto Refresh' : 'Manual Refresh'}
            </button>

            <button className="btn btn-sm btn-outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </>
      )}

      {selectedView === 'sites' && (
        <SiteOverview />
      )}

      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-base-100"
          >
            <div className="card-body">
              <h3 className="card-title">Energy Efficiency</h3>
              <div className="h-80">
                {/* Chart content would go here */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-base-content/70">Energy efficiency analytics visualization</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CO2 Savings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-base-100"
          >
            <div className="card-body">
              <h3 className="card-title">CO2 Savings</h3>
              <div className="h-80">
                {/* Chart content would go here */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-base-content/70">CO2 savings analytics visualization</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Dashboard Settings</h3>
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Update Frequency</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(Number(e.target.value))}
                >
                  <option value={1000}>Every second</option>
                  <option value={5000}>Every 5 seconds</option>
                  <option value={15000}>Every 15 seconds</option>
                  <option value={60000}>Every minute</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Enable Notifications</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Auto Refresh</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isAutoRefresh}
                    onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  />
                </label>
              </div>

              <div className="divider">Data Filters</div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Solar Energy</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={filterOptions.showSolar}
                    onChange={e => setFilterOptions(prev => ({ ...prev, showSolar: e.target.checked }))}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Wind Energy</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-info"
                    checked={filterOptions.showWind}
                    onChange={e => setFilterOptions(prev => ({ ...prev, showWind: e.target.checked }))}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Grid Energy</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={filterOptions.showGrid}
                    onChange={e => setFilterOptions(prev => ({ ...prev, showGrid: e.target.checked }))}
                  />
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowSettings(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                // Save settings
                setShowSettings(false);
              }}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;