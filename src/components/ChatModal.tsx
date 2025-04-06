import React, { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ChatComponent: React.LazyExoticComponent<React.ComponentType>;
}

const LoadingIndicator = () => (
  <div className="flex flex-col justify-center items-center h-48 space-y-4">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-full border-4 border-primary opacity-20 animate-ping"></div>
      <Loader2 size={40} className="animate-spin text-primary" />
    </div>
    <p className="text-base-content animate-pulse font-medium">Loading your AI assistant...</p>
    <div className="text-xs text-base-content/60 max-w-xs text-center">
      Preparing to assist you with environmental sustainability questions
    </div>
  </div>
);

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, ChatComponent }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Prevent scrolling of background content when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, isFullscreen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 ${isFullscreen ? 'p-0' : ''}`}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div 
            className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl'} bg-transparent rounded-xl overflow-hidden`}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            layout
          >
            <div className="absolute top-2 right-2 flex gap-2 z-20">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-base-300 bg-opacity-70 text-base-content rounded-full p-2 shadow-lg backdrop-blur-sm"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? 
                  <Minimize2 className="h-5 w-5" /> : 
                  <Maximize2 className="h-5 w-5" />
                }
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="bg-error text-error-content rounded-full p-2 shadow-lg"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
            
            <Suspense fallback={<LoadingIndicator />}>
              <div className={`${isFullscreen ? 'h-screen' : 'h-[80vh] max-h-[700px]'}`}>
                <ChatComponent />
              </div>
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;