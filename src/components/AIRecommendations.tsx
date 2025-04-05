import React, { useState, useEffect } from 'react';

// This component generates AI-like recommendations for site maintenance and improvements
// In a real application, this would connect to an actual AI service

interface Site {
  id: string;
  name: string;
  healthStatus?: string;
  statusColor?: string;
  anomalyScore?: number;
  location: {
    address: string;
  };
  equipment?: any[];
  energyData: any[];
  type: string;
}

interface Recommendation {
  id: string;
  siteId: string;
  siteName: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: 'replacement' | 'optimization' | 'maintenance';
  estimatedSavings: number;
  estimatedCost: number;
  roi: number;
}

interface AIRecommendationsProps {
  sites: Site[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ sites }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Generate mock AI recommendations based on site data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const generatedRecommendations: Recommendation[] = [];
      
      // For each site with issues, generate relevant recommendations
      sites.forEach(site => {
        const latestData = site.energyData[site.energyData.length - 1];
        
        // Check if site has equipment data
        if (site.equipment && site.equipment.length > 0) {
          // Find problematic equipment
          const criticalEquipment = site.equipment.filter(eq => 
            eq.status === 'Critical' || eq.status === 'Warning'
          );
          
          criticalEquipment.forEach(equipment => {
            // Replacement recommendation for critical equipment
            if (equipment.status === 'Critical') {
              generatedRecommendations.push({
                id: `rec-${Math.random().toString(36).substring(2, 9)}`,
                siteId: site.id,
                siteName: site.name,
                text: `Replace ${equipment.name} due to critical efficiency issues. Operating at ${equipment.energyEfficiency.toFixed(1)}% efficiency, which is below acceptable thresholds.`,
                priority: 'high',
                category: 'replacement',
                estimatedSavings: parseFloat((Math.random() * 5000 + 3000).toFixed(2)),
                estimatedCost: parseFloat((Math.random() * 2000 + 1000).toFixed(2)),
                roi: parseFloat((Math.random() * 3 + 1.5).toFixed(2))
              });
            }
            
            // Maintenance recommendation for warning equipment
            if (equipment.status === 'Warning') {
              generatedRecommendations.push({
                id: `rec-${Math.random().toString(36).substring(2, 9)}`,
                siteId: site.id,
                siteName: site.name,
                text: `Schedule maintenance for ${equipment.name}. Current temperature (${equipment.temperature.toFixed(1)}°C) and vibration readings are outside normal parameters.`,
                priority: 'medium',
                category: 'maintenance',
                estimatedSavings: parseFloat((Math.random() * 2000 + 1000).toFixed(2)),
                estimatedCost: parseFloat((Math.random() * 500 + 300).toFixed(2)),
                roi: parseFloat((Math.random() * 4 + 2).toFixed(2))
              });
            }
          });
        }
        
        // Energy optimization recommendations based on consumption patterns
        if (latestData.efficiency < 80) {
          generatedRecommendations.push({
            id: `rec-${Math.random().toString(36).substring(2, 9)}`,
            siteId: site.id,
            siteName: site.name,
            text: `Implement load balancing system at ${site.name} to optimize energy distribution. Current efficiency is ${latestData.efficiency.toFixed(1)}%.`,
            priority: latestData.efficiency < 70 ? 'high' : 'medium',
            category: 'optimization',
            estimatedSavings: parseFloat((Math.random() * 3000 + 2000).toFixed(2)),
            estimatedCost: parseFloat((Math.random() * 1500 + 800).toFixed(2)),
            roi: parseFloat((Math.random() * 2 + 1).toFixed(2))
          });
        }
        
        // Add some general optimization recommendations
        if (Math.random() > 0.7) {
          generatedRecommendations.push({
            id: `rec-${Math.random().toString(36).substring(2, 9)}`,
            siteId: site.id,
            siteName: site.name,
            text: `Consider upgrading to energy-efficient LED lighting at ${site.name} to reduce base power consumption.`,
            priority: 'low',
            category: 'optimization',
            estimatedSavings: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
            estimatedCost: parseFloat((Math.random() * 800 + 400).toFixed(2)),
            roi: parseFloat((Math.random() * 1.5 + 0.8).toFixed(2))
          });
        }
      });
      
      setRecommendations(generatedRecommendations);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [sites]);

  // Filter recommendations based on selected category and priority
  const filteredRecommendations = recommendations.filter(rec => {
    return (selectedCategory === 'all' || rec.category === selectedCategory) &&
           (selectedPriority === 'all' || rec.priority === selectedPriority);
  });

  // Calculate total potential savings
  const totalSavings = filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  const totalCost = filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg min-h-[400px] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          <p className="mt-4 text-base-content/70">Analyzing data and generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">AI Recommendations</h3>
          <p className="text-base-content/70">
            AI-generated suggestions to improve energy efficiency and address issues.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mt-3 md:mt-0">
          <select
            className="select select-bordered select-sm"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="replacement">Replacement</option>
            <option value="maintenance">Maintenance</option>
            <option value="optimization">Optimization</option>
          </select>
          
          <select
            className="select select-bordered select-sm"
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 border border-base-300 rounded-lg">
          <div className="stat-title">Recommendations</div>
          <div className="stat-value">{filteredRecommendations.length}</div>
          <div className="stat-desc">Actions to consider</div>
        </div>
        
        <div className="stat bg-base-100 border border-base-300 rounded-lg">
          <div className="stat-title">Potential Savings</div>
          <div className="stat-value text-success">₹{totalSavings.toLocaleString()}</div>
          <div className="stat-desc">Annual estimate</div>
        </div>
        
        <div className="stat bg-base-100 border border-base-300 rounded-lg">
          <div className="stat-title">Implementation Cost</div>
          <div className="stat-value text-primary">₹{totalCost.toLocaleString()}</div>
          <div className="stat-desc">Estimated investment</div>
        </div>
      </div>
      
      {filteredRecommendations.length === 0 ? (
        <div className="bg-base-200 p-6 rounded-lg text-center">
          <p>No recommendations match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map(rec => (
            <div 
              key={rec.id} 
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'border-error bg-error/5' : 
                rec.priority === 'medium' ? 'border-warning bg-warning/5' : 
                'border-info bg-info/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{rec.siteName}</h4>
                  <p className="mt-1">{rec.text}</p>
                </div>
                <div className={`badge ${
                  rec.category === 'replacement' ? 'badge-error' : 
                  rec.category === 'maintenance' ? 'badge-warning' : 
                  'badge-info'
                }`}>
                  {rec.category}
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium">Savings:</span> ${rec.estimatedSavings.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Cost:</span> ${rec.estimatedCost.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">ROI:</span> {rec.roi}x
                </div>
                <div className={`${
                  rec.priority === 'high' ? 'text-error' : 
                  rec.priority === 'medium' ? 'text-warning' : 
                  'text-info'
                } font-medium`}>
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations; 