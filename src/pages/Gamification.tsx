import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Award, Zap, Network, Server, Battery, Cloud, ChevronDown, Users, BarChart2, Settings } from 'lucide-react';

const EnhancedGamification = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [networkStats, setNetworkStats] = useState({
    uptime: 99.8,
    energyEfficiency: 92,
    bandwidth: 85,
    servers: 245
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [userPoints, setUserPoints] = useState(8750);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const achievements = [
    {
      id: 1,
      title: 'Energy Master',
      description: 'Achieve 95% energy efficiency across all sites',
      progress: 85,
      reward: '500 Green Points',
      deadline: '2d 4h',
      tasks: [
        { name: 'Optimize Server Load', complete: true },
        { name: 'Implement Smart Cooling', complete: true },
        { name: 'Deploy Energy Monitors', complete: false }
      ]
    },
    {
      id: 2,
      title: 'Sustainability Champion',
      description: 'Maintain 100% renewable energy usage for 30 days',
      progress: 60,
      reward: '1000 Green Points',
      deadline: '15d',
      tasks: [
        { name: 'Solar Panel Installation', complete: true },
        { name: 'Wind Energy Integration', complete: false },
        { name: 'Battery Storage Setup', complete: false }
      ]
    },
    {
      id: 3,
      title: 'Innovation Pioneer',
      description: 'Implement 5 AI-powered optimizations',
      progress: 40,
      reward: '750 Green Points',
      deadline: '7d',
      tasks: [
        { name: 'ML Traffic Prediction', complete: true },
        { name: 'AI Cooling System', complete: false },
        { name: 'Smart Grid Integration', complete: false }
      ]
    }
  ];

  const leaderboard = [
    { name: 'TelecomCo International', points: 12500, rank: 1, trend: 'up' },
    { name: 'Global Networks Ltd', points: 11200, rank: 2, trend: 'down' },
    { name: 'EcoTech Solutions', points: 10800, rank: 3, trend: 'up' },
    { name: 'Green Telecom Corp', points: 9500, rank: 4, trend: 'stable' },
    { name: 'Future Communications', points: 8900, rank: 5, trend: 'up' }
  ];

  const networkMetrics = [
    {
      title: 'Network Uptime',
      value: '99.8%',
      change: '+0.2%',
      trend: 'up',
      icon: Network,
      color: 'text-blue-500'
    },
    {
      title: 'Energy Efficiency',
      value: '92%',
      change: '+5%',
      trend: 'up',
      icon: Battery,
      color: 'text-green-500'
    },
    {
      title: 'Server Load',
      value: '85%',
      change: '-2%',
      trend: 'down',
      icon: Server,
      color: 'text-yellow-500'
    },
    {
      title: 'Cloud Usage',
      value: '78%',
      change: '+8%',
      trend: 'up',
      icon: Cloud,
      color: 'text-purple-500'
    }
  ];

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        uptime: Math.min(100, prev.uptime + (Math.random() * 0.2 - 0.1)),
        energyEfficiency: Math.min(100, prev.energyEfficiency + (Math.random() * 0.5 - 0.25)),
        bandwidth: Math.min(100, prev.bandwidth + (Math.random() * 1 - 0.5)),
        servers: prev.servers + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Achievement completion simulation
  const completeTask = (achievementId, taskIndex) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.tasks[taskIndex].complete = true;
      setShowAchievement(true);
      setUserPoints(prev => prev + 100);
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      {/* Navigation */}
      <div className="navbar bg-base-200 rounded-box mb-6">
        <div className="flex-1">
          <div className="btn btn-ghost text-xl">Sustainability Hub</div>
        </div>
        <div className="flex-none">
          <div className="tabs tabs-boxed bg-base-300">
            {['dashboard', 'challenges', 'stats', 'settings'].map(tab => (
              <a
                key={tab}
                className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {networkMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-200 shadow-xl"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title text-base-content">{metric.title}</h2>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className={`badge ${metric.trend === 'up' ? 'badge-success' : 'badge-warning'}`}>
                      {metric.change}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Challenges Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Active Challenges</h2>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="collapse collapse-arrow bg-base-300"
                  >
                    <input type="radio" name="challenges-accordion" />
                    <div className="collapse-title text-xl font-medium">
                      <div className="flex items-center justify-between">
                        <span>{achievement.title}</span>
                        <div className="badge badge-primary">{achievement.deadline}</div>
                      </div>
                    </div>
                    <div className="collapse-content">
                      <p className="text-base-content/80 mb-4">{achievement.description}</p>
                      <progress
                        className="progress progress-success w-full mb-4"
                        value={achievement.progress}
                        max="100"
                      ></progress>
                      <div className="space-y-2">
                        {achievement.tasks.map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className="flex items-center justify-between p-2 bg-base-200 rounded-lg"
                          >
                            <span className={task.complete ? 'line-through opacity-50' : ''}>
                              {task.name}
                            </span>
                            <button
                              className={`btn btn-sm ${task.complete ? 'btn-disabled' : 'btn-primary'}`}
                              onClick={() => completeTask(achievement.id, taskIndex)}
                              disabled={task.complete}
                            >
                              {task.complete ? 'Completed' : 'Complete'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Global Rankings</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Company</th>
                      <th>Points</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((company, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={index < 3 ? 'font-bold' : ''}
                      >
                        <td>
                          <div className={`badge ${
                            index === 0 ? 'badge-warning' :
                            index === 1 ? 'badge-secondary' :
                            index === 2 ? 'badge-accent' :
                            'badge-ghost'
                          }`}>
                            #{company.rank}
                          </div>
                        </td>
                        <td>{company.name}</td>
                        <td>{company.points.toLocaleString()}</td>
                        <td>
                          <div className={`badge ${
                            company.trend === 'up' ? 'badge-success' :
                            company.trend === 'down' ? 'badge-error' :
                            'badge-ghost'
                          }`}>
                            {company.trend}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="toast toast-end"
          >
            <div className="alert alert-success">
              <Trophy className="w-6 h-6" />
              <span>Achievement unlocked! +100 points</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedGamification;
