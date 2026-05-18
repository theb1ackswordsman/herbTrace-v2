import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Box, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';
import HashProof from '../components/HashProof';
import Layout from '../components/Layout';

export default function ConsumerTimeline() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public batch details
        const batchRes = await apiClient.get(`/batches/${batchId}`);
        setBatch(batchRes.data);

        // Fetch cryptographic proof (independent — don't let this kill the page)
        try {
          const verifyRes = await apiClient.get(`/verify/${batchId}`);
          setVerification(verifyRes.data);
        } catch (verifyErr) {
          // Verification may not exist yet if the hash chain hasn't been written
          console.warn('Verification not available yet:', verifyErr.response?.data?.error);
          setVerification(null);
        }

      } catch (err) {
        setError(err.response?.data?.error || 'Batch not found.');
      } finally {
        setLoading(false);
      }
    };
    if (batchId) fetchData();
  }, [batchId]);

  if (loading) return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-green">Loading Traceability Data...</div>;
  
  if (error) return (
    <Layout>
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
        <ShieldAlert className="text-error mb-4" size={48} />
        <h2 className="text-2xl text-white mb-2">Invalid Batch</h2>
        <p className="text-on-surface/70 mb-6">{error}</p>
        <Link to="/" className="text-brand-green hover:underline">Return Home</Link>
      </div>
    </Layout>
  );

  const getTimelineSteps = () => {
    const steps = [
      { id: 1, title: 'Harvested & Registered', date: batch.created_at, desc: `Registered by ${batch.users?.name || 'Farmer'}. Qty: ${batch.quantity}kg`, icon: MapPin, done: true },
      { id: 2, title: 'Received at Factory', date: batch.updated_at, desc: 'Batch arrived at processing facility.', icon: Box, done: batch.status !== 'created' },
      { id: 3, title: 'Quality Assessed', date: batch.updated_at, desc: batch.status === 'rated' || batch.status === 'verified' ? `Graded as ${batch.quality}` : 'Pending assessment', icon: Award, done: batch.status === 'rated' || batch.status === 'verified' },
      { id: 4, title: 'Ready for Retail', date: null, desc: batch.status === 'verified' ? 'Cleared all fraud checks.' : 'Awaiting final clearance.', icon: CheckCircle2, done: batch.status === 'verified' }
    ];
    return steps;
  };

  return (
    <Layout>
      <div className="text-on-surface py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="chip chip-verified mb-4 inline-block">VERIFIED SUPPLY CHAIN</span>
            <h1 className="text-display text-4xl md:text-5xl text-white mb-4">{batch.herb}</h1>
            <p className="text-on-surface/70 font-mono text-sm">Batch ID: {batch.id}</p>
          </motion.div>
        </header>

        {batch.image_url && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
            <img src={batch.image_url} alt="Harvest" className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl border border-white/10" />
            <p className="text-center text-xs text-on-surface/40 mt-2 font-mono">Source Origin Photo</p>
          </motion.div>
        )}

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-white/10"></div>

          <div className="space-y-12 relative">
            {getTimelineSteps().map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex gap-6 ${!step.done ? 'opacity-40' : ''}`}
                >
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-brand-dark ${step.done ? 'bg-brand-surface text-brand-green border-brand-green/20' : 'bg-brand-dark text-on-surface/30 border-white/5'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="pt-3">
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    {step.date && step.done && <p className="text-xs text-on-surface/50 mb-2">{new Date(step.date).toLocaleString()}</p>}
                    <p className="text-on-surface/80">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <HashProof verification={verification} />
        </motion.div>
      </div>
    </div>
    </Layout>
  );
}
