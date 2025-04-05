import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const passwordStrength = (): { score: number; feedback: string } => {
    if (password.length === 0) return { score: 0, feedback: 'Enter a password' };
    if (password.length < 6) return { score: 1, feedback: 'Password is too short' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const feedbacks = [
      'Very weak',
      'Weak',
      'Fair',
      'Good',
      'Strong'
    ];
    
    return { score, feedback: feedbacks[score] };
  };
  
  const { score, feedback } = passwordStrength();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    await register(name, email, password);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="alert alert-error mb-4"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button className="btn btn-ghost btn-xs" onClick={clearError}>
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Password</span>
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
            
            {password && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs">{feedback}</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      score <= 1 ? 'bg-error' : 
                      score === 2 ? 'bg-warning' : 
                      score === 3 ? 'bg-info' : 'bg-success'
                    }`} 
                    style={{ width: `${(score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input input-bordered w-full pr-10 ${
                  confirmPassword && password !== confirmPassword ? 'input-error' : ''
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="text-success" size={16} />
                  ) : (
                    <X className="text-error" size={16} />
                  )}
                </div>
              )}
            </div>
            {confirmPassword && password !== confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">Passwords don't match</span>
              </label>
            )}
          </div>
          
          <div className="form-control mb-6">
            <label className="label cursor-pointer justify-start gap-2">
              <input 
                type="checkbox" 
                className="checkbox checkbox-sm" 
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                required
              />
              <span className="label-text">
                I agree to the{' '}
                <Link to="/terms" className="link link-primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="link link-primary">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !agreeToTerms || password !== confirmPassword}
          >
            {!isLoading && <UserPlus className="h-5 w-5 mr-2" />}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="divider my-6">OR</div>
        
        <p className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="link link-primary">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterForm;
