import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Clock, BarChart2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color, delay = 0 }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="card bg-base-100"
    >
      <div className="card-body p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base-content/70 mb-1">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <>
                    <TrendingUp className={`h-4 w-4 text-success mr-1`} />
                    <span className="text-success text-sm">+{change}%</span>
                  </>
                ) : isNegative ? (
                  <>
                    <TrendingDown className={`h-4 w-4 text-error mr-1`} />
                    <span className="text-error text-sm">{change}%</span>
                  </>
                ) : (
                  <span className="text-base-content/50 text-sm">No change</span>
                )}
                <span className="text-xs text-base-content/50 ml-2">vs last week</span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Energy Consumption',
      value: '1,245 kWh',
      change: -12.5,
      icon: Zap,
      color: 'primary'
    },
    {
      title: 'Renewable Energy',
      value: '42%',
      change: 8.3,
      icon: Zap,
      color: 'success'
    },
    {
      title: 'Cost Savings',
      value: '₹ 3,240',
      change: 15.2,
      icon: BarChart2,
      color: 'info'
    },
    {
      title: 'Carbon Footprint',
      value: '685 kg',
      change: -18.7,
      icon: AlertTriangle,
      color: 'warning'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          delay={index}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
