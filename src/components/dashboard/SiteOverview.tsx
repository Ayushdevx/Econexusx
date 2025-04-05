import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, AlertTriangle, CheckCircle, Clock, Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const SiteOverview: React.FC = () => {
  const { sites, isLoading } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? site.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'success';
      case 'Offline':
        return 'error';
      case 'Maintenance':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online':
        return <CheckCircle className="h-4 w-4" />;
      case 'Offline':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Maintenance':
        return <Clock className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card bg-base-100"
    >
      <div className="card-body p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h3 className="card-title">Site Overview</h3>
          
          <div className="flex flex-wrap gap-2">
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search sites..."
                  className="input input-bordered input-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-sm btn-square">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                <Filter className="h-4 w-4" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a 
                    className={statusFilter === null ? 'active' : ''} 
                    onClick={() => setStatusFilter(null)}
                  >
                    All Status
                  </a>
                </li>
                <li>
                  <a 
                    className={statusFilter === 'Online' ? 'active' : ''} 
                    onClick={() => setStatusFilter('Online')}
                  >
                    Online
                  </a>
                </li>
                <li>
                  <a 
                    className={statusFilter === 'Offline' ? 'active' : ''} 
                    onClick={() => setStatusFilter('Offline')}
                  >
                    Offline
                  </a>
                </li>
                <li>
                  <a 
                    className={statusFilter === 'Maintenance' ? 'active' : ''} 
                    onClick={() => setStatusFilter('Maintenance')}
                  >
                    Maintenance
                  </a>
                </li>
              </ul>
            </div>
            
            <button className="btn btn-sm btn-primary">
              <Plus className="h-4 w-4 mr-1" />
              Add Site
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Energy Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="loading loading-spinner loading-md"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No sites found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <div className="font-medium">{site.name}</div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        <span className="text-sm">{site.location.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-ghost">{site.type}</div>
                    </td>
                    <td>
                      <div className={`badge badge-${getStatusColor(site.status)} gap-1`}>
                        {getStatusIcon(site.status)}
                        {site.status}
                      </div>
                    </td>
                    <td>
                      {site.energyData.length > 0 ? (
                        <div>
                          <div className="text-sm font-medium">
                            {site.energyData[site.energyData.length - 1].consumption.toFixed(1)} kWh
                          </div>
                          <progress 
                            className="progress progress-primary w-full h-1 mt-1" 
                            value={site.energyData[site.energyData.length - 1].efficiency} 
                            max="100"
                          ></progress>
                        </div>
                      ) : (
                        <span className="text-sm text-base-content/50">No data</span>
                      )}
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a>View Details</a></li>
                          <li><a>Edit Site</a></li>
                          <li><a className="text-error">Delete</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteOverview;
