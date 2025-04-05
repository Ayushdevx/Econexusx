import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { faker } from '@faker-js/faker';

// Types
interface EnergyData {
  id: string;
  timestamp: number;
  consumption: number;
  renewable: number;
  grid: number;
  cost: number;
  savings: number;
  efficiency: number;
}

// Extended type for equipment health
interface EquipmentHealth {
  id: string;
  name: string;
  status: 'Operational' | 'Warning' | 'Critical' | 'Offline';
  temperature: number; // in Celsius
  lastMaintenance: number; // timestamp
  maintenanceDue: boolean;
  anomalyDetected: boolean;
  energyEfficiency: number; // percentage
  vibration: number; // normalized 0-100
}

interface Site {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: 'Cell Tower' | 'Data Center' | 'Office' | 'Switching Center' | 'Manufacturing Plant' | 'Electronics Factory' | 'Textile Mill' | 'Chemical Plant' | 'Automotive Factory' | 'Distribution Center' | 'Power Substation' | 'Processing Unit';
  status: 'Online' | 'Offline' | 'Maintenance';
  energyData: EnergyData[];
  equipment?: EquipmentHealth[]; // Equipment health data
  lastDisasterCheck?: number; // Timestamp of last disaster/anomaly check
  disasterRiskScore?: number; // 0-100, higher means more at risk
}

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  energyAmount: number;
  renewable: boolean;
  timeLeft: number;
  reliability: number;
  optimizationMethod: string;
}

interface DataState {
  sites: Site[];
  marketplaceItems: MarketplaceItem[];
  isLoading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  fetchMarketplaceItems: () => Promise<void>;
  addSite: (site: Omit<Site, 'id' | 'energyData'>) => Promise<void>;
  updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  purchaseMarketplaceItem: (id: string) => Promise<void>;
  runDisasterAnalysis: () => Promise<void>; // New function to simulate disaster analysis
}

// Helper to generate mock data
const generateMockSites = (count: number): Site[] => {
  // Chennai area neighborhoods and nearby areas
  const chennaiAreas = [
    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
    { name: 'Anna Nagar', lat: 13.0891, lng: 80.2158 },
    { name: 'Mylapore', lat: 13.0342, lng: 80.2698 },
    { name: 'Velachery', lat: 12.9815, lng: 80.2176 },
    { name: 'Besant Nagar', lat: 12.9977, lng: 80.2646 },
    { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
    { name: 'Nungambakkam', lat: 13.0569, lng: 80.2425 },
    { name: 'Porur', lat: 13.0376, lng: 80.1570 },
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
    { name: 'Chromepet', lat: 12.9516, lng: 80.1462 },
    { name: 'Royapettah', lat: 13.0509, lng: 80.2598 }
  ];
  
  const chennaiFactories = [
    'Chennai Petrochemical',
    'Tamil Nadu Electronics',
    'Marina Industrial Park',
    'Ambattur Manufacturing',
    'Integral Machinery',
    'Coromandel Steel Works',
    'Madras Rubber Factory',
    'Bay Area Textiles',
    'South Indian Pharmaceuticals',
    'Chennai Heavy Engineering',
    'Tondiarpet Power Station',
    'Ennore Metal Works'
  ];
  
  const streetNames = [
    'Gandhi Road',
    'Nehru Avenue',
    'Mount Road',
    'Poonamallee High Road',
    'Cathedral Road',
    'Anna Salai',
    'Sardar Patel Road',
    'GST Road',
    'ECR',
    'OMR',
    'Rajiv Gandhi Salai',
    'Velachery Main Road'
  ];

  return Array.from({ length: count }, (_, i) => {
    // Select a random area in Chennai
    const areaIndex = i % chennaiAreas.length;
    const { name: areaName, lat: baseLat, lng: baseLng } = chennaiAreas[areaIndex];
    
    // Add slight randomization to spread out the sites
    const lat = baseLat + (Math.random() - 0.5) * 0.03;
    const lng = baseLng + (Math.random() - 0.5) * 0.03;
    
    // Create a realistic address
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetIndex = Math.floor(Math.random() * streetNames.length);
    const address = `${streetNumber}, ${streetNames[streetIndex]}, ${areaName}, Chennai`;
    
    // Generate factory name
    const factoryName = chennaiFactories[i % chennaiFactories.length];
    
    // Generate equipment data
    const equipmentCount = Math.floor(Math.random() * 5) + 3;
    const equipment = Array.from({ length: equipmentCount }, () => {
      const efficiency = faker.number.float({ min: 60, max: 98, multipleOf: 0.1 });
      const isAnomaly = Math.random() > 0.8; // 20% chance of anomaly
      
      let status: 'Operational' | 'Warning' | 'Critical' | 'Offline' = 'Operational';
      if (isAnomaly) {
        if (efficiency < 70) status = 'Critical';
        else if (efficiency < 85) status = 'Warning';
      }
      
      // Equipment types relevant to Indian industrial settings
      const equipmentTypes = [
        'Power Supply Unit', 'Main Transformer', 'Backup Generator', 
        'Cooling System', 'Solar Inverter', 'Battery Array',
        'Distribution Panel', 'Transmission Line', 'Motor Controller',
        'UPS System', 'Industrial Chiller', 'Pump System',
        'Voltage Regulator', 'Capacitor Bank', 'Air Compressor'
      ];
      
      return {
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement(equipmentTypes),
        status,
        temperature: faker.number.float({ min: status === 'Critical' ? 70 : 30, max: status === 'Critical' ? 95 : 65, multipleOf: 0.1 }),
        lastMaintenance: Date.now() - faker.number.int({ min: 1, max: 90 }) * 24 * 3600 * 1000,
        maintenanceDue: Math.random() > 0.7,
        anomalyDetected: isAnomaly,
        energyEfficiency: efficiency,
        vibration: faker.number.float({ min: status === 'Critical' ? 60 : 10, max: status === 'Critical' ? 90 : 40, multipleOf: 0.1 })
      };
    });
    
    // Calculate a disaster risk score based on equipment health
    const avgEfficiency = equipment.reduce((sum, eq) => sum + eq.energyEfficiency, 0) / equipment.length;
    const criticalCount = equipment.filter(eq => eq.status === 'Critical').length;
    const disasterRiskScore = Math.min(100, Math.max(0, 
      100 - avgEfficiency + (criticalCount * 20) + (Math.random() * 10)
    ));
    
    // Site types common in Chennai industrial zones
    const siteTypes: Array<Site['type']> = [
      'Manufacturing Plant', 'Electronics Factory', 'Textile Mill',
      'Data Center', 'Chemical Plant', 'Automotive Factory', 
      'Distribution Center', 'Power Substation', 'Processing Unit'
    ];
    
    return {
    id: faker.string.uuid(),
      name: factoryName,
    location: {
        lat,
        lng,
        address
      },
      type: faker.helpers.arrayElement(siteTypes),
    status: faker.helpers.arrayElement(['Online', 'Offline', 'Maintenance']),
    energyData: Array.from({ length: 24 }, (_, j) => ({
      id: faker.string.uuid(),
      timestamp: Date.now() - (23 - j) * 3600000,
        consumption: faker.number.float({ min: 50, max: 200, multipleOf: 0.01 }),
        renewable: faker.number.float({ min: 10, max: 100, multipleOf: 0.01 }),
        grid: faker.number.float({ min: 20, max: 150, multipleOf: 0.01 }),
        cost: faker.number.float({ min: 100, max: 500, multipleOf: 0.01 }),
        savings: faker.number.float({ min: 10, max: 100, multipleOf: 0.01 }),
        efficiency: avgEfficiency, // Base efficiency on equipment health
      })),
      equipment,
      lastDisasterCheck: Date.now(),
      disasterRiskScore
    };
  });
};

const generateMockMarketplaceItems = (count: number): MarketplaceItem[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.commerce.productName() + ' Energy Credits',
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 100, max: 5000, multipleOf: 0.01 }),
    seller: faker.company.name(),
    energyAmount: faker.number.float({ min: 50, max: 500, multipleOf: 0.1 }),
    renewable: faker.datatype.boolean(),
    timeLeft: faker.number.int({ min: 1, max: 72 }),
    reliability: faker.number.float({ min: 70, max: 99, multipleOf: 0.1 }),
    optimizationMethod: faker.helpers.arrayElement([
      'AI Optimization', 
      'Peak Shaving', 
      'Load Balancing', 
      'Smart Grid Integration'
    ])
  }));
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      sites: [],
      marketplaceItems: [],
      isLoading: false,
      error: null,
      
      fetchSites: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockSites = generateMockSites(10);
          set({ sites: mockSites, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      fetchMarketplaceItems: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockItems = generateMockMarketplaceItems(12);
          set({ marketplaceItems: mockItems, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      addSite: async (siteData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          const newSite: Site = {
            ...siteData,
            id: faker.string.uuid(),
            energyData: []
          };
          set(state => ({ 
            sites: [...state.sites, newSite],
            isLoading: false 
          }));
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      updateSite: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set(state => ({
            sites: state.sites.map(site => 
              site.id === id ? { ...site, ...updates } : site
            ),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      deleteSite: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set(state => ({
            sites: state.sites.filter(site => site.id !== id),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      purchaseMarketplaceItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          set(state => ({
            marketplaceItems: state.marketplaceItems.filter(item => item.id !== id),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      },
      
      runDisasterAnalysis: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const currentSites = [...get().sites];
          const updatedSites = currentSites.map(site => {
            // Simulate some changes in equipment health after disaster
            const updatedEquipment = site.equipment?.map(eq => {
              // 30% chance of equipment degradation during analysis
              if (Math.random() < 0.3) {
                const newEfficiency = Math.max(50, eq.energyEfficiency - (Math.random() * 20));
                let newStatus = eq.status;
                
                if (newEfficiency < 65) newStatus = 'Critical';
                else if (newEfficiency < 80) newStatus = 'Warning';
                
                return {
                  ...eq,
                  energyEfficiency: newEfficiency,
                  temperature: eq.temperature + (Math.random() * 15),
                  vibration: Math.min(100, eq.vibration + (Math.random() * 20)),
                  anomalyDetected: true,
                  status: newStatus
                };
              }
              return eq;
            }) || [];
            
            // Update the site's energy data based on equipment changes
            const avgEquipmentEfficiency = updatedEquipment.length > 0 ? 
              updatedEquipment.reduce((sum, eq) => sum + eq.energyEfficiency, 0) / updatedEquipment.length : 
              70; // Default if no equipment
            
            const latestEnergyData = [...site.energyData];
            const lastEntry = latestEnergyData[latestEnergyData.length - 1];
            
            // Add a new entry with reduced efficiency if equipment is degraded
            latestEnergyData.push({
              ...lastEntry,
              id: faker.string.uuid(),
              timestamp: Date.now(),
              efficiency: avgEquipmentEfficiency,
              consumption: lastEntry.consumption * (100 / avgEquipmentEfficiency) // Higher consumption with worse efficiency
            });
            
            // Calculate new disaster risk score
            const criticalCount = updatedEquipment.filter(eq => eq.status === 'Critical').length;
            const disasterRiskScore = Math.min(100, Math.max(0, 
              100 - avgEquipmentEfficiency + (criticalCount * 15) + (Math.random() * 10)
            ));
            
            return {
              ...site,
              equipment: updatedEquipment,
              energyData: latestEnergyData,
              lastDisasterCheck: Date.now(),
              disasterRiskScore
            };
          });
          
          set({ sites: updatedSites, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'An error occurred', isLoading: false });
        }
      }
    }),
    {
      name: 'data-storage',
      partialize: (state) => ({ 
        sites: state.sites,
        marketplaceItems: state.marketplaceItems 
      }),
    }
  )
);
