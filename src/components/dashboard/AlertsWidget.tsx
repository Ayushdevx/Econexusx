import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, X, Bell, Filter, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: number;
  source: string;
  isRead: boolean;
  isResolved: boolean;
}

const AlertsWidget: React.FC = () => {
  const { addNotification } = useAppStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'unread'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Generate random alerts
  const generateAlerts = () => {
    setIsLoading(true);

    const alertTypes = ['critical', 'warning', 'info'] as const;
    const alertSources = ['System', 'Network', 'Energy Grid', 'Solar Array', 'Wind Turbine', 'Battery Storage'];

    const criticalAlerts = [
      'Power outage detected at site',
      'Critical battery level reached',
      'System overload detected',
      'Network connection lost',
      'Security breach detected'
    ];

    const warningAlerts = [
      'High energy consumption detected',
      'Battery performance degrading',
      'Weather conditions affecting production',
      'Maintenance required soon',
      'Unusual pattern detected'
    ];

    const infoAlerts = [
      'System update available',
      'Energy production above average',
      'New optimization opportunity identified',
      'Scheduled maintenance completed',
      'Weather forecast updated'
    ];

    const getAlertMessage = (type: 'critical' | 'warning' | 'info') => {
      switch (type) {
        case 'critical':
          return criticalAlerts[Math.floor(Math.random() * criticalAlerts.length)];
        case 'warning':
          return warningAlerts[Math.floor(Math.random() * warningAlerts.length)];
        case 'info':
          return infoAlerts[Math.floor(Math.random() * infoAlerts.length)];
      }
    };

    // Generate between 5-10 alerts
    const count = Math.floor(Math.random() * 6) + 5;
    const now = Date.now();

    const generatedAlerts: Alert[] = Array.from({ length: count }, (_, i) => {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const title = getAlertMessage(type);
      const source = alertSources[Math.floor(Math.random() * alertSources.length)];
      const isResolved = Math.random() > 0.7;
      const isRead = isResolved || Math.random() > 0.5;

      return {
        id: `alert-${Date.now()}-${i}`,
        title,
        message: `${title} at ${source}. ${type === 'critical' ? 'Immediate action required.' : type === 'warning' ? 'Please check soon.' : 'For your information.'}`,
        type,
        timestamp: now - Math.floor(Math.random() * 86400000), // Random time in the last 24 hours
        source,
        isRead,
        isResolved
      };
    });

    // Sort by timestamp (newest first) and severity
    generatedAlerts.sort((a, b) => {
      if (a.isResolved && !b.isResolved) return 1;
      if (!a.isResolved && b.isResolved) return -1;

      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (a.type !== b.type) {
        return severityOrder[a.type] - severityOrder[b.type];
      }

      return b.timestamp - a.timestamp;
    });

    setTimeout(() => {
      setAlerts(generatedAlerts);
      setIsLoading(false);

      // Add unread critical alerts to global notifications
      generatedAlerts
        .filter(alert => !alert.isRead && alert.type === 'critical')
        .forEach(alert => {
          addNotification({
            id: alert.id,
            title: 'Critical Alert',
            message: alert.message,
            type: 'error',
            read: false,
            timestamp: alert.timestamp
          });
        });
    }, 800);
  };

  // Initialize alerts
  useEffect(() => {
    generateAlerts();
  }, []);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Format as date
    return new Date(timestamp).toLocaleDateString();
  };

  // Get alert icon
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Bell className="h-5 w-5 text-info" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (!showResolved && alert.isResolved) return false;

    switch (filter) {
      case 'critical':
        return alert.type === 'critical';
      case 'warning':
        return alert.type === 'warning';
      case 'info':
        return alert.type === 'info';
      case 'unread':
        return !alert.isRead;
      default:
        return true;
    }
  });

  // Mark alert as read
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  // Mark alert as resolved
  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, isResolved: true, isRead: true } : alert
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card bg-base-100 h-full"
    >
      <div className="card-body p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="card-title">System Alerts</h3>
            {alerts.filter(a => !a.isRead).length > 0 && (
              <div className="badge badge-error">{alerts.filter(a => !a.isRead).length} new</div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                <Filter className="h-4 w-4 mr-1" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><a onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All Alerts</a></li>
                <li><a onClick={() => setFilter('critical')} className={filter === 'critical' ? 'active' : ''}>Critical Only</a></li>
                <li><a onClick={() => setFilter('warning')} className={filter === 'warning' ? 'active' : ''}>Warnings Only</a></li>
                <li><a onClick={() => setFilter('info')} className={filter === 'info' ? 'active' : ''}>Info Only</a></li>
                <li><a onClick={() => setFilter('unread')} className={filter === 'unread' ? 'active' : ''}>Unread Only</a></li>
              </ul>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer py-0 px-2">
                <span className="label-text mr-2">Show Resolved</span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={showResolved}
                  onChange={() => setShowResolved(!showResolved)}
                />
              </label>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={markAllAsRead}
              disabled={!alerts.some(a => !a.isRead)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Mark All Read
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={generateAlerts}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[500px] pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No alerts match your current filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.isResolved
                        ? 'bg-base-200 border-base-300'
                        : alert.type === 'critical'
                        ? 'bg-error/10 border-error/30'
                        : alert.type === 'warning'
                        ? 'bg-warning/10 border-warning/30'
                        : 'bg-info/10 border-info/30'
                    } ${!alert.isRead ? 'ring-1 ring-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {alert.isResolved ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          getAlertIcon(alert.type)
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            {alert.title}
                            {!alert.isRead && (
                              <span className="badge badge-sm badge-primary">New</span>
                            )}
                          </h4>

                          <div className="flex items-center gap-1">
                            {!alert.isRead && (
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => markAsRead(alert.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}

                            {!alert.isResolved && (
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => resolveAlert(alert.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-sm mt-1">{alert.message}</p>

                        <div className="flex items-center justify-between mt-2 text-xs text-base-content/60">
                          <div className="flex items-center gap-2">
                            <span>{alert.source}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(alert.timestamp)}
                            </span>
                          </div>

                          {alert.isResolved && (
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="h-3 w-3" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AlertsWidget;
