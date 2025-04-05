import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, TrendingUp, Clock, ArrowRight, Filter, Search, Bell, Download, Server, Wifi, Radio, Battery, Zap, Sun, Wind } from 'lucide-react';
import { faker } from '@faker-js/faker';

// Enhanced market data generation for telecom focus
const generateMarketData = () => {
  const networkTypes = ['5G', '4G', 'Data Center', 'Radio Access', 'Core Network'];
  const efficiencyMeasures = ['Smart Sleep Mode', 'AI-Powered Load Balancing', 'Renewable Integration', 'Cooling Optimization'];
  
  return Array.from({ length: 12 }, () => ({
    id: faker.string.uuid(),
    name: `${faker.helpers.arrayElement(networkTypes)} Energy Optimization Package`,
    provider: faker.company.name(),
    price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
    quantity: faker.number.int({ min: 1000, max: 50000 }),
    trend: faker.number.float({ min: -15, max: 15, precision: 0.1 }),
    timeLeft: faker.number.int({ min: 1, max: 24 }),
    reliability: faker.number.float({ min: 85, max: 99, precision: 0.1 }),
    sourceType: faker.helpers.arrayElement(['Solar', 'Wind', 'Hydro', 'Battery Storage']),
    carbonOffset: faker.number.float({ min: 100, max: 1000, precision: 0.1 }),
    efficiencyGain: faker.number.float({ min: 15, max: 40, precision: 0.1 }),
    implementationTime: faker.number.int({ min: 1, max: 6 }),
    optimizationMethod: faker.helpers.arrayElement(efficiencyMeasures),
    roi: faker.number.float({ min: 6, max: 24, precision: 0.1 }),
    networkImpact: faker.helpers.arrayElement(['Minimal', 'Moderate', 'Significant']),
    peakReduction: faker.number.float({ min: 10, max: 30, precision: 0.1 })
  }));
};

// Enhanced analytics data
const generateNetworkStats = () => ({
  energyConsumption: {
    labels: ['5G', '4G', 'Data Center', 'Radio Access', 'Core'],
    data: Array.from({ length: 5 }, () => faker.number.int({ min: 100, max: 1000 }))
  },
  efficiencyTrends: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    consumption: faker.number.float({ min: 400, max: 800, precision: 0.1 }),
    efficiency: faker.number.float({ min: 60, max: 90, precision: 0.1 }),
    carbon: faker.number.float({ min: 50, max: 200, precision: 0.1 })
  })),
  savings: {
    financial: faker.number.int({ min: 100000, max: 500000 }),
    carbon: faker.number.int({ min: 500, max: 2000 }),
    energy: faker.number.int({ min: 1000, max: 5000 })
  }
});

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Marketplace = () => {
  const [marketData, setMarketData] = useState(generateMarketData());
  const [networkStats, setNetworkStats] = useState(generateNetworkStats());
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('price');

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(current =>
        current.map(item => ({
          ...item,
          price: item.price * (1 + faker.number.float({ min: -0.02, max: 0.02 })),
          trend: faker.number.float({ min: -15, max: 15, precision: 0.1 })
        }))
      );
      
      setNetworkStats(generateNetworkStats());
      
      if (Math.random() > 0.7) {
        setNotifications(current => [
          {
            id: faker.string.uuid(),
            type: faker.helpers.arrayElement(['alert', 'success', 'warning']),
            message: `Network ${faker.helpers.arrayElement(['efficiency improved', 'peak detected', 'optimization opportunity'])} in ${faker.helpers.arrayElement(['5G', '4G', 'Data Center'])} sector`,
            time: new Date()
          },
          ...current.slice(0, 4)
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort logic
  const processedMarketData = marketData
    .filter(item => filterNetwork === 'all' || item.name.includes(filterNetwork))
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'efficiency': return b.efficiencyGain - a.efficiencyGain;
        case 'roi': return a.roi - b.roi;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Network Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Telecom Network Energy Marketplace</h1>
        
        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200 w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <div className="stat-title">Energy Savings</div>
            <div className="stat-value text-primary">{networkStats.savings.energy.toLocaleString()} MWh</div>
            <div className="stat-desc">↗︎ 14% vs last month</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-success">
              <Sun className="w-8 h-8" />
            </div>
            <div className="stat-title">Carbon Reduced</div>
            <div className="stat-value text-success">{networkStats.savings.carbon.toLocaleString()} tons</div>
            <div className="stat-desc">↗︎ 8% vs last month</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Server className="w-8 h-8" />
            </div>
            <div className="stat-title">Network Efficiency</div>
            <div className="stat-value text-secondary">92.4%</div>
            <div className="stat-desc">↗︎ 3.2% vs last month</div>
          </div>
        </div>
      </motion.div>

      {/* Network Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">Network Energy Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={networkStats.energyConsumption.labels.map((label, index) => ({
                      name: label,
                      value: networkStats.energyConsumption.data[index]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {networkStats.energyConsumption.labels.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">Efficiency Trends (24h)</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={networkStats.efficiencyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="hour" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="efficiency" stroke="#22c55e" fill="#22c55e33" />
                  <Area type="monotone" dataKey="carbon" stroke="#3b82f6" fill="#3b82f633" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-base-200 p-4 rounded-lg">
        <div className="join">
          {['marketplace', 'analytics', 'history'].map(tab => (
            <button 
              key={tab}
              className={`join-item btn ${activeTab === tab ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select 
            className="select select-bordered"
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
          >
            <option value="all">All Networks</option>
            <option value="5G">5G Network</option>
            <option value="4G">4G Network</option>
            <option value="Data Center">Data Centers</option>
            <option value="Radio">Radio Access</option>
          </select>
          
          <select 
            className="select select-bordered"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price">Sort by Price</option>
            <option value="efficiency">Sort by Efficiency</option>
            <option value="roi">Sort by ROI</option>
          </select>
          
          <div className="join">
            <div className="join-item btn btn-sm" onClick={() => setViewMode('grid')}>
              <i className="fas fa-grid-2"></i>
            </div>
            <div className="join-item btn btn-sm" onClick={() => setViewMode('list')}>
              <i className="fas fa-list"></i>
            </div>
          </div>

          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search packages..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>
            <div className="dropdown-content z-50 menu p-2 shadow bg-base-200 rounded-box w-72">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-2 hover:bg-base-300 rounded alert alert-${notif.type}`}>
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs opacity-60">
                    {new Date(notif.time).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'marketplace' && (
          <motion.div
            key="marketplace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
          >
            {processedMarketData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="card-body">
                  <h2 className="card-title flex justify-between">
                    {item.name}
                    <div className="badge badge-primary">{item.sourceType}</div>
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div>
                    <p className="text-sm opacity-70">Provider</p>
                      <p className="font-medium">{item.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Efficiency Gain</p>
                      <p className="font-medium text-success">+{item.efficiencyGain}%</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Price/kWh</p>
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">ROI Period</p>
                      <p className="font-medium">{item.roi} months</p>
                    </div>
                  </div>

                  <div className="divider"></div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Network Impact</span>
                      <div className={`badge ${
                        item.networkImpact === 'Minimal' ? 'badge-success' :
                        item.networkImpact === 'Moderate' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {item.networkImpact}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Implementation Time</span>
                      <span>{item.implementationTime} {item.implementationTime === 1 ? 'month' : 'months'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Reduction</span>
                      <span className="text-success">{item.peakReduction}%</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium">Optimization Method</p>
                    <div className="badge badge-outline mt-1">{item.optimizationMethod}</div>
                  </div>

                  <progress 
                    className="progress progress-success mt-4"
                    value={item.reliability}
                    max="100"
                    title={`Reliability Score: ${item.reliability}%`}
                  ></progress>

                  <div className="card-actions justify-between items-center mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{item.timeLeft}h left</span>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleTrade(item)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Energy Consumption by Network Type</h2>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={networkStats.energyConsumption.labels.map((label, index) => ({
                        name: label,
                        value: networkStats.energyConsumption.data[index]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Carbon Footprint Reduction</h2>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total Reduction</div>
                      <div className="stat-value text-success">{networkStats.savings.carbon} tons</div>
                      <div className="stat-desc">↗︎ 12% vs last month</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Cost Savings</div>
                      <div className="stat-value">₹{networkStats.savings.financial.toLocaleString()}</div>
                      <div className="stat-desc">Since implementation</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Top Contributors</h3>
                    {['5G Optimization', 'Data Center Cooling', 'Smart Sleep Mode'].map((item, index) => (
                      <div key={item} className="flex items-center justify-between mb-2">
                        <span>{item}</span>
                        <progress 
                          className="progress progress-success w-1/2" 
                          value={80 - index * 15} 
                          max="100"
                        ></progress>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-base-200 shadow-xl"
          >
            <div className="card-body">
              <h2 className="card-title mb-4">Trading History</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Package</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
                        <td>{faker.date.recent().toLocaleDateString()}</td>
                        <td>{faker.helpers.arrayElement(['5G', '4G', 'Data Center'])} Optimization</td>
                        <td>
                          <div className={`badge ${index % 2 === 0 ? 'badge-success' : 'badge-info'}`}>
                            {index % 2 === 0 ? 'Purchase' : 'Implementation'}
                          </div>
                        </td>
                        <td>{faker.number.int({ min: 1000, max: 5000 })} kWh</td>
                        <td>${faker.number.float({ min: 100, max: 1000, precision: 2 })}</td>
                        <td>
                          <div className={`badge ${faker.helpers.arrayElement(['badge-success', 'badge-warning', 'badge-info'])}`}>
                            {faker.helpers.arrayElement(['Completed', 'In Progress', 'Pending'])}
                          </div>
                        </td>
                        <td className="text-success">
                        ₹{faker.number.float({ min: 500, max: 5000, precision: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <button className="btn btn-outline btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Trade Modal */}
      <dialog id="trade-modal" className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-2xl mb-4">Energy Optimization Package Details</h3>
          {selectedPackage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="stat bg-base-300 rounded-box">
                  <div className="stat-title">Package Name</div>
                  <div className="stat-value text-lg">{selectedPackage.name}</div>
                </div>
                <div className="stat bg-base-300 rounded-box">
                  <div className="stat-title">Provider</div>
                  <div className="stat-value text-lg">{selectedPackage.provider}</div>
                </div>
                <div className="stat bg-base-300 rounded-box">
                  <div className="stat-title">Price per kWh</div>
                  <div className="stat-value text-lg">${selectedPackage.price.toFixed(2)}</div>
                </div>
              </div>

              <div className="divider">Implementation Details</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Implementation Timeline</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={selectedPackage.implementationTime}
                    className="range range-primary"
                    step="1"
                  />
                  <div className="w-full flex justify-between text-xs px-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <span key={i}>{i + 1}m</span>
                    ))}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Network Coverage</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option>Full Network</option>
                    <option>Selected Sites Only</option>
                    <option>Test Implementation</option>
                  </select>
                </div>
              </div>

              <div className="bg-base-300 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Expected Outcomes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Efficiency Gain</p>
                    <p className="text-xl font-semibold text-success">+{selectedPackage.efficiencyGain}%</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">ROI Period</p>
                    <p className="text-xl font-semibold">{selectedPackage.roi} months</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Carbon Reduction</p>
                    <p className="text-xl font-semibold text-primary">{selectedPackage.carbonOffset} tons</p>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle"></i>
                <span>Implementation support and training included in package price</span>
              </div>
            </div>
          )}
          <div className="modal-action">
            <form method="dialog" className="space-x-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">
                Proceed with Implementation
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Marketplace;