import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bot, Sparkles, Activity } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

const IconSwitcher = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [
    <MessageCircle key="message" className="h-6 w-6" />,
    <Bot key="bot" className="h-6 w-6" />,
    <Sparkles key="sparkles" className="h-6 w-6" />,
    <Activity key="activity" className="h-6 w-6" />
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={iconIndex}
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: -90 }}
        transition={{ duration: 0.5 }}
      >
        {icons[iconIndex]}
      </motion.div>
    </AnimatePresence>
  );
};

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Add pulsing effect after initial page load to draw attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(true);
      
      // Remove the pulse effect after 5 seconds
      const pulseTimer = setTimeout(() => {
        setShowPulse(false);
      }, 5000);
      
      return () => clearTimeout(pulseTimer);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-20 right-0 bg-gradient-to-r from-primary to-secondary text-primary-content px-5 py-3 rounded-xl shadow-lg whitespace-nowrap"
          >
            <div className="font-medium text-sm">Ask the EcoNexus AI assistant!</div>
            <div className="text-xs opacity-80 mt-1">Get sustainability insights instantly</div>
            <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-secondary"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={onClick}
        onMouseEnter={() => {
          setShowTooltip(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setIsHovered(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          relative bg-gradient-to-r from-primary to-secondary 
          text-primary-content rounded-full p-4 shadow-xl
          ${showPulse ? 'animate-bounce' : ''}
        `}
        animate={{
          boxShadow: isHovered 
            ? '0 0 20px rgba(var(--color-primary-500), 0.7)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        aria-label="Open AI Assistant"
      >
        {showPulse && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary opacity-30"></span>
        )}
        <IconSwitcher />
      </motion.button>
    </div>
  );
};

export default FloatingChatButton;