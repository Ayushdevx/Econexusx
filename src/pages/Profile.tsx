import React, { useState, useEffect, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  User, Mail, Phone, Building, Award, Settings, Battery, Zap,
  Signal, Server, AlertTriangle, Calendar, Clock, Download,
  TrendingUp, TrendingDown, RefreshCw, Filter, Share2, Bell
} from 'lucide-react';

// Enhanced mock data generators
const generateHistoricalData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
    consumption: faker.number.int({ min: 800, max: 1200 }),
    savings: faker.number.int({ min: 50, max: 200 }),
    efficiency: faker.number.int({ min: 70, max: 95 }),
    cost: faker.number.int({ min: 5000, max: 8000 }),
    carbonEmissions: faker.number.int({ min: 20, max: 40 }),
    peakLoad: faker.number.int({ min: 85, max: 100 })
  }));
};

const generateSiteData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: faker.string.uuid(),
    name: `Site ${String.fromCharCode(65 + i)}`,
    status: faker.helpers.arrayElement(['active', 'maintenance', 'alert', 'offline']),
    consumption: faker.number.int({ min: 100, max: 500 }),
    efficiency: faker.number.int({ min: 60, max: 95 }),
    lastMaintenance: faker.date.recent({ days: 30 }),
    nextMaintenance: faker.date.soon({ days: 30 }),
    alerts: faker.number.int({ min: 0, max: 5 })
  }));
};

const generateNetworkStats = () => ({
  activeNodes: faker.number.int({ min: 1000, max: 2000 }),
  totalSites: faker.number.int({ min: 150, max: 300 }),
  averageLoad: faker.number.int({ min: 60, max: 90 }),
  alerts: faker.number.int({ min: 0, max: 10 }),
  uptime: faker.number.float({ min: 99, max: 99.99, multipleOf: 0.01 }),
  bandwidth: faker.number.int({ min: 800, max: 1000 }),
  latency: faker.number.int({ min: 5, max: 20 }),
  packetLoss: faker.number.float({ min: 0, max: 1, multipleOf: 0.01 })
});

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());
  const [networkStats, setNetworkStats] = useState(generateNetworkStats());
  const [siteData, setSiteData] = useState(generateSiteData());
  const [showAlert, setShowAlert] = useState(false);
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedMetrics, setSelectedMetrics] = useState(['consumption', 'efficiency']);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userData = {
    name: 'Harry Potter',
    role: 'Senior Energy Manager',
    email: 'harry.potter@gmail.com',
    phone: '+91 9305183418',
    company: 'NoKkia Telecom pvt ltd',
    certifications: [
      'Certified Energy Manager',
      'Green Network Specialist',
      'ISO 50001 Expert',
      'Sustainable Infrastructure Professional'
    ],
    achievements: [
      { title: 'Network Optimization Champion', description: 'Achieved 30% reduction in network energy consumption', date: '2024', impact: '₹1.2M saved' },
      { title: 'Green Innovation Award', description: 'Implemented AI-driven power management', date: '2023', impact: '40% efficiency gain' },
      { title: 'Sustainability Leader', description: 'Led carbon-neutral initiative for 50 sites', date: '2023', impact: '840 tons CO₂ reduced' },
      { title: 'Digital Transformation Pioneer', description: 'Smart grid implementation across network', date: '2023', impact: '25% cost reduction' }
    ],
    kpis: [
      { label: 'Energy Efficiency', value: '92%', trend: '+5%', target: '95%' },
      { label: 'Cost Savings', value: '₹2.5M', trend: '+12%', target: '₹3M' },
      { label: 'Carbon Offset', value: '840 tons', trend: '+25%', target: '1000 tons' },
      { label: 'Network Uptime', value: '99.99%', trend: '+0.01%', target: '99.999%' }
    ]
  };

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats(generateNetworkStats());
      setShowAlert(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Data refresh handler
  const handleRefreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHistoricalData(generateHistoricalData());
    setSiteData(generateSiteData());
    setIsLoading(false);
  };

  // Export data handler
  const handleExportData = () => {
    const data = {
      historical: historicalData,
      sites: siteData,
      network: networkStats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'energy-management-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Notifications panel
  const NotificationsPanel = () => (
    <div className="absolute right-0 mt-2 w-96 bg-base-100 shadow-xl rounded-box z-50">
      <div className="p-4">
        <h3 className="font-bold mb-4">Notifications</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="alert alert-info">
              <span>{faker.helpers.arrayElement([
                'High energy consumption detected',
                'Maintenance required',
                'Performance optimization completed',
                'New efficiency milestone reached',
                'System update available'
              ])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Quick Actions */}
        <div className="navbar bg-base-100 rounded-box">
          <div className="flex-1">
            <div className="avatar">
              <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <User className="w-full h-full p-2" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold">{userData.name}</h1>
              <p className="text-sm opacity-70">{userData.role}</p>
            </div>
          </div>
          <div className="flex-none gap-4">
            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost btn-circle" onClick={() => setShowNotifications(!showNotifications)}>
                <div className="indicator">
                  <Bell className="h-5 w-5" />
                  <span className="badge badge-sm badge-primary indicator-item">8</span>
                </div>
              </button>
              {showNotifications && <NotificationsPanel />}
            </div>
            <button className="btn btn-ghost btn-circle" onClick={handleRefreshData}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="btn btn-ghost btn-circle" onClick={handleExportData}>
              <Download className="h-5 w-5" />
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <Settings className="h-5 w-5" />
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li><a>Settings</a></li>
                <li><a>Profile</a></li>
                <li><a>Logout</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Time Range Selector and Metrics Filter */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="join">
            {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
              <button
                key={range}
                className={`join-item btn ${timeRange === range ? 'btn-active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="join">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn join-item">
                <Filter className="h-4 w-4 mr-2" />
                Metrics
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                {['consumption', 'efficiency', 'cost', 'carbonEmissions'].map((metric) => (
                  <li key={metric}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                          }
                        }}
                      />
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn join-item">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="tabs tabs-boxed justify-center">
          {['overview', 'analytics', 'network', 'sites', 'reports'].map((tab) => (
            <button
              key={tab}
              className={`tab tab-lg capitalize ${activeTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Enhanced KPI Cards */}
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">Key Performance Indicators</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userData.kpis.map((kpi, index) => (
                      <div key={index} className="stat bg-base-200 rounded-box">
                        <div className="stat-title flex items-center gap-2">
                          {kpi.label}
                          <div className="tooltip" data-tip={`Target: ${kpi.target}`}>
                            <div className="badge badge-sm">Target</div>
                          </div>
                        </div>
                        <div className="stat-value">{kpi.value}</div>
                        <div className={`stat-desc flex items-center gap-2 ${
                          kpi.trend.startsWith('+') ? 'text-success' : 'text-error'
                        }`}>
                          {kpi.trend.startsWith('+') ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {kpi.trend} vs last month
                        </div>
                        <progress
                          className="progress progress-primary w-full mt-2"
                          value={parseInt(kpi.value)}
                          max={100}
                        ></progress>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Achievements */}
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">
                    <Award className="w-6 h-6 text-primary" />
                    Achievements
                  </h2>
                  <div className="space-y-4">
                    {userData.achievements.map((achievement, index) => (
                      <div key={index} className="bg-base-200 p-4 rounded-box">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{achievement.title}</h3>
                            <p className="text-sm opacity-70">{achievement.description}</p>
                            <div className="mt-2 flex gap-2">
                              <div className="badge badge-ghost">{achievement.date}</div>
                              <div className="badge badge-primary">{achievement.impact}</div>
                            </div>
                          </div>
                          <Award className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

{activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Enhanced Energy Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption Trends */}
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h2 className="card-title">
                      <Zap className="w-6 h-6 text-primary" />
                      Energy Consumption Trends
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="consumption" 
                            stroke="#82ca9d" 
                            fill="#82ca9d" 
                            fillOpacity={0.3}
                            name="Consumption (kWh)"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="savings" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3}
                            name="Savings (kWh)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Efficiency Metrics */}
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h2 className="card-title">
                      <Battery className="w-6 h-6 text-primary" />
                      Network Efficiency
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="efficiency" 
                            stroke="#8884d8" 
                            name="Efficiency (%)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="peakLoad" 
                            stroke="#82ca9d" 
                            name="Peak Load (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Cost Analysis */}
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h2 className="card-title">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Cost Analysis
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                          <Legend />
                          <Bar 
                            dataKey="cost" 
                            fill="#8884d8" 
                            name="Cost (₹)"
                          />
                          <Bar 
                            dataKey="savings" 
                            fill="#82ca9d" 
                            name="Savings (₹)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Carbon Emissions */}
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h2 className="card-title">
                      <RefreshCw className="w-6 h-6 text-primary" />
                      Carbon Footprint
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Direct Emissions', value: 400 },
                              { name: 'Indirect Emissions', value: 300 },
                              { name: 'Offset Credits', value: -200 }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                            dataKey="value"
                          >
                            {
                              [
                                { fill: '#82ca9d' },
                                { fill: '#8884d8' },
                                { fill: '#ffc658' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))
                            }
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'network' && (
            <motion.div
              key="network"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Network Overview */}
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">
                    <Signal className="w-6 h-6 text-primary" />
                    Network Overview
                  </h2>
                  <div className="stats stats-vertical shadow">
                    <div className="stat">
                      <div className="stat-title">Active Nodes</div>
                      <div className="stat-value">{networkStats.activeNodes}</div>
                      <div className="stat-desc">↗︎ 400 (22%)</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Network Uptime</div>
                      <div className="stat-value">{networkStats.uptime}%</div>
                      <div className="stat-desc">↗︎ 0.01%</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Bandwidth Utilization</div>
                      <div className="stat-value">{networkStats.bandwidth} Gbps</div>
                      <div className="stat-desc">↘︎ 90 (14%)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Alerts */}
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                    Active Alerts
                  </h2>
                  <div className="space-y-4">
                    {showAlert && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="alert alert-warning"
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                          <h3 className="font-bold">High Energy Consumption Alert</h3>
                          <div className="text-sm">Sector A4 consuming 25% above threshold</div>
                        </div>
                        <button className="btn btn-sm">View</button>
                      </motion.div>
                    )}
                    <div className="alert alert-info">
                      <Server className="w-6 h-6" />
                      <div>
                        <h3 className="font-bold">System Optimization</h3>
                        <div className="text-sm">AI-driven optimization in progress</div>
                      </div>
                      <button className="btn btn-sm">Details</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Site Management Tab */}
          {activeTab === 'sites' && (
            <motion.div
              key="sites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="card bg-base-100">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title">Site Management</h2>
                    <div className="join">
                      <input 
                        className="join-item input input-bordered" 
                        placeholder="Search sites..."
                      />
                      <button className="join-item btn">Search</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Site Name</th>
                          <th>Status</th>
                          <th>Consumption</th>
                          <th>Efficiency</th>
                          <th>Alerts</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siteData.map((site) => (
                          <tr key={site.id}>
                            <td>{site.name}</td>
                            <td>
                              <div className={`badge ${
                                site.status === 'active' ? 'badge-success' :
                                site.status === 'maintenance' ? 'badge-warning' :
                                site.status === 'alert' ? 'badge-error' :
                                'badge-ghost'
                              }`}>
                                {site.status}
                              </div>
                            </td>
                            <td>{site.consumption} kWh</td>
                            <td>
                              <div className="flex items-center gap-2">
                                {site.efficiency}%
                                <progress 
                                  className="progress progress-primary w-20" 
                                  value={site.efficiency} 
                                  max="100"
                                ></progress>
                              </div>
                            </td>
                            <td>
                              {site.alerts > 0 && (
                                <div className="badge badge-error gap-2">
                                  {site.alerts} alerts
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="join">
                                <button className="join-item btn btn-sm">View</button>
                                <button className="join-item btn btn-sm">Edit</button>
                                <button className="join-item btn btn-sm">History</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {siteData.length} of {networkStats.totalSites} sites
                    </div>
                    <div className="join">
                      <button className="join-item btn">«</button>
                      <button className="join-item btn">Page 1</button>
                      <button className="join-item btn">»</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">Generated Reports</h2>
                  <div className="space-y-4">
                    {[
                      'Monthly Energy Consumption Report',
                      'Network Performance Analysis',
                      'Sustainability Metrics',
                      'Cost Optimization Recommendations'
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{report}</h3>
                          <p className="text-sm opacity-70">Generated {faker.date.recent().toLocaleDateString()}</p>
                        </div>
                        <div className="join">
                          <button className="join-item btn btn-sm">
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                          <button className="join-item btn btn-sm">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title">Schedule Reports</h2>
                  <div className="form-control space-y-4">
                    <div>
                      <label className="label">Report Type</label>
                      <select className="select select-bordered w-full">
                        <option>Energy Consumption</option>
                        <option>Network Performance</option>
                        <option>Cost Analysis</option>
                        <option>Sustainability Metrics</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Frequency</label>
                      <select className="select select-bordered w-full">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Recipients</label>
                      <input type="text" className="input input-bordered w-full" placeholder="Enter email addresses" />
                      </div>
                    <div>
                      <label className="label">Format</label>
                      <div className="join w-full">
                        <button className="join-item btn flex-1">PDF</button>
                        <button className="join-item btn flex-1">Excel</button>
                        <button className="join-item btn flex-1">CSV</button>
                      </div>
                    </div>
                    <button className="btn btn-primary w-full">
                      Schedule Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stats shadow w-full bg-base-100"
        >
          <div className="stat">
            <div className="stat-figure text-primary">
              <Signal className="w-8 h-8" />
            </div>
            <div className="stat-title">Network Status</div>
            <div className="stat-value text-primary">{networkStats.uptime}%</div>
            <div className="stat-desc">Uptime last 30 days</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Battery className="w-8 h-8" />
            </div>
            <div className="stat-title">Energy Efficiency</div>
            <div className="stat-value text-secondary">{networkStats.averageLoad}%</div>
            <div className="stat-desc">Average network load</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="stat-title">Active Alerts</div>
            <div className="stat-value">{networkStats.alerts}</div>
            <div className="stat-desc">Requires attention</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;