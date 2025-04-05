import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, BarChart2, ShoppingCart, Wind, Trophy, User, Network, Search, AlertTriangle, Wrench } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import ThemeToggle from './ui/ThemeToggle';
import NotificationsMenu from './ui/NotificationsMenu';
import UserMenu from './ui/UserMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { to: '/marketplace', icon: ShoppingCart, label: 'Marketplace' },
    { to: '/renewable-energy', icon: Wind, label: 'Renewable\nEnergy' },
    { to: '/network', icon: Network, label: 'Network\nOptimizer' },
    { to: '/disaster-monitoring', icon: AlertTriangle, label: 'Disaster\nMonitoring' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/gamification', icon: Trophy, label: 'Gamification' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
    setSearchOpen(false);
  };

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Eco Nexus
            </span>
          </Link>

          {/* Horizontal Navigation */}
          {isAuthenticated && (
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex flex-col items-center justify-center px-3 py-1 mx-1 h-14 rounded-lg text-center transition-colors ${location.pathname === item.to ? 'bg-base-200 text-primary' : 'text-base-content hover:bg-base-200'}`}
                  >
                    <item.icon className="w-5 h-5 mb-1" />
                    {item.label.includes('\n') ? (
                      item.label.split('\n').map((line, i) => (
                        <span key={i} className="text-xs leading-tight">
                          {line}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs">{item.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Search button */}
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <NotificationsMenu />
                <UserMenu />
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-2"
            >
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-bordered flex-grow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary ml-2">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;