import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'factory') navigate('/factory');
      else if (user.role === 'regulator') navigate('/regulator');
      else navigate('/farmer');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-display text-3xl text-white mb-2">System Login</h2>
          <p className="text-on-surface/70 text-sm">Enter your credentials to access the dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-error/10 border border-error/20 flex items-center gap-2 text-error text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface/80 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-green/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                placeholder="user@herbtrace.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface/80 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-green/20 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-green transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-green text-brand-dark font-semibold py-3 rounded-lg hover:bg-[#00e479] transition-colors"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-on-surface/60">
            Don't have an account? <Link to="/register" className="text-brand-green hover:underline">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
