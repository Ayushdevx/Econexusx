import React, { useState, useEffect, useRef } from 'react';
import HeatMap from '../components/HeatMap';
import { useDataStore } from '../store/dataStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import AIRecommendations from '../components/AIRecommendations';
import MachinePartsMonitor from '../components/MachinePartsMonitor';
import PowerSupplyMonitor from '../components/PowerSupplyMonitor';

// Tab options for the dashboard
type TabOption = 'overview' | 'comparison' | 'equipment' | 'power' | 'recommendations';

const DisasterMonitoring: React.FC = () => {
  const { sites, isLoading, runDisasterAnalysis } = useDataStore();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [centerCoordinates, setCenterCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [zoom, setZoom] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOption>('overview');
  const [preDisasterData, setPreDisasterData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(75);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock historical data for comparison
  const [historicalData, setHistoricalData] = useState(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).getTime();
    return Array.from({ length: 24 }, (_, i) => ({
      time: new Date(fiveMinutesAgo + i * 60 * 1000).toLocaleTimeString(),
      consumption: Math.random() * 50 + 100,
      efficiency: Math.random() * 20 + 70,
      renewable: Math.random() * 30 + 20,
      grid: Math.random() * 40 + 60,
    }));
  });

  // Monitor real-time updates with interval
  useEffect(() => {
    // Start the real-time data simulation
    updateTimerRef.current = setInterval(() => {
      // Add a new data point to historical data
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        consumption: Math.random() * 50 + 100,
        efficiency: Math.random() * 20 + 70,
        renewable: Math.random() * 30 + 20,
        grid: Math.random() * 40 + 60,
      };
      
      setHistoricalData(prev => [...prev.slice(1), newDataPoint]);
      setLastUpdated(new Date());
      
      // Simulate small changes to sustainability score
      setSustainabilityScore(prev => 
        Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2))
      );
    }, 5000); // Update every 5 seconds

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSite && sites.length > 0) {
      const site = sites.find(s => s.id === selectedSite);
      if (site) {
        setCenterCoordinates({
          lat: site.location.lat,
          lng: site.location.lng
        });
        setZoom(15); // Zoom in on the selected site
      }
    } else if (sites.length > 0) {
      // Default: center on the average coordinates of all sites
      const avgLat = sites.reduce((sum, site) => sum + site.location.lat, 0) / sites.length;
      const avgLng = sites.reduce((sum, site) => sum + site.location.lng, 0) / sites.length;
      setCenterCoordinates({ lat: avgLat, lng: avgLng });
      setZoom(4);
    }
  }, [selectedSite, sites]);

  // Calculate site health and anomalies
  const sitesWithHealth = sites.map(site => {
    const latestData = site.energyData[site.energyData.length - 1];
    const efficiency = latestData.efficiency;
    const anomalyScore = (100 - efficiency) * (latestData.consumption / 100);
    
    let healthStatus = 'Healthy';
    let statusColor = 'text-success';
    
    if (anomalyScore > 80) {
      healthStatus = 'Critical';
      statusColor = 'text-error';
    } else if (anomalyScore > 40) {
      healthStatus = 'Warning';
      statusColor = 'text-warning';
    }
    
    return {
      ...site,
      healthStatus,
      statusColor,
      anomalyScore
    };
  });
  
  // Sort by anomaly score (highest first) to prioritize troubled sites
  const sortedSites = [...sitesWithHealth].sort((a, b) => b.anomalyScore - a.anomalyScore);

  const handleSimulateDisaster = async () => {
    // Store pre-disaster data for comparison
    setPreDisasterData(sites.map(site => ({
      id: site.id,
      name: site.name,
      consumption: site.energyData[site.energyData.length - 1].consumption,
      efficiency: site.energyData[site.energyData.length - 1].efficiency,
      timestamp: Date.now()
    })));

    setIsSimulating(true);
    await runDisasterAnalysis();
    setIsSimulating(false);
    
    // Auto-switch to comparison tab after disaster simulation
    setActiveTab('comparison');
  };

  // Generate comparison data for before/after disaster
  const comparisonData = sites.map(site => {
    const preDisaster = preDisasterData.find(d => d.id === site.id);
    const currentData = site.energyData[site.energyData.length - 1];
    
    return {
      id: site.id,
      name: site.name,
      beforeConsumption: preDisaster?.consumption || 0,
      afterConsumption: currentData.consumption,
      beforeEfficiency: preDisaster?.efficiency || 0,
      afterEfficiency: currentData.efficiency,
      consumptionChange: preDisaster ? 
        ((currentData.consumption - preDisaster.consumption) / preDisaster.consumption * 100).toFixed(1) + '%' : 
        'N/A',
      efficiencyChange: preDisaster ? 
        ((currentData.efficiency - preDisaster.efficiency) / preDisaster.efficiency * 100).toFixed(1) + '%' : 
        'N/A'
    };
  });

  // Calculate total energy stats
  const totalConsumption = sites.reduce(
    (sum, site) => sum + site.energyData[site.energyData.length - 1].consumption, 
    0
  ).toFixed(2);
  
  const avgEfficiency = (sites.reduce(
    (sum, site) => sum + site.energyData[site.energyData.length - 1].efficiency, 
    0
  ) / (sites.length || 1)).toFixed(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <span className="ml-3">Loading site data...</span>
      </div>
    );
  }

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="alert shadow-lg bg-info/10">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h3 className="font-bold">Before vs. After Disaster Analysis</h3>
                  <div className="text-xs">Compare energy consumption and efficiency changes</div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Before Consumption</th>
                    <th>After Consumption</th>
                    <th>Change</th>
                    <th>Before Efficiency</th>
                    <th>After Efficiency</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map(data => (
                    <tr key={data.id}>
                      <td>{data.name}</td>
                      <td>{data.beforeConsumption.toFixed(2)} kWh</td>
                      <td>{data.afterConsumption.toFixed(2)} kWh</td>
                      <td className={parseFloat(data.consumptionChange) > 0 ? 'text-error' : 'text-success'}>
                        {data.consumptionChange}
                      </td>
                      <td>{data.beforeEfficiency.toFixed(1)}%</td>
                      <td>{data.afterEfficiency.toFixed(1)}%</td>
                      <td className={parseFloat(data.efficiencyChange) < 0 ? 'text-error' : 'text-success'}>
                        {data.efficiencyChange}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <h4 className="font-bold mb-3">Consumption Impact Analysis</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Before Disaster" dataKey="beforeConsumption" fill="#36D399" />
                  <Bar name="After Disaster" dataKey="afterConsumption" fill="#F87272" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'equipment':
        return <MachinePartsMonitor selectedSiteId={selectedSite} />;
        
      case 'power':
        return <PowerSupplyMonitor selectedSiteId={selectedSite} />;
        
      case 'recommendations':
        return <AIRecommendations sites={sortedSites} />;
        
      default: // 'overview'
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Total Energy Consumption</div>
                <div className="stat-value text-primary">{totalConsumption}</div>
                <div className="stat-desc">kWh across all sites</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Average Efficiency</div>
                <div className="stat-value text-secondary">{avgEfficiency}%</div>
                <div className="stat-desc">System wide</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Critical Sites</div>
                <div className="stat-value text-error">
                  {sortedSites.filter(site => site.healthStatus === 'Critical').length}
                </div>
                <div className="stat-desc">Require immediate repair</div>
              </div>
              
              <div className="stat bg-base-100 rounded-lg shadow-md">
                <div className="stat-title">Sustainability Score</div>
                <div className="stat-value text-accent">{sustainabilityScore.toFixed(1)}</div>
                <div className="stat-desc">
                  <progress 
                    className={`progress ${sustainabilityScore > 80 ? 'progress-success' : 
                                         sustainabilityScore > 60 ? 'progress-accent' : 
                                         sustainabilityScore > 40 ? 'progress-warning' : 'progress-error'}`} 
                    value={sustainabilityScore} 
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
            
            <div className="bg-base-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Real-time Energy Consumption</h3>
              <p className="text-sm text-base-content/70 mb-3">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="consumption" stroke="#F87272" fill="#F87272" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="grid" stroke="#3ABFF8" fill="#3ABFF8" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="renewable" stroke="#36D399" fill="#36D399" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-base-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">System Efficiency Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#FBBD23" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Disaster Energy Monitoring</h1>
            <p className="text-base-content/70">
              Monitor energy consumption and equipment health after disasters to identify issues.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              className={`btn btn-error ${isSimulating ? 'loading' : ''}`}
              onClick={handleSimulateDisaster}
              disabled={isSimulating}
            >
              {isSimulating ? 'Simulating...' : 'Simulate Disaster Impact'}
            </button>
            
            <div className="badge badge-neutral">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Sites</h2>
                
                <div className="overflow-y-auto max-h-[350px] pr-2">
                  {sortedSites.map(site => (
                    <div 
                      key={site.id}
                      className={`mb-2 p-3 rounded-md cursor-pointer border-l-4 ${
                        selectedSite === site.id ? 'bg-base-200' : 'bg-base-100'
                      } ${
                        site.healthStatus === 'Critical' ? 'border-error' : 
                        site.healthStatus === 'Warning' ? 'border-warning' : 'border-success'
                      }`}
                      onClick={() => setSelectedSite(site.id === selectedSite ? null : site.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{site.name}</h4>
                        <span className={`badge ${site.statusColor}`}>{site.healthStatus}</span>
                      </div>
                      <p className="text-sm text-base-content/70">{site.location.address}</p>
                      <div className="mt-2 text-xs flex justify-between">
                        <span>Efficiency: {site.energyData[site.energyData.length - 1].efficiency.toFixed(1)}%</span>
                        <span>Type: {site.type}</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-base-300 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            site.healthStatus === 'Critical' ? 'bg-error' : 
                            site.healthStatus === 'Warning' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{width: `${Math.min(100, site.energyData[site.energyData.length - 1].efficiency)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="tabs tabs-boxed mb-4">
              <a 
                className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </a>
              <a 
                className={`tab ${activeTab === 'comparison' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                Before/After
              </a>
              <a 
                className={`tab ${activeTab === 'equipment' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment Health
              </a>
              <a 
                className={`tab ${activeTab === 'power' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('power')}
              >
                Power Supply
              </a>
              <a 
                className={`tab ${activeTab === 'recommendations' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                AI Recommendations
              </a>
            </div>
            
            {/* Conditional Tab Content */}
            {renderTabContent()}

            {/* Heat Map (Only show in overview tab) */}
            {activeTab === 'overview' && centerCoordinates && (
              <div className="mt-6">
                <HeatMap 
                  centerLat={centerCoordinates.lat}
                  centerLng={centerCoordinates.lng}
                  zoom={zoom}
                  showDisasterMode={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterMonitoring; 