import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { useDataStore } from './store/dataStore';

// Lazy load pages for better initial load performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const RenewableEnergy = lazy(() => import('./pages/RenewableEnergy'));
const Gamification = lazy(() => import('./pages/Gamification'));
const NetworkOptimizer = lazy(() => import('./pages/Network'));
const DisasterMonitoring = lazy(() => import('./pages/DisasterMonitoring'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const InteractiveAIChatbot = lazy(() => import('./components/InteractiveAIChatbot'));

// Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// Separate components into their own files
import FloatingChatButton from './components/FloatingChatButton';
import ChatModal from './components/ChatModal';

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-base-200">
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Eco Nexus
        </div>
      </div>
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-primary"></div>
    </div>
    <p className="mt-4 text-base-content/70 animate-pulse">Loading amazing features...</p>
  </div>
);

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { setChatOpen } = useAppStore();
  const { fetchSites, fetchMarketplaceItems } = useDataStore();

  // Effect to load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchSites();
      fetchMarketplaceItems();
    }
  }, [isAuthenticated, fetchSites, fetchMarketplaceItems]);

  // Sync chat state with global state
  useEffect(() => {
    setChatOpen(isChatOpen);
  }, [isChatOpen, setChatOpen]);

  return (
    <Router>
      <div className="min-h-screen bg-base-200 text-base-content">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } />
              <Route path="/renewable-energy" element={
                <ProtectedRoute>
                  <RenewableEnergy />
                </ProtectedRoute>
              } />
              <Route path="/gamification" element={
                <ProtectedRoute>
                  <Gamification />
                </ProtectedRoute>
              } />
              <Route path="/network" element={
                <ProtectedRoute>
                  <NetworkOptimizer />
                </ProtectedRoute>
              } />
              <Route path="/disaster-monitoring" element={
                <ProtectedRoute>
                  <DisasterMonitoring />
                </ProtectedRoute>
              } />
              <Route path="/maintenance" element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              } />

              {/* Special routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />

        <FloatingChatButton onClick={() => setIsChatOpen(true)} />
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          ChatComponent={InteractiveAIChatbot}
        />
      </div>
    </Router>
  );
};

export default App;