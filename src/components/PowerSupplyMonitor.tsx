import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PowerSupplyMonitorProps {
  selectedSiteId: string | null;
}

interface PowerIssue {
  id: string;
  siteId: string;
  siteName: string;
  area: string;
  issueType: 'no_power' | 'high_voltage' | 'low_voltage' | 'unstable';
  severity: 'critical' | 'warning' | 'info';
  detectedAt: number;
  affectedEquipment: string[];
  estimatedImpact: number; // Estimated energy loss or excess in kWh
  reportedToGrid: boolean;
  status: 'detected' | 'reported' | 'resolved';
}

const PowerSupplyMonitor: React.FC<PowerSupplyMonitorProps> = ({ selectedSiteId }) => {
  const { sites } = useDataStore();
  const [powerIssues, setPowerIssues] = useState<PowerIssue[]>([]);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  
  // Get the current site data
  const currentSite = selectedSiteId 
    ? sites.find(site => site.id === selectedSiteId)
    : sites.length > 0 ? sites[0] : null;
  
  // Generate power issues based on equipment health and efficiency
  useEffect(() => {
    if (!currentSite) return;
    
    // Clear previous issues when site changes
    setPowerIssues([]);
    
    // Only generate issues if the site has equipment data
    if (currentSite.equipment && currentSite.equipment.length > 0) {
      const newIssues: PowerIssue[] = [];
      
      // Group equipment by area (simulating different areas of a facility)
      const areas = ['North Wing', 'South Wing', 'East Wing', 'West Wing', 'Main Building', 'Substation A', 'Substation B'];
      
      // Check each area for potential power issues
      areas.forEach(area => {
        // Simulate equipment in this area (1-3 pieces)
        const areaEquipment = currentSite.equipment!
          .filter(() => Math.random() > 0.7)
          .slice(0, 3);
        
        if (areaEquipment.length > 0) {
          // Calculate average efficiency in this area
          const avgEfficiency = areaEquipment.reduce((sum, eq) => sum + eq.energyEfficiency, 0) / areaEquipment.length;
          
          // Count critical equipment
          const criticalCount = areaEquipment.filter(eq => eq.status === 'Critical').length;
          const warningCount = areaEquipment.filter(eq => eq.status === 'Warning').length;
          const offlineCount = areaEquipment.filter(eq => eq.status === 'Offline').length;
          
          // Determine if there's a power issue in this area based on equipment status
          if (offlineCount > 0 || criticalCount > 1 || avgEfficiency < 70) {
            // Generate different types of issues
            let issueType: 'no_power' | 'high_voltage' | 'low_voltage' | 'unstable';
            let severity: 'critical' | 'warning' | 'info';
            let estimatedImpact: number;
            
            if (offlineCount > 0) {
              // No power - likely broken wires or connections
              issueType = 'no_power';
              severity = 'critical';
              estimatedImpact = 0; // No energy consumption in this area
            } else if (avgEfficiency < 60) {
              // High voltage - equipment overheating/overconsumption
              issueType = 'high_voltage';
              severity = 'critical';
              estimatedImpact = areaEquipment.reduce((sum, eq) => sum + (100 - eq.energyEfficiency) * 2, 0);
            } else if (criticalCount > 0) {
              // Unstable power - fluctuating voltage
              issueType = 'unstable';
              severity = 'warning';
              estimatedImpact = areaEquipment.reduce((sum, eq) => sum + (100 - eq.energyEfficiency), 0);
            } else {
              // Low voltage - reduced efficiency
              issueType = 'low_voltage';
              severity = 'warning';
              estimatedImpact = areaEquipment.reduce((sum, eq) => sum + (85 - eq.energyEfficiency) / 2, 0);
            }
            
            // Create the issue record
            newIssues.push({
              id: `issue-${Math.random().toString(36).substring(2, 9)}`,
              siteId: currentSite.id,
              siteName: currentSite.name,
              area,
              issueType,
              severity,
              detectedAt: Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000), // Random detection time in last 24h
              affectedEquipment: areaEquipment.map(eq => eq.name),
              estimatedImpact,
              reportedToGrid: Math.random() > 0.5, // Some issues already reported
              status: Math.random() > 0.7 ? 'detected' : (Math.random() > 0.5 ? 'reported' : 'resolved')
            });
          }
        }
      });
      
      setPowerIssues(newIssues);
    }
  }, [currentSite]);
  
  // Filter issues based on selected filter
  const filteredIssues = powerIssues.filter(issue => {
    if (filter === 'all') return true;
    if (filter === 'no_power') return issue.issueType === 'no_power';
    if (filter === 'voltage_issues') return issue.issueType === 'high_voltage' || issue.issueType === 'low_voltage';
    if (filter === 'critical') return issue.severity === 'critical';
    if (filter === 'unresolved') return issue.status !== 'resolved';
    return true;
  });
  
  // Group issues by type for chart display
  const issuesByType = [
    { type: 'No Power', count: powerIssues.filter(i => i.issueType === 'no_power').length },
    { type: 'High Voltage', count: powerIssues.filter(i => i.issueType === 'high_voltage').length },
    { type: 'Low Voltage', count: powerIssues.filter(i => i.issueType === 'low_voltage').length },
    { type: 'Unstable', count: powerIssues.filter(i => i.issueType === 'unstable').length },
  ];
  
  // Group issues by status for chart display
  const issuesByStatus = [
    { status: 'Detected', count: powerIssues.filter(i => i.status === 'detected').length },
    { status: 'Reported', count: powerIssues.filter(i => i.status === 'reported').length },
    { status: 'Resolved', count: powerIssues.filter(i => i.status === 'resolved').length },
  ];
  
  // Calculate estimated total energy impact
  const totalEnergyImpact = powerIssues.reduce((sum, issue) => sum + issue.estimatedImpact, 0);
  
  // Simulate reporting an issue to the grid operator
  const handleReportIssue = (issueId: string) => {
    setIsReporting(true);
    
    // Simulate API call
    setTimeout(() => {
      setPowerIssues(issues => issues.map(issue => 
        issue.id === issueId ? { ...issue, reportedToGrid: true, status: 'reported' } : issue
      ));
      setIsReporting(false);
    }, 1500);
  };
  
  // Function to get appropriate visual cues based on issue type
  const getIssueInfo = (issueType: string) => {
    switch (issueType) {
      case 'no_power':
        return { color: 'text-warning', bgColor: 'bg-warning/10', icon: '⚠️', label: 'No Power' };
      case 'high_voltage':
        return { color: 'text-error', bgColor: 'bg-error/10', icon: '⚡', label: 'High Voltage' };
      case 'low_voltage':
        return { color: 'text-info', bgColor: 'bg-info/10', icon: '↓', label: 'Low Voltage' };
      case 'unstable':
        return { color: 'text-secondary', bgColor: 'bg-secondary/10', icon: '↕️', label: 'Unstable' };
      default:
        return { color: 'text-base-content', bgColor: 'bg-base-200', icon: '❓', label: 'Unknown' };
    }
  };
  
  // Function to determine if an issue is "alarming" (needs urgent attention)
  const isAlarming = (issue: PowerIssue) => {
    return issue.severity === 'critical' && issue.status === 'detected';
  };
  
  if (!currentSite) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg text-center">
        <p>Please select a site to view power supply issues.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{currentSite.name} - Power Supply Monitoring</h3>
        <p className="text-base-content/70">
          Detect and report power supply issues after disasters such as floods or storms.
        </p>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Detected Issues</div>
          <div className="stat-value text-primary">{powerIssues.length}</div>
          <div className="stat-desc">Areas with power problems</div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Critical Issues</div>
          <div className="stat-value text-error">{powerIssues.filter(i => i.severity === 'critical').length}</div>
          <div className="stat-desc">Require immediate action</div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Energy Impact</div>
          <div className="stat-value text-warning">{totalEnergyImpact.toFixed(0)} kWh</div>
          <div className="stat-desc">Excess or lost energy</div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Areas Without Power</div>
          <div className="stat-value text-secondary">{powerIssues.filter(i => i.issueType === 'no_power').length}</div>
          <div className="stat-desc">Due to broken connections</div>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <select
            className="select select-bordered select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Issues</option>
            <option value="no_power">No Power</option>
            <option value="voltage_issues">Voltage Issues</option>
            <option value="critical">Critical Only</option>
            <option value="unresolved">Unresolved</option>
          </select>
        </div>
        
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            // Report all detected critical issues
            setIsReporting(true);
            
            // Simulate batch reporting
            setTimeout(() => {
              setPowerIssues(issues => issues.map(issue => 
                issue.status === 'detected' && issue.severity === 'critical' 
                  ? { ...issue, reportedToGrid: true, status: 'reported' } 
                  : issue
              ));
              setIsReporting(false);
            }, 2000);
          }}
          disabled={isReporting || powerIssues.filter(i => i.status === 'detected' && i.severity === 'critical').length === 0}
        >
          {isReporting ? 'Reporting...' : 'Report All Critical Issues'}
        </button>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-base">Issues by Type</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issuesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-base">Issue Status</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issuesByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* List of power issues */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Detected Power Issues</h4>
        
        {filteredIssues.length === 0 ? (
          <div className="bg-base-200 p-4 rounded-lg text-center">
            <p>No power supply issues found matching the current filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map(issue => {
              const issueInfo = getIssueInfo(issue.issueType);
              
              return (
                <div 
                  key={issue.id} 
                  className={`p-4 rounded-lg ${issueInfo.bgColor} ${isAlarming(issue) ? 'animate-pulse border border-error' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{issueInfo.icon}</span>
                        <h4 className={`font-semibold ${issueInfo.color}`}>
                          {issueInfo.label} - {issue.area}
                        </h4>
                        <span className={`badge ${
                          issue.severity === 'critical' ? 'badge-error' :
                          issue.severity === 'warning' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      
                      <p className="mt-1">Detected {new Date(issue.detectedAt).toLocaleString()}</p>
                      
                      {issue.affectedEquipment.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Affected equipment:</span>{' '}
                          {issue.affectedEquipment.join(', ')}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <span className="font-medium">Energy impact:</span>{' '}
                        {issue.issueType === 'no_power' 
                          ? 'No energy consumption' 
                          : `${issue.estimatedImpact.toFixed(1)} kWh ${issue.issueType === 'high_voltage' ? 'excess' : 'loss'}`
                        }
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        {issue.status === 'detected' ? (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleReportIssue(issue.id)}
                            disabled={isReporting}
                          >
                            {isReporting ? 'Reporting...' : 'Report to Grid Operator'}
                          </button>
                        ) : (
                          <span className={`badge ${
                            issue.status === 'reported' ? 'badge-warning' : 'badge-success'
                          }`}>
                            {issue.status === 'reported' ? 'Reported to Grid' : 'Resolved'}
                          </span>
                        )}
                        
                        {issue.issueType === 'no_power' && (
                          <button className="btn btn-sm btn-outline">Request Emergency Power</button>
                        )}
                        
                        {issue.issueType === 'high_voltage' && (
                          <button className="btn btn-sm btn-outline">Isolate Circuit</button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className={`text-lg font-bold ${
                        issue.issueType === 'no_power' ? 'text-warning' :
                        issue.issueType === 'high_voltage' ? 'text-error' :
                        'text-info'
                      }`}>
                        {issue.issueType === 'no_power' && '0 kW'}
                        {issue.issueType === 'high_voltage' && '↑ +' + (issue.estimatedImpact / 24).toFixed(1) + ' kW'}
                        {issue.issueType === 'low_voltage' && '↓ -' + (issue.estimatedImpact / 24).toFixed(1) + ' kW'}
                        {issue.issueType === 'unstable' && '↕️ ±' + (issue.estimatedImpact / 24).toFixed(1) + ' kW'}
                      </div>
                      
                      {issue.reportedToGrid && (
                        <span className="badge badge-ghost mt-2">Report ID: #{Math.floor(Math.random() * 10000)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Action recommendations */}
      {powerIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length > 0 && (
        <div className="mt-8 alert alert-error">
          <div>
            <h4 className="font-bold">Critical Actions Required</h4>
            <ul className="mt-2">
              {powerIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').map(issue => (
                <li key={issue.id}>
                  {issue.issueType === 'no_power' && `Restore power to ${issue.area} - likely broken power lines after disaster`}
                  {issue.issueType === 'high_voltage' && `Reduce input voltage to ${issue.area} to prevent equipment damage`}
                  {issue.issueType === 'unstable' && `Stabilize power supply to ${issue.area} to prevent equipment failure`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerSupplyMonitor; 