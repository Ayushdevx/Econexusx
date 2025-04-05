import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MachinePartsMonitorProps {
  selectedSiteId: string | null;
}

const MachinePartsMonitor: React.FC<MachinePartsMonitorProps> = ({ selectedSiteId }) => {
  const { sites } = useDataStore();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  
  // Get the current site data
  const currentSite = selectedSiteId 
    ? sites.find(site => site.id === selectedSiteId)
    : sites.length > 0 ? sites[0] : null;
  
  // Update equipment data when selected site changes
  useEffect(() => {
    if (currentSite && currentSite.equipment) {
      setEquipmentData(currentSite.equipment);
      setSelectedEquipmentId(null); // Reset selected equipment when site changes
    } else {
      setEquipmentData([]);
    }
  }, [currentSite]);
  
  // Get the selected equipment details
  const selectedEquipment = selectedEquipmentId 
    ? equipmentData.find(eq => eq.id === selectedEquipmentId) 
    : null;
  
  // Generate simulated historical data for the selected equipment
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  useEffect(() => {
    if (selectedEquipment) {
      // Generate 24 hours of mock data
      const baseEfficiency = selectedEquipment.energyEfficiency;
      const baseTemperature = selectedEquipment.temperature;
      const baseVibration = selectedEquipment.vibration;
      
      const newHistoricalData = Array.from({ length: 24 }, (_, i) => {
        // Efficiency decreases over time for problematic equipment
        const timeOffset = (24 - i) / 24;
        const efficiencyVariation = selectedEquipment.status === 'Critical' 
          ? 15 * timeOffset 
          : selectedEquipment.status === 'Warning' ? 8 * timeOffset : 2 * timeOffset;
        
        return {
          time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          efficiency: Math.min(100, Math.max(50, baseEfficiency + (efficiencyVariation * Math.random()))),
          temperature: baseTemperature - (5 * timeOffset * Math.random()),
          vibration: baseVibration - (10 * timeOffset * Math.random()),
        };
      });
      
      setHistoricalData(newHistoricalData);
    }
  }, [selectedEquipment]);
  
  // Prepare data for status distribution pie chart
  const statusDistribution = [
    { name: 'Operational', value: equipmentData.filter(eq => eq.status === 'Operational').length },
    { name: 'Warning', value: equipmentData.filter(eq => eq.status === 'Warning').length },
    { name: 'Critical', value: equipmentData.filter(eq => eq.status === 'Critical').length },
    { name: 'Offline', value: equipmentData.filter(eq => eq.status === 'Offline').length },
  ].filter(item => item.value > 0);
  
  const COLORS = ['#36D399', '#FBBD23', '#F87272', '#6E6E6E'];
  
  if (!currentSite) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Please select a site to view equipment details.</span>
        </div>
      </div>
    );
  }
  
  if (!currentSite.equipment || currentSite.equipment.length === 0) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>No equipment data available for this site.</span>
        </div>
      </div>
    );
  }
  
  // Sort equipment by status severity (Critical first)
  const sortedEquipment = [...equipmentData].sort((a, b) => {
    const statusPriority: Record<string, number> = { 
      'Critical': 3, 
      'Warning': 2, 
      'Offline': 1, 
      'Operational': 0 
    };
    return statusPriority[b.status as keyof typeof statusPriority] - statusPriority[a.status as keyof typeof statusPriority];
  });
  
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{currentSite.name} - Equipment Health</h3>
        <p className="text-base-content/70">
          Monitor individual equipment parts and identify issues requiring maintenance.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <h4 className="font-semibold mb-3">Equipment Status</h4>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Efficiency</th>
                  <th>Temperature</th>
                  <th>Maintenance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedEquipment.map(equipment => (
                  <tr 
                    key={equipment.id} 
                    className={`${
                      equipment.status === 'Critical' ? 'bg-error/10' :
                      equipment.status === 'Warning' ? 'bg-warning/10' :
                      equipment.status === 'Offline' ? 'bg-base-300' : ''
                    } ${selectedEquipmentId === equipment.id ? 'border-l-4 border-primary' : ''}`}
                  >
                    <td className="font-medium">{equipment.name}</td>
                    <td>
                      <span className={`badge ${
                        equipment.status === 'Critical' ? 'badge-error' :
                        equipment.status === 'Warning' ? 'badge-warning' :
                        equipment.status === 'Offline' ? 'badge-ghost' : 'badge-success'
                      }`}>
                        {equipment.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className={`${
                          equipment.energyEfficiency < 70 ? 'text-error' :
                          equipment.energyEfficiency < 85 ? 'text-warning' : 'text-success'
                        }`}>
                          {equipment.energyEfficiency.toFixed(1)}%
                        </span>
                        <div className="ml-2 h-1 w-16 bg-base-300 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              equipment.energyEfficiency < 70 ? 'bg-error' :
                              equipment.energyEfficiency < 85 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{width: `${equipment.energyEfficiency}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className={`${
                          equipment.temperature > 80 ? 'text-error' :
                          equipment.temperature > 60 ? 'text-warning' : 'text-info'
                        }`}>
                          {equipment.temperature.toFixed(1)}°C
                        </span>
                      </div>
                    </td>
                    <td>
                      {equipment.maintenanceDue ? (
                        <span className="text-warning">Due</span>
                      ) : (
                        <span>OK</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedEquipmentId(
                          selectedEquipmentId === equipment.id ? null : equipment.id
                        )}
                      >
                        {selectedEquipmentId === equipment.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Equipment Status Distribution</h4>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} units`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-[200px] bg-base-200 rounded-lg">
              <p className="text-base-content/50">No data available</p>
            </div>
          )}
          
          <div className="mt-4">
            <div className="stats stats-vertical shadow w-full">
              <div className="stat">
                <div className="stat-title">Last Maintenance</div>
                <div className="stat-value text-lg">
                  {new Date(Math.min(...equipmentData.map(eq => eq.lastMaintenance))).toLocaleDateString()}
                </div>
                <div className="stat-desc">Earliest equipment service</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Equipment Requiring Service</div>
                <div className="stat-value text-warning">
                  {equipmentData.filter(eq => eq.maintenanceDue).length}
                </div>
                <div className="stat-desc">
                  {((equipmentData.filter(eq => eq.maintenanceDue).length / equipmentData.length) * 100).toFixed(0)}% of total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Equipment Details Section */}
      {selectedEquipment && (
        <div className="border border-base-300 rounded-lg p-4 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-bold">{selectedEquipment.name} Details</h4>
              <p className="text-base-content/70">
                ID: {selectedEquipment.id.substr(0, 8)}...
              </p>
            </div>
            <div className={`badge ${
              selectedEquipment.status === 'Critical' ? 'badge-error' :
              selectedEquipment.status === 'Warning' ? 'badge-warning' :
              selectedEquipment.status === 'Offline' ? 'badge-ghost' : 'badge-success'
            } badge-lg`}>
              {selectedEquipment.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-2">Performance Metrics</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-base-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-base-content/70">Efficiency</div>
                  <div className={`text-lg font-bold ${
                    selectedEquipment.energyEfficiency < 70 ? 'text-error' :
                    selectedEquipment.energyEfficiency < 85 ? 'text-warning' : 'text-success'
                  }`}>
                    {selectedEquipment.energyEfficiency.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-base-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-base-content/70">Temperature</div>
                  <div className={`text-lg font-bold ${
                    selectedEquipment.temperature > 80 ? 'text-error' :
                    selectedEquipment.temperature > 60 ? 'text-warning' : 'text-info'
                  }`}>
                    {selectedEquipment.temperature.toFixed(1)}°C
                  </div>
                </div>
                
                <div className="bg-base-200 p-3 rounded-lg text-center">
                  <div className="text-xs text-base-content/70">Vibration</div>
                  <div className={`text-lg font-bold ${
                    selectedEquipment.vibration > 70 ? 'text-error' :
                    selectedEquipment.vibration > 40 ? 'text-warning' : 'text-success'
                  }`}>
                    {selectedEquipment.vibration.toFixed(1)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Maintenance History</h5>
                <div className="bg-base-200 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span>Last Service:</span>
                    <span>{new Date(selectedEquipment.lastMaintenance).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Status:</span>
                    <span className={selectedEquipment.maintenanceDue ? 'text-warning' : 'text-success'}>
                      {selectedEquipment.maintenanceDue ? 'Maintenance Due' : 'Up to Date'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-semibold mb-2">Recommendations</h5>
                  <div className={`alert ${
                    selectedEquipment.status === 'Critical' ? 'alert-error' :
                    selectedEquipment.status === 'Warning' ? 'alert-warning' :
                    'alert-info'
                  }`}>
                    {selectedEquipment.status === 'Critical' ? (
                      <span>Replace part immediately. Excessive energy consumption detected.</span>
                    ) : selectedEquipment.status === 'Warning' ? (
                      <span>Schedule maintenance within 7 days. Abnormal readings detected.</span>
                    ) : (
                      <span>Regular maintenance recommended. Equipment performing as expected.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Efficiency Trend (24h)</h5>
              <ResponsiveContainer width="100%" height={200}>
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
              
              <h5 className="font-semibold mb-2 mt-4">Temperature Trend (24h)</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#F87272" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinePartsMonitor; 