import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'factory' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 text-brand-green font-display font-semibold text-2xl mb-8">
        <Leaf /> HerbTrace
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl text-white font-semibold mb-2 flex items-center justify-center gap-2">
            <UserPlus /> System Registration
          </h1>
          <p className="text-on-surface/70 text-sm">Create an employee account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-brand-green/10 border border-brand-green/20 rounded text-brand-green text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-on-surface/80 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface/80 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface/80 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface/80 mb-1">Role</label>
            <select 
              className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="factory">Factory Worker</option>
              <option value="regulator">Regulator / Auditor</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || success !== ''}
            className="w-full mt-6 bg-brand-green hover:bg-[#00e479] text-brand-dark font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-on-surface/60">
            Already have an account? <Link to="/login" className="text-brand-green hover:underline">Login here</Link>
          </p>
          <p className="text-on-surface/40 mt-4 text-xs italic">Note: Farmers are registered internally by Regulators.</p>
        </div>
      </motion.div>
    </div>
  );
}
