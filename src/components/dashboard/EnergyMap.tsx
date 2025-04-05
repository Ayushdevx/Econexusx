import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Wind, Sun, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const EnergyMap: React.FC = () => {
  const { sites } = useDataStore();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapBounds, setMapBounds] = useState({ width: 800, height: 500 });
  
  // Update map bounds on resize
  useEffect(() => {
    const updateBounds = () => {
      if (mapRef.current) {
        setMapBounds({
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight
        });
      }
    };
    
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Generate random coordinates within the map bounds for demo purposes
  const getRandomCoordinates = (index: number) => {
    // Use the index to create deterministic but distributed points
    const angle = (index / sites.length) * Math.PI * 2;
    const radius = Math.min(mapBounds.width, mapBounds.height) * 0.4 * (0.6 + Math.random() * 0.4);
    
    return {
      x: mapBounds.width / 2 + Math.cos(angle) * radius,
      y: mapBounds.height / 2 + Math.sin(angle) * radius
    };
  };
  
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
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getEnergyIcon = (type: string) => {
    switch (type) {
      case 'Cell Tower':
        return <Zap className="h-4 w-4" />;
      case 'Data Center':
        return <Zap className="h-5 w-5" />;
      case 'Office':
        return <Sun className="h-4 w-4" />;
      case 'Switching Center':
        return <Wind className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card bg-base-100 overflow-hidden"
    >
      <div className="card-body p-6">
        <h3 className="card-title flex justify-between items-center">
          <span>Energy Network Map</span>
          <div className="flex gap-2">
            <span className="badge badge-success gap-1">
              <CheckCircle className="h-3 w-3" /> Online
            </span>
            <span className="badge badge-error gap-1">
              <AlertTriangle className="h-3 w-3" /> Offline
            </span>
            <span className="badge badge-warning gap-1">
              <Clock className="h-3 w-3" /> Maintenance
            </span>
          </div>
        </h3>
        
        <div 
          ref={mapRef}
          className="relative bg-base-200 rounded-lg overflow-hidden h-[500px] mt-4"
        >
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : (
            <>
              {/* Map background with grid */}
              <div className="absolute inset-0 bg-grid opacity-30"></div>
              
              {/* Connection lines between sites */}
              <svg className="absolute inset-0 w-full h-full">
                {sites.map((site, i) => {
                  const sourceCoords = getRandomCoordinates(i);
                  
                  // Connect to 2-3 random other sites
                  return Array.from({ length: 2 + Math.floor(Math.random() * 2) }).map((_, j) => {
                    const targetIndex = (i + j + 1) % sites.length;
                    const targetCoords = getRandomCoordinates(targetIndex);
                    
                    return (
                      <motion.line
                        key={`${i}-${j}`}
                        x1={sourceCoords.x}
                        y1={sourceCoords.y}
                        x2={targetCoords.x}
                        y2={targetCoords.y}
                        stroke={site.status === 'Online' ? 'currentColor' : '#666'}
                        strokeWidth={1}
                        className="text-primary/30"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                      />
                    );
                  });
                }).flat()}
              </svg>
              
              {/* Site markers */}
              {sites.map((site, index) => {
                const coords = getRandomCoordinates(index);
                const isSelected = selectedSite === site.id;
                
                return (
                  <motion.div
                    key={site.id}
                    className="absolute"
                    style={{ left: coords.x, top: coords.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isSelected ? 1.2 : 1, 
                      opacity: 1,
                      x: -20, // Center the marker
                      y: -20  // Center the marker
                    }}
                    transition={{ 
                      type: 'spring',
                      delay: index * 0.05,
                      duration: 0.5
                    }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setSelectedSite(isSelected ? null : site.id)}
                  >
                    <div 
                      className={`relative p-4 rounded-full cursor-pointer
                        ${isSelected ? 'bg-primary/20' : 'bg-base-100/80'} 
                        border-2 border-${getStatusColor(site.status)}
                        shadow-lg backdrop-blur-sm`}
                    >
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-${getStatusColor(site.status)} animate-pulse`}></div>
                      {getEnergyIcon(site.type)}
                      
                      {/* Site info tooltip */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-64 p-3 bg-base-100 rounded-lg shadow-xl z-10"
                        >
                          <div className="font-bold">{site.name}</div>
                          <div className="text-sm opacity-70">{site.location.address}</div>
                          <div className="flex justify-between items-center mt-2">
                            <div className={`badge badge-${getStatusColor(site.status)} gap-1`}>
                              {getStatusIcon(site.status)}
                              {site.status}
                            </div>
                            <div className="text-sm">{site.type}</div>
                          </div>
                          
                          {site.energyData.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm">Current Energy: {site.energyData[site.energyData.length - 1].consumption.toFixed(1)} kWh</div>
                              <div className="flex items-center gap-2 mt-1">
                                <progress 
                                  className="progress progress-primary flex-1" 
                                  value={site.energyData[site.energyData.length - 1].efficiency} 
                                  max="100"
                                ></progress>
                                <span className="text-xs">{site.energyData[site.energyData.length - 1].efficiency}%</span>
                              </div>
                            </div>
                          )}
                          
                          <button className="btn btn-xs btn-primary w-full mt-2">View Details</button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Map controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button className="btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm">+</button>
                <button className="btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm">-</button>
              </div>
              
              {/* Map legend */}
              <div className="absolute bottom-4 left-4 bg-base-100/80 backdrop-blur-sm p-2 rounded-lg text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="h-3 w-3 text-primary" /> Cell Tower
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Sun className="h-3 w-3 text-warning" /> Office
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-info" /> Data Center
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnergyMap;
