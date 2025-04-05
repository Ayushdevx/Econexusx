import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    if (!error) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 shadow-xl rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="alert alert-error mb-4"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button className="btn btn-ghost btn-xs" onClick={clearError}>
              <EyeOff className="h-4 w-4" />
            </button>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Password</span>
              <Link to="/forgot-password" className="label-text-alt link link-hover">
                Forgot password?
              </Link>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <label className="label cursor-pointer gap-2">
              <input 
                type="checkbox" 
                className="checkbox checkbox-sm" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="label-text">Remember me</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && <LogIn className="h-5 w-5 mr-2" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="divider my-6">OR</div>
        
        <p className="text-center">
          Don't have an account?{' '}
          <Link to="/register" className="link link-primary">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;
