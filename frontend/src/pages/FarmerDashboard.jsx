import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, List, Smartphone } from 'lucide-react';
import apiClient from '../api/client';
import Layout from '../components/Layout';

export default function FarmerDashboard() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await apiClient.get('/batches');
      // For demo purposes, we fetch all. In reality, backend filters by req.user.id
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-display text-3xl text-white">Farmer Portal</h1>
          <p className="text-on-surface/70">Manage your harvests and view supply chain status.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <motion.div className="glass-panel p-6 bg-brand-green/5 border-brand-green/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Smartphone className="text-brand-green mb-4" size={32} />
              <h2 className="text-xl text-white font-semibold mb-2">WhatsApp Integration Active</h2>
              <p className="text-on-surface/70 text-sm mb-4">
                You can submit new batches simply by sending a message to our WhatsApp bot. No app needed!
              </p>
              <div className="font-mono text-brand-green bg-brand-dark p-3 rounded text-center">
                +1 415 523 8886
              </div>
            </motion.div>

            <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-4">
                <Upload className="text-brand-green" /> Web Submission
              </h2>
              <p className="text-on-surface/50 text-sm italic mb-4">Web submission is currently disabled. Please use the WhatsApp bot to register batches with photos and GPS.</p>
              <button disabled className="w-full bg-brand-surface border border-white/10 text-on-surface/50 font-semibold py-2 rounded cursor-not-allowed">
                Submit via Web (Unavailable)
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div className="glass-panel p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-6">
                <List className="text-brand-green" /> My Recent Batches
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-on-surface/50 text-sm">
                      <th className="pb-3 font-medium">Batch ID</th>
                      <th className="pb-3 font-medium">Herb</th>
                      <th className="pb-3 font-medium">Qty</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(batch => (
                      <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-sm text-white/80">{batch.id}</td>
                        <td className="py-4 text-white font-medium">{batch.herb}</td>
                        <td className="py-4 text-white/80">{batch.quantity} kg</td>
                        <td className="py-4">
                          <span className={`chip ${batch.status === 'rated' || batch.status === 'verified' ? 'chip-verified' : 'chip-pending'}`}>
                            {batch.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-brand-green font-bold">
                          {batch.quality || '-'}
                        </td>
                      </tr>
                    ))}
                    {batches.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-on-surface/40">No batches found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
