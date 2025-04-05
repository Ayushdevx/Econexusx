import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Zap className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Eco Nexus
        </h1>
        <p className="text-gray-400 mt-2">
          Revolutionizing telecom energy management
        </p>
      </motion.div>
      
      <LoginForm />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-sm text-gray-500"
      >
        <p>© {new Date().getFullYear()} Eco Nexus. All rights reserved.</p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
