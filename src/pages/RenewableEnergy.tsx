import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, BarChart, DonutChart } from '@tremor/react';
import { Sun, Wind, Battery, Zap, AlertTriangle, CloudRain, Thermometer, Download, TrendingUp, Calendar, DollarSign, IndianRupee } from 'lucide-react';
import { faker } from '@faker-js/faker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateEnergyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    solar: faker.number.int({ min: 20, max: 100 }),
    wind: faker.number.int({ min: 15, max: 80 }),
    battery: faker.number.int({ min: 10, max: 60 }),
    consumption: faker.number.int({ min: 30, max: 90 }),
    cost: faker.number.int({ min: 50, max: 200 })
  }));
};

const weatherData = {
  temperature: '24°C',
  humidity: '65%',
  windSpeed: '12 km/h',
  forecast: 'Partly Cloudy'
};

const aiRecommendations = [
  {
    title: 'Dynamic Load Balancing Optimization',
    description: 'Implement ML-powered load balancing system to distribute energy based on predicted demand patterns',
    impact: 'Estimated 18% increase in grid efficiency',
    priority: 'High',
    roi: '3.5 months',
    analysis: 'Based on historical data patterns and weather forecasts, implementing dynamic load balancing could significantly reduce energy waste during peak hours.',
    steps: [
      'Deploy IoT sensors across the grid',
      'Install ML-based prediction system',
      'Configure automated load distribution',
      'Monitor and optimize thresholds'
    ]
  },
  {
    title: 'Predictive Maintenance Protocol',
    description: 'Deploy AI-driven maintenance scheduling using vibration analysis and thermal imaging',
    impact: 'Reduce downtime by 45%, extend equipment life by 25%',
    priority: 'High',
    roi: '5 months',
    analysis: 'Current reactive maintenance patterns show significant efficiency losses. Predictive maintenance could prevent 85% of potential failures.',
    steps: [
      'Install vibration sensors',
      'Deploy thermal cameras',
      'Implement AI analysis system',
      'Train maintenance team'
    ]
  },
  {
    title: 'Weather-Adaptive Solar Tracking',
    description: 'Enhanced solar tracking algorithm incorporating real-time weather data and sun position',
    impact: 'Potential 22% increase in solar collection efficiency',
    priority: 'Medium',
    roi: '4 months',
    analysis: 'Current fixed tracking patterns miss optimal angles during varying weather conditions. Advanced tracking could capture significantly more energy.',
    steps: [
      'Update tracking software',
      'Install weather sensors',
      'Calibrate tracking algorithms',
      'Monitor performance metrics'
    ]
  }
];

const systemAlerts = [
  {
    title: 'Severe Weather Alert',
    description: 'Incoming storm system detected. Implementing protective measures for wind turbines.',
    time: '30 minutes ago',
    type: 'warning',
    impact: 'Potential 20% reduction in wind power output',
    action: 'Automated safety protocols initiated'
  },
  {
    title: 'Grid Stability Notice',
    description: 'Unusual voltage fluctuations detected in sector 3',
    time: '2 hours ago',
    type: 'info',
    impact: 'Minor system inefficiency detected',
    action: 'Diagnostic scan in progress'
  },
  {
    title: 'Maintenance Alert',
    description: 'Solar panel array 5 showing signs of degraded performance',
    time: '4 hours ago',
    type: 'warning',
    impact: '5% reduction in array efficiency',
    action: 'Scheduled for inspection within 24 hours'
  }
];

const RenewableEnergy = () => {
  const [energyData, setEnergyData] = useState(generateEnergyData());
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyData(prevData => {
        const newData = [...prevData];
        newData.shift();
        newData.push({
          time: newData[newData.length - 1].time,
          solar: faker.number.int({ min: 20, max: 100 }),
          wind: faker.number.int({ min: 15, max: 80 }),
          battery: faker.number.int({ min: 10, max: 60 }),
          consumption: faker.number.int({ min: 30, max: 90 }),
          cost: faker.number.int({ min: 50, max: 200 })
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Renewable Energy System Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

      // System Overview
      doc.setFontSize(16);
      doc.text('System Overview', 20, 45);
      const metrics = [
        ['Total Power Output', '198.8 kW'],
        ['System Efficiency', '94.2%'],
        ['Carbon Offset', '2.4 tons'],
        ['Cost Savings', '₹342.50/day']
      ];
      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: metrics
      });

      // Energy Sources
      doc.setFontSize(16);
      doc.text('Energy Sources', 20, doc.lastAutoTable.finalY + 20);
      const sources = [
        ['Solar Power', '45.2 kW', '87%'],
        ['Wind Power', '32.8 kW', '78%'],
        ['Battery Storage', '120 kWh', '92%']
      ];
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Source', 'Output', 'Efficiency']],
        body: sources
      });

      // AI Recommendations
      doc.setFontSize(16);
      doc.text('AI Recommendations', 20, doc.lastAutoTable.finalY + 20);
      const recommendations = aiRecommendations.map(rec => [
        rec.title,
        rec.impact,
        rec.roi
      ]);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Recommendation', 'Impact', 'ROI']],
        body: recommendations
      });

      // System Alerts
      doc.setFontSize(16);
      doc.text('Active System Alerts', 20, doc.lastAutoTable.finalY + 20);
      const alerts = systemAlerts.map(alert => [
        alert.title,
        alert.description,
        alert.impact
      ]);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Alert', 'Description', 'Impact']],
        body: alerts
      });

      doc.save('renewable-energy-report.pdf');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const TimeRangeSelector = () => (
    <div className="flex gap-2">
      {['24h', '7d', '30d', '1y'].map((range) => (
        <button
          key={range}
          onClick={() => setSelectedTimeRange(range)}
          className={`btn ${selectedTimeRange === range ? 'btn-primary' : 'btn-ghost'}`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  const ViewSelector = () => (
    <div className="flex gap-2">
      {['overview', 'detailed', 'analytics'].map((view) => (
        <button
          key={view}
          onClick={() => setSelectedView(view)}
          className={`btn ${selectedView === view ? 'btn-secondary' : 'btn-ghost'}`}
        >
          {view}
        </button>
      ))}
    </div>
  );

  const WeatherWidget = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <CloudRain className="w-6 h-6 text-primary" />
          Weather Conditions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-error" />
            <span>{weatherData.temperature}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-info" />
            <span>{weatherData.windSpeed}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const EnergySourceCard = ({ source }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center">
          <source.icon className={`w-8 h-8 ${source.color}`} />
          <div className={`badge ${
            source.status === 'Optimal' ? 'badge-success' :
            source.status === 'Good' ? 'badge-info' :
            'badge-warning'
          }`}>
            {source.status}
          </div>
        </div>
        <h2 className="card-title mt-4">{source.value}</h2>
        <p className="text-base-content/70">{source.title}</p>
        <div className="mt-4 pt-4 border-t border-base-300">
          <div className="flex justify-between items-center mb-2">
            <span>Efficiency</span>
            <span>{source.efficiency}</span>
          </div>
          <progress 
            className={`progress ${
              parseInt(source.efficiency) > 85 ? 'progress-success' :
              parseInt(source.efficiency) > 70 ? 'progress-warning' :
              'progress-error'
            }`} 
            value={parseInt(source.efficiency)} 
            max="100"
          ></progress>
        </div>
      </div>
    </motion.div>
  );

  const RecommendationsCard = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">AI-Driven Recommendations</h2>
          <Zap className="w-6 h-6 text-warning" />
        </div>
        <div className="space-y-4 mt-4">
          {aiRecommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              className="collapse collapse-plus bg-base-300"
              whileHover={{ scale: 1.01 }}
            >
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium flex justify-between items-center">
                <span>{recommendation.title}</span>
                <span className={`badge ${
                  recommendation.priority === 'High' ? 'badge-error' :
                  recommendation.priority === 'Medium' ? 'badge-warning' :
                  'badge-success'
                }`}>
                  {recommendation.priority} Priority
                </span>
              </div>
              <div className="collapse-content">
                <p className="mt-2">{recommendation.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-success">{recommendation.impact}</p>
                  <p className="text-info">ROI: {recommendation.roi}</p>
                  <div className="mt-4">
                    <p className="font-semibold">Analysis:</p>
                    <p>{recommendation.analysis}</p>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">Implementation Steps:</p>
                    <ul className="list-disc list-inside">
                      {recommendation.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const AlertsCard = () => (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">System Alerts</h2>
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="space-y-4 mt-4">
          {systemAlerts.map((alert, index) => (
            <motion.div
              key={index}
              className="alert shadow-lg"
              whileHover={{ scale: 1.01 }}
            >
              <div>
                <AlertTriangle className={`w-6 h-6 ${
                  alert.type === 'warning' ? 'text-warning' : 'text-info'
                }`} />
                <div>
                  <h3 className="font-bold">{alert.title}</h3>
                  <div className="text-xs">{alert.description}</div>
                </div>
              </div>
              <span className="text-xs opacity-70">{alert.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Renewable Energy Command Center</h1>
          <p className="text-base-content/70 max-w-2xl mx-auto">
            Advanced monitoring and optimization platform for renewable energy systems.
            Real-time insights and AI-driven recommendations for maximum efficiency.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <TimeRangeSelector />
          <ViewSelector />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <WeatherWidget />
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-success">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="stat-title">Cost Savings Today</div>
              <div className="stat-value text-success text-xl md:text-2xl">₹342.50</div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-info">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-title">Efficiency Rate</div>
              <div className="stat-value text-info">94.2%</div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="stat-title">Carbon Offset</div>
              <div className="stat-value text-primary">2.4 tons</div>
            </div>
          </div>
        </div>

        {/* Energy Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Solar Power',
              value: '45.2 kW',
              efficiency: '87%',
              status: 'Optimal',
              icon: Sun,
              color: 'text-warning'
            },
            {
              title: 'Wind Power',
              value: '32.8 kW',
              efficiency: '78%',
              status: 'Good',
              icon: Wind,
              color: 'text-info'
            },
            {
              title: 'Battery Storage',
              value: '120 kWh',
              efficiency: '92%',
              status: 'Charging',
              icon: Battery,
              color: 'text-success'
            }
          ].map((source, index) => (
            <EnergySourceCard key={index} source={source} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Energy Production</h2>
              <AreaChart
                className="h-72 mt-4"
                data={energyData}
                index="time"
                categories={['solar', 'wind', 'battery']}
                colors={['yellow', 'blue', 'green']}
                valueFormatter={(value) => `${value} kW`}
              />
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Energy Distribution</h2>
              <DonutChart
                className="h-72 mt-4"
                data={[
                  { name: 'Solar', value: 45 },
                  { name: 'Wind', value: 33 },
                  { name: 'Battery', value: 22 }
                ]}
                category="value"
                index="name"
                colors={['yellow', 'blue', 'green']}
                valueFormatter={(value) => `${value}%`}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <RecommendationsCard />

        {/* Alerts */}
        <AlertsCard />

        {/* Forecast */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Energy Forecast & Planning</h2>
              <TrendingUp className="w-6 h-6 text-info" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold mb-4">24-Hour Production Forecast</h3>
                <BarChart
                  className="h-64"
                  data={energyData}
                  index="time"
                  categories={['solar', 'wind']}
                  colors={['yellow', 'blue']}
                  valueFormatter={(value) => `${value} kW`}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Optimization Opportunities</h3>
                {[
                  {
                    time: 'Peak Hours (10 AM - 2 PM)',
                    action: 'Maximize solar collection, store excess in batteries',
                    impact: '+25% efficiency'
                  },
                  {
                    time: 'Evening Transition (4 PM - 8 PM)',
                    action: 'Gradual battery discharge, wind power optimization',
                    impact: '+15% grid stability'
                  },
                  {
                    time: 'Night Operations (9 PM - 5 AM)',
                    action: 'Wind power priority, conservative battery usage',
                    impact: '+20% cost savings'
                  }
                ].map((opportunity, index) => (
                  <motion.div
                    key={index}
                    className="card bg-base-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="card-body">
                      <h4 className="font-medium">{opportunity.time}</h4>
                      <p className="text-base-content/70">{opportunity.action}</p>
                      <p className="text-success">{opportunity.impact}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary btn-lg gap-2"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Detailed Analysis Report
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RenewableEnergy;
