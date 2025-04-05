import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const NotificationsMenu: React.FC = () => {
  const { 
    notifications, 
    unreadNotifications, 
    markNotificationsAsRead, 
    removeNotification 
  } = useAppStore();
  
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
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-success rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-warning rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-error rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-info rounded-full"></div>;
    }
  };
  
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="indicator-item badge badge-primary badge-sm">
              {unreadNotifications}
            </span>
          )}
        </div>
      </div>
      <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-80 p-2 shadow bg-base-100 text-base-content">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="card-title text-lg">Notifications</h3>
            {unreadNotifications > 0 && (
              <button 
                className="btn btn-ghost btn-xs"
                onClick={markNotificationsAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="divider my-1"></div>
          
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 mb-2 rounded-lg ${
                      notification.read ? 'bg-base-200' : 'bg-base-300'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        {getIconForType(notification.type)}
                        <span className="font-medium">{notification.title}</span>
                      </div>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    <div className="flex items-center text-xs text-base-content/60 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(notification.timestamp)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-base-content/60">
                  No notifications
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsMenu;
