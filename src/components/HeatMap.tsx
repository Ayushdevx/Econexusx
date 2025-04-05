import React, { useEffect, useRef, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import L from 'leaflet';
import '../styles/leaflet.css';
// Importing leaflet-heat module
import 'leaflet.heat';
// Import marker cluster plugin for grouping markers
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// Import Leaflet marker icons to fix webpack issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Add MarkerClusterGroup type to Leaflet namespace
declare module 'leaflet' {
  export interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number;
    polygonOptions?: L.PolylineOptions;
    singleMarkerMode?: boolean;
    spiderfyDistanceMultiplier?: number;
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
    chunkedLoading?: boolean;
    chunkDelay?: number;
  }

  export interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    spiderfy(): void;
    unspiderfy(): void;
  }

  export interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    addLayers(layers: L.Layer[]): this;
    removeLayers(layers: L.Layer[]): this;
    clearLayers(): this;
    spiderfy(): void;
    unspiderfy(): void;
    refreshClusters(layers?: L.Layer | L.Layer[] | L.LayerGroup): this;
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  
  // Extended PolylineOptions to allow for custom properties
  export interface ExtendedPolylineOptions extends PolylineOptions {
    [key: string]: any;
  }
  
  // Extend Control namespace
  namespace Control {
    export interface MiniMapOptions {
      position?: string;
      toggleDisplay?: boolean;
      minimized?: boolean;
      width?: number;
      height?: number;
      zoomLevelOffset?: number;
      zoomLevelFixed?: number;
      zoomAnimation?: boolean;
      autoToggleDisplay?: boolean;
    }
    
    export class MiniMap extends Control {
      constructor(layer: Layer, options?: MiniMapOptions);
    }
  }
}

// Fix default icon issue in Leaflet with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface HeatMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showDisasterMode?: boolean;
}

// Helper functions for custom icons
const createCustomIcon = (status: string, temperature: number, size: number = 10) => {
  let color = '#36D399'; // Default green
  
  if (status === 'Critical') {
    color = '#F87272'; // Red
  } else if (status === 'Warning') {
    color = '#FBBD23'; // Yellow
  } else if (status === 'Offline') {
    color = '#6E6E6E'; // Gray
  }
  
  // Create SVG icon for the marker
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size*2}" height="${size*2}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="${size}" fill="${color}" stroke="white" stroke-width="1" />
      ${temperature > 80 ? '<path d="M12 4 L12 8 M9 6 L15 6" stroke="red" stroke-width="2" />' : ''}
    </svg>
  `;
  
  const svgUrl = 'data:image/svg+xml;base64,' + btoa(svgIcon);
  
  return L.icon({
    iconUrl: svgUrl,
    iconSize: [size*2, size*2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size]
  });
};

// Helper function for power issue icons
const createPowerIssueIcon = (type: string) => {
  let color = '#FBBD23'; // Yellow for "No Power"
  let symbol = '⚠️';
  
  if (type === 'High Voltage') {
    color = '#F87272'; // Red
    symbol = '⚡';
  } else if (type === 'Unstable Power') {
    color = '#FF9551'; // Orange
    symbol = '↕️';
  }
  
  // Create HTML for the icon
  const html = `<div style="
    background-color: ${color};
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
  ">${symbol}</div>`;
  
  return L.divIcon({
    html: html,
    className: 'power-issue-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const HeatMap: React.FC<HeatMapProps> = ({
  centerLat = 13.0827, // Chennai latitude
  centerLng = 80.2707, // Chennai longitude
  zoom = 11, // Closer zoom for Chennai
  showDisasterMode = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { sites, setSites } = useDataStore();
  
  // State for Leaflet map
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);
  const [markersLayer, setMarkersLayer] = useState<L.MarkerClusterGroup | null>(null);
  const [circlesLayer, setCirclesLayer] = useState<L.LayerGroup | null>(null);
  const [timelineSlider, setTimelineSlider] = useState<any>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  
  // Visualization states
  const [isAnomalyMode, setIsAnomalyMode] = useState<boolean>(showDisasterMode);
  const [showMachineParts, setShowMachineParts] = useState<boolean>(false);
  const [showPowerIssues, setShowPowerIssues] = useState<boolean>(false);
  const [show3DView, setShow3DView] = useState<boolean>(false);
  const [currentMapLayer, setCurrentMapLayer] = useState<string>('street');
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(0);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Create map instance
    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    });
    
    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    
    // Add layer groups for markers and circles
    const markers = L.markerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 80,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
        
        // Customize cluster icon based on the health of contained markers
        const markers = cluster.getAllChildMarkers();
        const criticalCount = markers.filter(m => 
          m.options.icon && 
          m.options.icon.options && 
          m.options.icon.options.className?.includes('critical')
        ).length;
        const warningCount = markers.filter(m => 
          m.options.icon && 
          m.options.icon.options && 
          m.options.icon.options.className?.includes('warning')
        ).length;
        
        let clusterClass = '';
        if (criticalCount > 0) {
          clusterClass = 'cluster-critical';
        } else if (warningCount > 0) {
          clusterClass = 'cluster-warning';
        } else {
          clusterClass = 'cluster-normal';
        }
        
        return L.divIcon({
          html: `<div class="cluster-inner">${count}</div>`,
          className: `marker-cluster marker-cluster-${size} ${clusterClass}`,
          iconSize: new L.Point(40, 40)
        });
      }
    }).addTo(map);
    
    const circles = L.layerGroup().addTo(map);
    
    // Create mini-map for navigation - comment out for now until proper type definitions are added
    /*
    const miniMap = new (L as any).Control.MiniMap(
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        minZoom: 0,
        maxZoom: 13
      }), 
      { 
        toggleDisplay: true,
        minimized: true,
        position: 'bottomright'
      }
    ).addTo(map);
    */
    
    // Store references
    setLeafletMap(map);
    setMarkersLayer(markers);
    setCirclesLayer(circles);
    setCurrentMapLayer('street');
    
    // Add zoom animation listener
    map.on('zoomend', () => {
      const currentZoom = map.getZoom();
      
      // Scale all markers based on zoom level for a more dynamic feel
      document.querySelectorAll('.leaflet-marker-icon').forEach((marker: any) => {
        if (!marker.classList.contains('marker-cluster')) {
          const baseSize = parseInt(marker.dataset.baseSize || '1');
          const scale = Math.max(0.8, Math.min(1.5, currentZoom / 15));
          marker.style.transform = `${marker.style.transform.split(' ')[0]} scale(${baseSize * scale})`;
        }
      });
    });
    
    // Cleanup function
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      map.remove();
    };
  }, [centerLat, centerLng, zoom]);
  
  // Update map when data or visualization modes change
  useEffect(() => {
    if (!leafletMap || !markersLayer || !circlesLayer || sites.length === 0) return;
    
    // Clear existing layers
    markersLayer.clearLayers();
    circlesLayer.clearLayers();
    
    if (heatmapLayer) {
      leafletMap.removeLayer(heatmapLayer);
    }
    
    // Add additional map controls
    if (!leafletMap.getContainer().getAttribute('data-controls-added')) {
      // Add layer control for different map styles
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      });
      
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      });
      
      const darkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      });
      
      const baseMaps = {
        "Street": streetLayer,
        "Satellite": satelliteLayer,
        "Topographic": topoLayer,
        "Dark": darkLayer
      };
      
      L.control.layers(baseMaps).addTo(leafletMap);
      L.control.scale().addTo(leafletMap);
      
      // Mark that controls are added
      leafletMap.getContainer().setAttribute('data-controls-added', 'true');
    }
    
    // Generate heat map data points
    const heatMapData = sites.map(site => {
      const latestEnergyData = site.energyData[site.energyData.length - 1];
      
      // Calculate weight for heatmap
      let weight = latestEnergyData.consumption;
      if (isAnomalyMode) {
        weight = latestEnergyData.consumption * (100 - latestEnergyData.efficiency) / 100;
      }
      
      return [site.location.lat, site.location.lng, weight / 10];
    });
    
    // Apply different visualizations based on selected mode
    if (showMachineParts && sites[0]?.equipment) {
      // Machine parts visualization
      visualizeMachineParts();
    } else if (showPowerIssues && sites[0]?.equipment) {
      // Power issues visualization
      visualizePowerIssues();
    } else {
      // Standard visualization with heatmap and site markers
      
      // Create heat layer if not in 3D view
      if (!show3DView) {
        // @ts-ignore - Leaflet.heat typing workaround
        const heat = L.heatLayer(heatMapData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: isAnomalyMode 
            ? {0.0: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'} 
            : {0.0: 'blue', 0.4: 'cyan', 0.7: 'lime', 1.0: 'yellow'}
        }).addTo(leafletMap);
        
        setHeatmapLayer(heat);
      }
      
      // Add markers for each site
      sites.forEach(site => {
        const latestData = site.energyData[site.energyData.length - 1];
        const efficiency = latestData.efficiency;
        
        // In 3D view, use circles with different sizes to create 3D effect
        if (show3DView) {
          // Scale for 3D visualization
          const maxSize = Math.max(50, latestData.consumption / 2);
          
          // Create stacked circles with decreasing opacity and increasing size for 3D effect
          for (let i = 0; i < 5; i++) {
            const size = maxSize * (1 - i * 0.15);
            const opacity = 0.8 - (i * 0.15);
            
            L.circle([site.location.lat, site.location.lng], {
              radius: size,
              fillColor: efficiency < 70 ? '#F87272' : efficiency < 85 ? '#FBBD23' : '#36D399',
              fillOpacity: opacity,
              stroke: i === 0, // Only add stroke to the top circle
              color: 'white',
              weight: i === 0 ? 1 : 0
            }).addTo(circlesLayer);
          }
          
          // Add marker at the top of the 3D stack
          const marker = L.marker([site.location.lat, site.location.lng], {
            icon: createCustomIcon(
              efficiency < 70 ? 'Critical' : efficiency < 85 ? 'Warning' : 'Operational',
              0,
              8
            )
          }).addTo(markersLayer);
          
          // Add popup with site info
          marker.bindPopup(`
            <div>
              <h3 class="font-bold">${site.name}</h3>
              <p><strong>Type:</strong> ${site.type}</p>
              <p><strong>Status:</strong> ${site.status}</p>
              <p><strong>Efficiency:</strong> ${efficiency.toFixed(1)}%</p>
              <p><strong>Energy Consumption:</strong> ${latestData.consumption.toFixed(2)} kWh</p>
              ${isAnomalyMode && efficiency < 75 ? 
                '<p class="text-red-500 font-bold">POTENTIAL DAMAGE DETECTED</p>' : ''}
            </div>
          `);
        } else {
          // Standard marker
          const marker = L.marker([site.location.lat, site.location.lng], {
            icon: createCustomIcon(
              efficiency < 70 ? 'Critical' : efficiency < 85 ? 'Warning' : 'Operational',
              0,
              10
            )
          }).addTo(markersLayer);
          
          // Add popup with site info
          marker.bindPopup(`
            <div>
              <h3 class="font-bold">${site.name}</h3>
              <p><strong>Type:</strong> ${site.type}</p>
              <p><strong>Status:</strong> ${site.status}</p>
              <p><strong>Efficiency:</strong> ${efficiency.toFixed(1)}%</p>
              <p><strong>Energy Consumption:</strong> ${latestData.consumption.toFixed(2)} kWh</p>
              ${isAnomalyMode && efficiency < 75 ? 
                '<p class="text-red-500 font-bold">POTENTIAL DAMAGE DETECTED</p>' : ''}
            </div>
          `);
        }
      });
    }
  }, [leafletMap, markersLayer, circlesLayer, sites, isAnomalyMode, showMachineParts, showPowerIssues, show3DView]);
  
  // Helper function to visualize machine parts with animations
  const visualizeMachineParts = () => {
    if (!markersLayer || !circlesLayer) return;
    
    // Clear existing markers
    markersLayer.clearLayers();
    circlesLayer.clearLayers();
    
    sites.forEach(site => {
      if (!site.equipment) return;
      
      // Find problematic equipment
      const criticalEquipment = site.equipment.filter(eq => 
        eq.status === 'Critical' || eq.status === 'Warning'
      );
      
      if (criticalEquipment.length > 0) {
        // Add animated ripple effect around the site to indicate problematic area
        const rippleCircle = L.circle([site.location.lat, site.location.lng], {
          radius: 200, // 200 meters radius
          color: '#F87272',
          fillColor: '#F87272',
          fillOpacity: 0.1,
          weight: 2,
          className: 'ripple-circle'
        }).addTo(circlesLayer);
        
        // Add connection lines between equipment parts
        if (criticalEquipment.length > 1) {
          for (let i = 0; i < criticalEquipment.length - 1; i++) {
            const angle1 = (i / criticalEquipment.length) * Math.PI * 2;
            const offsetDistance1 = 0.0005;
            const offsetLat1 = site.location.lat + Math.sin(angle1) * offsetDistance1;
            const offsetLng1 = site.location.lng + Math.cos(angle1) * offsetDistance1;
            
            for (let j = i + 1; j < criticalEquipment.length; j++) {
              const angle2 = (j / criticalEquipment.length) * Math.PI * 2;
              const offsetDistance2 = 0.0005;
              const offsetLat2 = site.location.lat + Math.sin(angle2) * offsetDistance2;
              const offsetLng2 = site.location.lng + Math.cos(angle2) * offsetDistance2;
              
              if (criticalEquipment[i].status === 'Critical' && criticalEquipment[j].status === 'Critical') {
                // Animated flow line for critical connections
                L.polyline([[offsetLat1, offsetLng1], [offsetLat2, offsetLng2]], {
                  color: '#F87272',
                  weight: 1.5,
                  opacity: 0.6,
                  dashArray: '5, 10',
                  className: 'flow-line critical-flow'
                }).addTo(circlesLayer);
              } else {
                // Normal connection for warnings
                L.polyline([[offsetLat1, offsetLng1], [offsetLat2, offsetLng2]], {
                  color: '#FBBD23',
                  weight: 1,
                  opacity: 0.4,
                  dashArray: '3, 7',
                  className: 'flow-line warning-flow'
                }).addTo(circlesLayer);
              }
            }
          }
        }
        
        // Add radar sweep effect for critical sites
        if (criticalEquipment.filter(e => e.status === 'Critical').length > 0) {
          const radar = L.divIcon({
            html: '<div class="radar-sweep"></div>',
            className: 'radar-icon',
            iconSize: [300, 300],
            iconAnchor: [150, 150]
          });
          
          L.marker([site.location.lat, site.location.lng], {
            icon: radar,
            zIndexOffset: -1000
          }).addTo(circlesLayer);
        }
        
        // Add markers for each problematic equipment part with animation
        criticalEquipment.forEach((equipment, index) => {
          // Calculate position offset to avoid overlap
          const angle = (index / criticalEquipment.length) * Math.PI * 2;
          const offsetDistance = 0.0005;
          const offsetLat = site.location.lat + Math.sin(angle) * offsetDistance;
          const offsetLng = site.location.lng + Math.cos(angle) * offsetDistance;
          
          // Calculate marker size based on temperature and efficiency
          const heatValue = (equipment.temperature / 100) * (100 - equipment.energyEfficiency) / 100;
          const markerSize = equipment.status === 'Critical' ? 12 + (heatValue * 5) : 8 + (heatValue * 3);
          
          // Create custom icon with status-based class for styling
          const statusClass = equipment.status === 'Critical' ? 'critical-marker' : 'warning-marker';
          const customIcon = createCustomIcon(equipment.status, equipment.temperature, markerSize);
          
          // Update icon options to include class
          customIcon.options.className = statusClass;
          
          // Create marker with data attributes for zoom animations
          const marker = L.marker([offsetLat, offsetLng], {
            icon: customIcon,
            riseOnHover: true,
            title: equipment.name,
            alt: `${equipment.name} - ${equipment.status}`
          });
          
          // Set data attribute for base size
          marker.on('add', (e) => {
            const iconElement = e.target._icon;
            if (iconElement) {
              iconElement.dataset.baseSize = '1';
            }
          });
          
          // Add interactive effects when hovering
          marker.on('mouseover', (e) => {
            const iconElement = e.target._icon;
            if (iconElement) {
              iconElement.classList.add('marker-hover');
              
              // Create temporary connection lines to other equipment
              criticalEquipment.forEach((otherEquip, otherIndex) => {
                if (index !== otherIndex) {
                  const otherAngle = (otherIndex / criticalEquipment.length) * Math.PI * 2;
                  const otherLat = site.location.lat + Math.sin(otherAngle) * offsetDistance;
                  const otherLng = site.location.lng + Math.cos(otherAngle) * offsetDistance;
                  
                  const tempLine = L.polyline([[offsetLat, offsetLng], [otherLat, otherLng]], {
                    color: equipment.status === 'Critical' ? '#F87272' : '#FBBD23',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '3, 3',
                    className: 'temp-connection'
                  }).addTo(circlesLayer);
                  
                  // Store the line to remove on mouseout
                  if (!e.target._tempLines) e.target._tempLines = [];
                  e.target._tempLines.push(tempLine);
                }
              });
            }
          });
          
          marker.on('mouseout', (e) => {
            const iconElement = e.target._icon;
            if (iconElement) {
              iconElement.classList.remove('marker-hover');
              
              // Remove temporary connection lines
              if (e.target._tempLines) {
                e.target._tempLines.forEach((line: any) => {
                  circlesLayer.removeLayer(line);
                });
                e.target._tempLines = [];
              }
            }
          });
          
          // Add vibration animation for critical equipment with high vibration
          if (equipment.status === 'Critical' && equipment.vibration > 60) {
            marker.on('add', (e) => {
              const iconElement = e.target._icon;
              if (iconElement) {
                iconElement.classList.add('vibrating-marker');
                // Adjust vibration intensity based on value
                iconElement.style.setProperty('--vibration-intensity', `${equipment.vibration / 100 * 3}px`);
              }
            });
          }
          
          // Add detailed popup with equipment information and animations
          marker.bindPopup(`
            <div class="p-3 max-w-md equipment-popup">
              <h3 class="font-bold text-lg animated-title">${equipment.name}</h3>
              <div class="flex items-center gap-2 my-1">
                <span class="font-medium">Status:</span>
                <span class="px-2 py-1 rounded text-white bg-${equipment.status === 'Critical' ? 'red-600' : 'orange-500'} status-badge">${equipment.status}</span>
              </div>
              
              <div class="grid grid-cols-2 gap-3 my-3">
                <div>
                  <div class="font-medium">Efficiency</div>
                  <div class="text-xl stats-value" style="color: ${equipment.energyEfficiency < 70 ? '#F87272' : equipment.energyEfficiency < 85 ? '#FBBD23' : '#36D399'}">
                    <span class="counter-animation" data-value="${equipment.energyEfficiency.toFixed(1)}">0</span>%
                  </div>
                  <div class="text-sm text-gray-600">
                    ${equipment.energyEfficiency < 70 ? 'Critical - Requires replacement' : 
                      equipment.energyEfficiency < 85 ? 'Warning - Monitor closely' : 'Good'}
                  </div>
                </div>
                
                <div>
                  <div class="font-medium">Temperature</div>
                  <div class="text-xl stats-value" style="color: ${equipment.temperature > 80 ? '#F87272' : equipment.temperature > 60 ? '#FBBD23' : '#36D399'}">
                    <span class="counter-animation" data-value="${equipment.temperature.toFixed(1)}">0</span>°C
                    ${equipment.temperature > 80 ? '<span class="temperature-icon">🔥</span>' : 
                      equipment.temperature > 70 ? '<span class="temperature-icon">♨️</span>' : ''}
                  </div>
                  <div class="text-sm text-gray-600">
                    ${equipment.temperature > 80 ? 'Overheating - Critical' : 
                      equipment.temperature > 60 ? 'High temperature' : 'Normal'}
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 my-3">
                <div>
                  <div class="font-medium">Vibration</div>
                  <div class="text-xl stats-value" style="color: ${equipment.vibration > 70 ? '#F87272' : equipment.vibration > 40 ? '#FBBD23' : '#36D399'}">
                    <span class="counter-animation" data-value="${equipment.vibration.toFixed(1)}">0</span>
                    ${equipment.vibration > 70 ? '<span class="vibration-icon">📳</span>' : ''}
                  </div>
                  <div class="text-sm text-gray-600">
                    ${equipment.vibration > 70 ? 'Excessive vibration' : 
                      equipment.vibration > 40 ? 'Above normal' : 'Normal'}
                  </div>
                </div>
                
                <div>
                  <div class="font-medium">Last Maintenance</div>
                  <div class="text-md">
                    ${new Date(equipment.lastMaintenance).toLocaleDateString()}
                  </div>
                  <div class="text-sm text-gray-600">
                    ${equipment.maintenanceDue ? '<span class="maintenance-due">Maintenance overdue</span>' : 'On schedule'}
                  </div>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t border-gray-200">
                <div class="font-medium mb-1">Diagnostic Analysis:</div>
                <ul class="diagnostic-list">
                  ${equipment.status === 'Critical' ? `
                    <li class="diagnostic-item critical" style="--delay: 0.1s">Excess energy consumption: +${((100 - equipment.energyEfficiency) * 2).toFixed(1)}%</li>
                    <li class="diagnostic-item critical" style="--delay: 0.2s">Potential mechanical failure detected</li>
                    <li class="diagnostic-item critical" style="--delay: 0.3s">Recommend immediate replacement</li>
                  ` : `
                    <li class="diagnostic-item warning" style="--delay: 0.1s">Performance degradation detected</li>
                    <li class="diagnostic-item warning" style="--delay: 0.2s">Scheduled maintenance advised</li>
                  `}
                  ${equipment.temperature > 80 ? `
                    <li class="diagnostic-item critical" style="--delay: 0.4s">Excessive heat generation may damage surrounding components</li>
                  ` : ''}
                  ${equipment.vibration > 70 ? `
                    <li class="diagnostic-item critical" style="--delay: 0.5s">Abnormal vibration may indicate misalignment or loose components</li>
                  ` : ''}
                </ul>
                <div class="gauge-container mt-3">
                  <div class="gauge" style="--percentage: ${equipment.energyEfficiency}%; --color: ${equipment.energyEfficiency < 70 ? '#F87272' : equipment.energyEfficiency < 85 ? '#FBBD23' : '#36D399'}">
                    <div class="gauge-fill"></div>
                  </div>
                  <div class="text-center text-sm mt-1">Health Index</div>
                </div>
              </div>
            </div>
          `, { 
            maxWidth: 320,
            className: 'interactive-popup',
            closeButton: true
          });
          
          // Add popup open event for animations
          marker.on('popupopen', (e) => {
            setTimeout(() => {
              // Get popup content
              const popup = e.popup;
              const container = popup.getElement();
              if (!container) return;
              
              // Animate counters
              const counters = container.querySelectorAll('.counter-animation');
              counters.forEach((counter: any) => {
                const target = parseFloat(counter.dataset.value);
                const duration = 1000;
                const step = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                  if (current < target) {
                    current = Math.min(current + step, target);
                    counter.textContent = current.toFixed(1);
                    requestAnimationFrame(updateCounter);
                  }
                };
                
                updateCounter();
              });
            }, 100);
          });
          
          // Add pulsing effect for critical components
          if (equipment.status === 'Critical') {
            const pulseCircle = L.circle([offsetLat, offsetLng], {
              radius: 20,
              color: '#F87272',
              fillColor: '#F87272',
              fillOpacity: 0.5,
              weight: 1,
              className: 'pulse-circle'
            }).addTo(circlesLayer);
          }
          
          // Add the marker to the cluster group
          markersLayer.addLayer(marker);
        });
      }
    });
  };
  
  // Helper function to visualize power issues with animations
  const visualizePowerIssues = () => {
    if (!markersLayer || !circlesLayer) return;
    
    // Clear existing markers
    markersLayer.clearLayers();
    circlesLayer.clearLayers();
    
    // Track all power lines for global visualization
    const powerLines: Array<{from: [number, number], to: [number, number], type: string}> = [];
    
    sites.forEach(site => {
      if (!site.equipment) return;
      
      // Check for power issues based on equipment status
      const criticalCount = site.equipment.filter(eq => eq.status === 'Critical').length;
      const offlineCount = site.equipment.filter(eq => eq.status === 'Offline').length;
      const avgEfficiency = site.equipment.reduce((sum, eq) => sum + eq.energyEfficiency, 0) / site.equipment.length;
      
      // Determine if there's a power issue and what type
      let hasPowerIssue = false;
      let issueType = '';
      let circleColor = '';
      
      if (offlineCount > 0) {
        hasPowerIssue = true;
        issueType = 'No Power';
        circleColor = '#FBBD23'; // Yellow
      } else if (avgEfficiency < 60) {
        hasPowerIssue = true;
        issueType = 'High Voltage';
        circleColor = '#F87272'; // Red
      } else if (criticalCount > 1) {
        hasPowerIssue = true;
        issueType = 'Unstable Power';
        circleColor = '#FF9551'; // Orange
      }
      
      if (hasPowerIssue) {
        // Find nearby sites for power line visualizations
        const otherSites = sites.filter(s => s.id !== site.id);
        
        // Add marker for power issue with animated icon
        const marker = L.marker([site.location.lat, site.location.lng], {
          icon: createPowerIssueIcon(issueType),
          riseOnHover: true
        });
        
        // Add interactive hover behavior
        marker.on('mouseover', () => {
          // Highlight connected power lines
          circlesLayer.eachLayer((layer: any) => {
            if (layer._latlngs && 
               ((layer._latlngs[0].lat === site.location.lat && layer._latlngs[0].lng === site.location.lng) || 
               (layer._latlngs[1].lat === site.location.lat && layer._latlngs[1].lng === site.location.lng))) {
              layer.setStyle({ weight: 4, opacity: 0.9 });
            }
          });
        });
        
        marker.on('mouseout', () => {
          // Reset power line styles
          circlesLayer.eachLayer((layer: any) => {
            if (layer._latlngs) {
              const originalStyle = layer.options.originalStyle || { weight: 3, opacity: 0.8 };
              layer.setStyle(originalStyle);
            }
          });
        });
        
        // Add popup with issue details and animations
        marker.bindPopup(`
          <div class="p-2 power-issue-popup">
            <h3 class="font-bold text-lg animated-title">${site.name}</h3>
            <div class="issue-badge" style="background-color: ${circleColor}">
              <span class="issue-icon">${issueType === 'No Power' ? '⚡' : issueType === 'High Voltage' ? '⚠️' : '↕️'}</span>
              <span class="issue-text">${issueType}</span>
            </div>
            <p><strong>Status:</strong> <span class="critical-status">Critical</span></p>
            ${issueType === 'No Power' ? 
              '<p><strong>Cause:</strong> <span class="cause-description">Likely broken power lines after disaster</span></p>' : 
              issueType === 'High Voltage' ?
              '<p><strong>Cause:</strong> <span class="cause-description">Voltage surge possibly damaging equipment</span></p>' :
              '<p><strong>Cause:</strong> <span class="cause-description">Fluctuating power levels detected</span></p>'
            }
            
            <div class="mt-3">
              <div class="font-medium mb-1">Impact Analysis:</div>
              <div class="impact-meter" style="--impact-color: ${circleColor}; --impact-level: ${issueType === 'High Voltage' ? '90%' : issueType === 'No Power' ? '100%' : '75%'}">
                <div class="impact-fill"></div>
                <div class="impact-label">${issueType === 'High Voltage' ? 'Severe' : issueType === 'No Power' ? 'Critical' : 'Moderate'}</div>
              </div>
            </div>
            
            <p class="mt-2 font-bold">Actions Required:</p>
            <ul class="action-list">
              ${issueType === 'No Power' ? 
                '<li class="action-item" style="--delay: 0.1s">Request emergency power supply</li><li class="action-item" style="--delay: 0.2s">Investigate broken connections</li><li class="action-item" style="--delay: 0.3s">Deploy backup generators</li>' : 
                issueType === 'High Voltage' ?
                '<li class="action-item" style="--delay: 0.1s">Reduce input voltage</li><li class="action-item" style="--delay: 0.2s">Check circuit breakers</li><li class="action-item" style="--delay: 0.3s">Install surge protectors</li>' :
                '<li class="action-item" style="--delay: 0.1s">Stabilize power supply</li><li class="action-item" style="--delay: 0.2s">Install surge protectors</li><li class="action-item" style="--delay: 0.3s">Monitor equipment performance</li>'
              }
            </ul>
            
            <div class="pulse-warning mt-3">
              <span class="pulse-dot"></span>
              <p style="color: #F87272">Report to energy grid operator immediately</p>
            </div>
            
            <div class="estimated-time mt-2">
              <div class="time-icon">⏱️</div>
              <div class="time-details">
                <div class="time-label">Est. Resolution Time:</div>
                <div class="time-value">${issueType === 'No Power' ? '4-6 hours' : issueType === 'High Voltage' ? '2-3 hours' : '1-2 hours'}</div>
              </div>
            </div>
          </div>
        `, { 
          maxWidth: 300,
          className: 'power-issue-popup-container'
        });
        
        // Add affected area circle with animation
        const radius = issueType === 'No Power' ? 500 : 300;
        const impactCircle = L.circle([site.location.lat, site.location.lng], {
          radius: radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.2,
          weight: 2,
          className: issueType === 'No Power' ? 'pulse-circle slow' : issueType === 'High Voltage' ? 'power-surge-circle' : 'flicker-circle'
        }).addTo(circlesLayer);
        
        // Add interactive behavior to the circle
        impactCircle.on('click', (e) => {
          marker.openPopup();
        });
        
        // Add to the markers cluster
        markersLayer.addLayer(marker);
        
        // Add power line visualization for "No Power" issues
        if (issueType === 'No Power') {
          // Find nearest other site
          let closestSite = otherSites[0];
          let minDistance = Number.MAX_VALUE;
          
          otherSites.forEach(otherSite => {
            const distance = Math.sqrt(
              Math.pow(site.location.lat - otherSite.location.lat, 2) + 
              Math.pow(site.location.lng - otherSite.location.lng, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closestSite = otherSite;
            }
          });
          
          // Calculate midpoint for "broken" indicator
          const midLat = (site.location.lat + closestSite.location.lat) / 2;
          const midLng = (site.location.lng + closestSite.location.lng) / 2;
          
          // Draw first half of the "power line" with animated dash
          const line1 = L.polyline([
            [site.location.lat, site.location.lng],
            [midLat - 0.0005, midLng - 0.0005]
          ], {
            color: '#FBBD23',
            weight: 3,
            dashArray: '5, 10',
            opacity: 0.8,
            className: 'power-line-animated',
            // Store original style for hover effect
            originalStyle: {
              weight: 3,
              opacity: 0.8
            }
          } as L.ExtendedPolylineOptions).addTo(circlesLayer);
          
          // Draw second half of the "power line" with animated dash
          const line2 = L.polyline([
            [midLat + 0.0005, midLng + 0.0005],
            [closestSite.location.lat, closestSite.location.lng]
          ], {
            color: '#FBBD23',
            weight: 3,
            dashArray: '5, 10',
            opacity: 0.8,
            className: 'power-line-animated reverse',
            // Store original style for hover effect
            originalStyle: {
              weight: 3,
              opacity: 0.8
            }
          } as L.ExtendedPolylineOptions).addTo(circlesLayer);
          
          // Store power line data for grid visualization
          powerLines.push({
            from: [site.location.lat, site.location.lng],
            to: [closestSite.location.lat, closestSite.location.lng],
            type: 'broken'
          });
          
          // Add lightning bolt marker at the break point with animation
          const breakMarker = L.marker([midLat, midLng], {
            icon: L.divIcon({
              html: '<div class="break-marker"><span class="lightning">⚡</span></div>',
              className: 'break-icon',
              iconSize: [30, 30]
            })
          }).addTo(markersLayer);
          
          // Add interactive tooltip with details
          breakMarker.bindTooltip("Power line break detected", {
            permanent: false,
            direction: 'top',
            className: 'break-tooltip'
          });
          
          // Make break point interactive
          breakMarker.on('click', () => {
            if (!leafletMap) return;
            
            // Create a popup manually instead of using openPopup
            const popupContent = `
              <div class="break-details">
                <h4>Power Line Break</h4>
                <p>Connection between ${site.name} and ${closestSite.name} is damaged</p>
                <div class="break-status">
                  <span class="status-dot"></span> Requires immediate repair
                </div>
                <div class="repair-estimate">
                  <strong>Est. repair time:</strong> 2-4 hours
                </div>
              </div>
            `;
            
            // Create a popup manually
            const popup = L.popup({ className: 'break-popup' })
              .setLatLng([midLat, midLng])
              .setContent(popupContent)
              .openOn(leafletMap);
          });
        } else if (issueType === 'High Voltage') {
          // Add animated voltage surges along power lines
          otherSites.forEach((otherSite, idx) => {
            if (idx < 2) { // Limit to 2 connections for clarity
              // Create power line with surge animation
              const line = L.polyline([
                [site.location.lat, site.location.lng],
                [otherSite.location.lat, otherSite.location.lng]
              ], {
                color: '#F87272',
                weight: 2,
                opacity: 0.7,
                className: 'voltage-surge-line',
                // Store original style for hover effect
                originalStyle: {
                  weight: 2,
                  opacity: 0.7
                }
              } as L.ExtendedPolylineOptions).addTo(circlesLayer);
              
              // Add moving particle effect
              for (let i = 0; i < 3; i++) {
                const particle = L.divIcon({
                  html: '<div class="surge-particle"></div>',
                  className: 'particle-container',
                  iconSize: [10, 10]
                });
                
                const particleMarker = L.marker([site.location.lat, site.location.lng], {
                  icon: particle,
                  zIndexOffset: -1000
                }).addTo(circlesLayer);
                
                // Set animation delay
                const particleElement = particleMarker.getElement();
                if (particleElement) {
                  particleElement.style.setProperty('--delay', `${i * 1}s`);
                  particleElement.style.setProperty('--start-lat', `${site.location.lat}`);
                  particleElement.style.setProperty('--start-lng', `${site.location.lng}`);
                  particleElement.style.setProperty('--end-lat', `${otherSite.location.lat}`);
                  particleElement.style.setProperty('--end-lng', `${otherSite.location.lng}`);
                }
              }
              
              // Store for grid visualization
              powerLines.push({
                from: [site.location.lat, site.location.lng],
                to: [otherSite.location.lat, otherSite.location.lng],
                type: 'surge'
              });
            }
          });
        }
      }
    });
    
    // Add power grid visualization
    if (powerLines.length > 0 && leafletMap) {
      // Create a simpler grid legend indicator as a DOM element
      const legendContainer = document.createElement('div');
      legendContainer.className = 'power-grid-legend';
      legendContainer.innerHTML = `
        <h4>Power Grid Status</h4>
        <div class="grid-item">
          <span class="line-sample broken"></span>
          <span>Broken Connection</span>
        </div>
        <div class="grid-item">
          <span class="line-sample surge"></span>
          <span>Voltage Surge</span>
        </div>
        <div class="grid-item">
          <span class="line-sample stable"></span>
          <span>Stable Connection</span>
        </div>
      `;
      
      // Add it to the map container directly
      const mapContainer = leafletMap.getContainer();
      if (mapContainer && !mapContainer.querySelector('.power-grid-legend')) {
        legendContainer.style.position = 'absolute';
        legendContainer.style.bottom = '20px';
        legendContainer.style.left = '20px';
        legendContainer.style.zIndex = '1000';
        mapContainer.appendChild(legendContainer);
        
        // Add a cleanup listener to remove the legend when visualization changes
        const legendCleanup = () => {
          if (!showPowerIssues && mapContainer.contains(legendContainer)) {
            mapContainer.removeChild(legendContainer);
          }
        };
        
        leafletMap.on('overlayadd', legendCleanup);
        leafletMap.on('overlayremove', legendCleanup);
        
        // Store a reference for future cleanup
        // @ts-ignore
        leafletMap._powerGridLegend = legendContainer;
      }
    }
  };
  
  // Add a new method to handle map layer changes
  const changeMapLayer = (layerType: string) => {
    if (!leafletMap) return;
    
    // Remove current tile layer
    leafletMap.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        leafletMap.removeLayer(layer);
      }
    });
    
    // Add new tile layer based on selected type
    let newLayer;
    
    switch (layerType) {
      case 'satellite':
        newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        });
        break;
      case 'topo':
        newLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
        });
        break;
      case 'dark':
        newLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20,
        });
        break;
      default: // 'street'
        newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });
    }
    
    newLayer.addTo(leafletMap);
    setCurrentMapLayer(layerType);
  };
  
  // Update the 3D view toggle functionality
  const toggle3DView = () => {
    if (!mapRef.current || !leafletMap) return;
    
    if (show3DView) {
      // Remove 3D effect - using leafletMap instead of mapRef.current
      if (leafletMap) {
        // Not all maps support these operations, so we'll just log it
        console.log('Disabling 3D view');
        setShow3DView(false);
      }
    } else {
      // Add 3D effect
      if (leafletMap) {
        console.log('Enabling 3D view');
        
        // This would use proper 3D methods for the specific map library
        // For now just set the state to trigger the visualization
        setShow3DView(true);
      }
    }
  };

  // Helper function to generate building polygons
  const generateBuildingPolygon = (lat: number, lng: number) => {
    const size = 0.002; // Size of the building
    return [
      [lng - size, lat - size],
      [lng + size, lat - size],
      [lng + size, lat + size],
      [lng - size, lat + size],
      [lng - size, lat - size]
    ];
  };

  // Function to implement disaster mode with proper typing
  const toggleDisasterMode = () => {
    if (!mapRef.current || !leafletMap) return;
    
    setIsAnomalyMode(!isAnomalyMode);
    
    if (!isAnomalyMode) {
      // Activate disaster mode
      // Simulate equipment failures and power outages
      simulateDisasterImpact();
      
      // Update map visuals
      if (heatmapLayer && heatmapLayer.current) {
        try {
          heatmapLayer.current.setOptions({
            gradient: {
              0.0: 'blue',
              0.3: 'green',
              0.5: 'yellow',
              0.7: 'orange',
              1.0: 'red'
            },
            radius: 30
          });
        } catch (error) {
          console.error('Error updating heatmap for disaster mode:', error);
        }
      }
      
      // Add alert notification
      console.log('⚠️ Disaster mode activated! Equipment failures and power outages simulated.');
    } else {
      // Reset to normal mode
      resetDisasterSimulation();
    }
  };

  // Function to simulate disaster impact without type errors
  const simulateDisasterImpact = () => {
    // Get a copy of the original sites data
    const updatedSites = [...sites];
    
    // For each site, introduce failures
    updatedSites.forEach(site => {
      if (site.equipment) {
        // Make 30-50% of equipment critical
        site.equipment.forEach(equipment => {
          if (Math.random() < 0.4) {
            equipment.status = 'Critical';
            equipment.temperature += Math.random() * 20 + 10;
            equipment.vibration += Math.random() * 30 + 15;
            equipment.energyEfficiency -= Math.random() * 30 + 10;
          }
        });
      }
      
      // Introduce power fluctuations
      if (site.energyData && site.energyData.length > 0) {
        const latestData = site.energyData[site.energyData.length - 1];
        latestData.consumption += Math.random() * 100 + 50;
        
        // Check if voltage property exists before modifying it
        if ('voltage' in latestData) {
          // Use type assertion since we checked the property exists
          const dataWithVoltage = latestData as any;
          dataWithVoltage.voltage = Math.random() < 0.3 
            ? dataWithVoltage.voltage * 1.5 
            : dataWithVoltage.voltage * 0.7;
        }
      }
    });
    
    // Log the simulated disaster
    console.log('Disaster effects simulated on sites');
  };

  // Function to reset disaster simulation
  const resetDisasterSimulation = () => {
    // In a real application, this would restore the site data from backup
    // For this demo, we'll just reset the data
    fetchSiteData();
  };

  // Function to fetch site data (implementation was missing)
  const fetchSiteData = () => {
    // This would normally fetch data from an API
    console.log('Fetching site data...');
    // For now, we'll just reset the disaster simulation effects
    const originalSites = [...sites];
    originalSites.forEach(site => {
      if (site.equipment) {
        site.equipment.forEach(equipment => {
          // Reset equipment status based on efficiency
          const efficiency = equipment.energyEfficiency;
          equipment.status = efficiency < 70 ? 'Critical' : 
                          efficiency < 85 ? 'Warning' : 'Operational';
          
          // Reset temperature and vibration to more normal levels
          if (equipment.temperature > 80) {
            equipment.temperature = Math.max(60, equipment.temperature - 20);
          }
          if (equipment.vibration > 60) {
            equipment.vibration = Math.max(40, equipment.vibration - 20);
          }
        });
      }
      
      // Reset energy data if it exists
      if (site.energyData && site.energyData.length > 0) {
        const latestData = site.energyData[site.energyData.length - 1];
        if (latestData.consumption > 200) {
          latestData.consumption = Math.max(100, latestData.consumption - 100);
        }
        
        // Check if voltage property exists before modifying it
        if ('voltage' in latestData) {
          // Use type assertion since we checked the property exists
          const dataWithVoltage = latestData as any;
          // Reset voltage to normal range around 220V
          dataWithVoltage.voltage = 220 + (Math.random() * 10 - 5);
        }
      }
    });
    
    // Log the operation
    console.log('Site data reset for normal operation');
  };

  // Enhance the heat map visualization
  const enhanceHeatMapVisualization = () => {
    if (!mapRef.current || !heatmapLayer) return;
    
    // Make sure heatmapLayer.current isn't null before accessing it
    if (!heatmapLayer.current) return;
    
    // Get consumption data for all sites
    const points = sites.map(site => {
      const latestData = site.energyData[site.energyData.length - 1];
      return {
        lat: site.location.lat,
        lng: site.location.lng,
        value: latestData.consumption,
        // Additional data
        voltageAnomaly: Math.abs(latestData.voltage - 220) > 20,
        efficiency: latestData.efficiency,
        siteName: site.name,
        siteType: site.type
      };
    });
    
    // Add more granular points around sites with high consumption
    const enhancedPoints = [...points];
    
    points.forEach(point => {
      if (point.value > 200) {
        // For high consumption sites, add more detailed points around
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const distance = 0.003;
          enhancedPoints.push({
            lat: point.lat + Math.sin(angle) * distance,
            lng: point.lng + Math.cos(angle) * distance,
            value: point.value * (0.7 + Math.random() * 0.3), // Slightly vary the values
            voltageAnomaly: point.voltageAnomaly,
            efficiency: point.efficiency,
            siteName: point.siteName,
            siteType: point.siteType
          });
        }
      }
    });
    
    try {
      // Set the enhanced data to the heatmap
      heatmapLayer.current.setData(enhancedPoints);
      
      // Update heatmap appearance
      const heatmap = heatmapLayer.current;
      heatmap.setOptions({
        radius: isAnomalyMode ? 25 : 20,
        maxIntensity: isAnomalyMode ? 500 : 300,
        gradient: isAnomalyMode ? 
          {
            0.0: 'rgba(0, 0, 255, 0)',
            0.1: 'rgba(65, 105, 225, 0.5)',
            0.3: 'rgba(0, 128, 0, 0.7)',
            0.5: 'rgba(255, 255, 0, 0.8)',
            0.7: 'rgba(255, 165, 0, 0.9)',
            1.0: 'rgba(255, 0, 0, 1)'
          } : 
          {
            0.0: 'rgba(0, 0, 255, 0)',
            0.2: 'rgba(0, 255, 255, 0.6)',
            0.4: 'rgba(0, 255, 0, 0.7)',
            0.6: 'rgba(255, 255, 0, 0.8)',
            0.8: 'rgba(255, 128, 0, 0.9)',
            1.0: 'rgba(255, 0, 0, 1)'
          }
      });
    } catch (error) {
      console.error('Error updating heatmap:', error);
    }
  };

  // Connect the toggle functions to the UI controls
  useEffect(() => {
    if (mapRef.current && heatmapLayer && heatmapLayer.current && sites.length > 0) {
      enhanceHeatMapVisualization();
    }
  }, [sites, isAnomalyMode, heatmapLayer]);

  // Update the UI toggle functions
  const handleToggle3DView = () => {
    toggle3DView();
  };

  const handleToggleDisasterMode = () => {
    toggleDisasterMode();
  };

  // Add detailed energy consumption details display
  const addDetailedLegend = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Remove existing legend if any
    const existingLegend = document.querySelector('.energy-consumption-legend');
    if (existingLegend) {
      existingLegend.remove();
    }
    
    // Create legend container
    const legend = document.createElement('div');
    legend.className = 'energy-consumption-legend bg-base-100 p-3 rounded-lg shadow-lg';
    legend.style.position = 'absolute';
    legend.style.bottom = '30px';
    legend.style.left = '10px';
    legend.style.zIndex = '1000';
    legend.style.width = '220px';
    
    // Add legend title
    const title = document.createElement('h4');
    title.textContent = 'Energy Consumption';
    title.className = 'font-semibold mb-2 text-sm';
    legend.appendChild(title);
    
    // Create gradient display
    const gradientContainer = document.createElement('div');
    gradientContainer.style.height = '20px';
    gradientContainer.style.width = '100%';
    gradientContainer.style.background = 'linear-gradient(to right, blue, cyan, green, yellow, orange, red)';
    gradientContainer.style.borderRadius = '4px';
    gradientContainer.style.marginBottom = '5px';
    legend.appendChild(gradientContainer);
    
    // Add labels
    const labels = document.createElement('div');
    labels.className = 'flex justify-between text-xs mt-1';
    labels.innerHTML = `
      <span>Low</span>
      <span>Medium</span>
      <span>High</span>
    `;
    legend.appendChild(labels);
    
    // Add detailed consumption ranges
    const ranges = document.createElement('div');
    ranges.className = 'mt-3 text-xs';
    ranges.innerHTML = `
      <div class="flex justify-between items-center mb-1">
        <span class="w-3 h-3 rounded-full" style="background: blue;"></span>
        <span>0-50 kWh (Optimal)</span>
      </div>
      <div class="flex justify-between items-center mb-1">
        <span class="w-3 h-3 rounded-full" style="background: green;"></span>
        <span>50-150 kWh (Normal)</span>
      </div>
      <div class="flex justify-between items-center mb-1">
        <span class="w-3 h-3 rounded-full" style="background: yellow;"></span>
        <span>150-250 kWh (High)</span>
      </div>
      <div class="flex justify-between items-center mb-1">
        <span class="w-3 h-3 rounded-full" style="background: orange;"></span>
        <span>250-350 kWh (Very High)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="w-3 h-3 rounded-full" style="background: red;"></span>
        <span>350+ kWh (Critical)</span>
      </div>
    `;
    legend.appendChild(ranges);
    
    // Add total consumption info
    if (sites.length > 0) {
      const totalConsumption = sites.reduce((sum, site) => {
        const latestData = site.energyData[site.energyData.length - 1];
        return sum + latestData.consumption;
      }, 0);
      
      const totalInfo = document.createElement('div');
      totalInfo.className = 'mt-3 pt-2 border-t border-base-300 text-xs';
      totalInfo.innerHTML = `
        <div class="font-semibold">Total Consumption:</div>
        <div class="text-primary text-sm font-medium">${totalConsumption.toFixed(2)} kWh</div>
        <div class="text-xs mt-1 text-base-content/70">Across ${sites.length} sites</div>
      `;
      legend.appendChild(totalInfo);
    }
    
    // If in disaster mode, show extra info
    if (isAnomalyMode) {
      const disasterInfo = document.createElement('div');
      disasterInfo.className = 'mt-3 pt-2 border-t border-base-300 text-xs';
      
      // Count anomalies
      const anomalySites = sites.filter(site => {
        const equipment = site.equipment || [];
        return equipment.some(eq => eq.status === 'Critical');
      }).length;
      
      disasterInfo.innerHTML = `
        <div class="font-semibold text-error">Disaster Impact:</div>
        <div class="flex justify-between mt-1">
          <span>Affected Sites:</span>
          <span class="font-medium">${anomalySites} sites</span>
        </div>
        <div class="flex justify-between">
          <span>Power Anomalies:</span>
          <span class="font-medium">${Math.floor(anomalySites * 1.5)} detected</span>
        </div>
        <div class="flex justify-between">
          <span>Est. Recovery Time:</span>
          <span class="font-medium">${anomalySites * 2}h</span>
        </div>
      `;
      legend.appendChild(disasterInfo);
    }
    
    // Add to map
    document.querySelector('#map')?.appendChild(legend);
  };

  // Call this function when map is loaded and when toggles change
  useEffect(() => {
    if (mapRef.current) {
      addDetailedLegend();
    }
  }, [mapRef.current, sites, isAnomalyMode]);

  // Add more detailed information to the popups for sites
  const createDetailedPopupContent = (site: any) => {
    const latestData = site.energyData[site.energyData.length - 1];
    
    // Calculate energy metrics
    const efficiency = latestData.efficiency || 85;
    
    // Safely handle voltage property that might not exist in the type
    const voltage = ('voltage' in latestData) ? (latestData as any).voltage : 220;
    
    const consumption = latestData.consumption;
    const renewable = latestData.renewable || 0;
    const lossPercentage = 100 - efficiency;
    
    // Calculate energy loss in kWh
    const energyLoss = (consumption * lossPercentage / 100).toFixed(2);
    
    // Determine status colors
    const efficiencyColor = 
      efficiency > 90 ? 'text-success' :
      efficiency > 75 ? 'text-warning' :
      'text-error';
      
    const voltageColor =
      Math.abs(voltage - 220) < 10 ? 'text-success' :
      Math.abs(voltage - 220) < 20 ? 'text-warning' :
      'text-error';
      
    const consumptionColor =
      consumption < 100 ? 'text-success' :
      consumption < 250 ? 'text-warning' :
      'text-error';
    
    // Create popup content
    return `
      <div class="site-popup p-2">
        <div class="font-bold text-lg mb-1">${site.name}</div>
        <div class="text-sm text-base-content/70 mb-3">${site.type} | ${site.location.address}</div>
        
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div class="font-medium text-xs">Consumption</div>
            <div class="text-lg ${consumptionColor} font-semibold">${consumption.toFixed(2)} kWh</div>
          </div>
          
          <div>
            <div class="font-medium text-xs">Efficiency</div>
            <div class="text-lg ${efficiencyColor} font-semibold">${efficiency}%</div>
          </div>
          
          <div>
            <div class="font-medium text-xs">Voltage</div>
            <div class="text-lg ${voltageColor} font-semibold">${voltage}V</div>
          </div>
          
          <div>
            <div class="font-medium text-xs">Renewable %</div>
            <div class="text-lg text-success font-semibold">${renewable}%</div>
          </div>
        </div>
        
        ${isAnomalyMode ? `
          <div class="bg-error/10 p-2 rounded-lg mb-3">
            <div class="font-medium text-sm text-error">Disaster Impact Assessment</div>
            <div class="text-xs mt-1">Energy Loss: ${energyLoss} kWh (${lossPercentage}%)</div>
            <div class="text-xs">Estimated Recovery: ${Math.floor(lossPercentage / 5)}h</div>
            ${Math.random() > 0.5 ? '<div class="text-xs font-medium text-error mt-1">⚠️ Critical power fluctuation detected</div>' : ''}
          </div>
        ` : ''}
        
        <div class="text-xs text-base-content/70 pt-2 border-t border-base-300">
          <div>Last Updated: ${new Date().toLocaleTimeString()}</div>
          <div>Site ID: ${site.id.substring(0, 8)}...</div>
        </div>
      </div>
    `;
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg relative">
        <div id="map" className="w-full h-full z-10" ref={mapRef}></div>
        
        {/* Map controls panel */}
        <div className="absolute top-4 right-4 bg-base-100 p-3 rounded shadow-md z-[500]">
          <div className="flex flex-col gap-2">
            <button 
              className={`btn btn-sm ${currentMapLayer === 'street' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => changeMapLayer('street')}
            >
              Street
            </button>
            <button 
              className={`btn btn-sm ${currentMapLayer === 'satellite' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => changeMapLayer('satellite')}
            >
              Satellite
            </button>
            <button 
              className={`btn btn-sm ${currentMapLayer === 'topo' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => changeMapLayer('topo')}
            >
              Topographic
            </button>
            <button 
              className={`btn btn-sm ${currentMapLayer === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => changeMapLayer('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
      
      {/* Controls panel */}
      <div className="mt-4 p-4 bg-base-100 rounded-lg shadow-md">
        <div className="flex justify-between items-center flex-wrap">
          <h3 className="text-xl font-bold">Energy Consumption Heat Map</h3>
          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2 text-xs sm:text-sm">Machine Parts</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={showMachineParts}
                  onChange={() => {
                    setShowMachineParts(!showMachineParts);
                    if (!showMachineParts) {
                      setShowPowerIssues(false);
                      setShow3DView(false);
                    }
                  }}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2 text-xs sm:text-sm">Power Issues</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-warning" 
                  checked={showPowerIssues}
                  onChange={() => {
                    setShowPowerIssues(!showPowerIssues);
                    if (!showPowerIssues) {
                      setShowMachineParts(false);
                      setShow3DView(false);
                    }
                  }}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2 text-xs sm:text-sm">3D View</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-info" 
                  checked={show3DView}
                  onChange={handleToggle3DView}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2 text-xs sm:text-sm">Disaster Mode</span> 
                <input 
                  type="checkbox" 
                  className="toggle toggle-error" 
                  checked={isAnomalyMode}
                  onChange={handleToggleDisasterMode}
                />
              </label>
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-base-content/70">
          {showMachineParts 
            ? "Visualizing faulty machine parts. Red markers indicate critical components requiring immediate replacement."
            : showPowerIssues
              ? "Displaying power supply issues. Yellow areas indicate no power (broken wires), red areas show high voltage problems."
              : show3DView
                ? "3D visualization of energy consumption. Taller pillars indicate higher energy usage."
                : isAnomalyMode 
                  ? "Highlighting potential equipment damage and energy anomalies. Red areas indicate possible issues requiring immediate attention."
                  : "Showing normal energy consumption patterns across all sites. Higher intensity indicates greater energy usage."}
        </p>
        
        <div className="mt-4 flex items-center">
          <div className="h-4 w-48 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
          <span className="ml-2">Low to High Energy Consumption</span>
        </div>
        
        {showPowerIssues && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-yellow-500 rounded-full mr-2"></div>
              <span>No Power (Broken Wires)</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
              <span>High Voltage Issues</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-orange-500 rounded-full mr-2"></div>
              <span>Unstable Power</span>
            </div>
          </div>
        )}
        
        {/* Feature highlight section */}
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Map Features:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-base-200 p-2 rounded">
              <span className="font-medium">🔍 Multiple Map Views</span>
              <p className="text-xs mt-1">Switch between street, satellite, topographic, and dark mode views</p>
            </div>
            <div className="bg-base-200 p-2 rounded">
              <span className="font-medium">📊 Heat Map Visualization</span>
              <p className="text-xs mt-1">View energy consumption intensity across regions</p>
            </div>
            <div className="bg-base-200 p-2 rounded">
              <span className="font-medium">⚡ Power Issue Detection</span>
              <p className="text-xs mt-1">Identify areas with power outages or high voltage issues</p>
            </div>
            <div className="bg-base-200 p-2 rounded">
              <span className="font-medium">🔧 Machine Part Analysis</span>
              <p className="text-xs mt-1">Locate faulty equipment and get detailed diagnostics</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Styles for the pulsing effect */}
      <style>
        {`
          .pulse-circle {
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% {
              opacity: 0.7;
              transform: scale(0.8);
            }
            50% {
              opacity: 0.3;
              transform: scale(1.2);
            }
            100% {
              opacity: 0.7;
              transform: scale(0.8);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HeatMap; 