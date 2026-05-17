import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Leaf, Activity } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-brand-dark">
      {/* Background Motifs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-green/5 via-brand-dark to-brand-dark"></div>
      
      <main className="z-10 text-center px-4 max-w-5xl mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green mb-8 text-sm font-mono">
            <ShieldCheck size={16} />
            <span>SHA-256 Cryptographic Traceability</span>
          </div>
          
          <h1 className="text-display text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Transparent Supply Chain for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">Digital Nature</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface/80 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            Immutable tracking from harvest to shelf. Empowering farmers via WhatsApp, securing data with hash-chained audit logs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="px-8 py-4 bg-brand-green text-brand-dark font-semibold rounded-lg hover:bg-[#00e479] transition-colors shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              System Login
            </Link>
            <Link to="/track/demo" className="px-8 py-4 glass-panel text-white hover:bg-brand-surface transition-colors font-semibold">
              Track a Batch
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            { icon: Leaf, title: 'Zero-App Onboarding', desc: 'Farmers submit batches instantly via WhatsApp.' },
            { icon: ShieldCheck, title: 'Hash-Chain Ledger', desc: 'Every step is immutably linked via SHA-256.' },
            { icon: Activity, title: 'Fraud Detection', desc: '4-factor algorithmic risk scoring engine.' }
          ].map((feat, i) => (
            <div key={i} className="glass-panel p-6 text-left">
              <feat.icon className="text-brand-green mb-4" size={24} />
              <h3 className="font-display font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-on-surface/70 font-sans">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
