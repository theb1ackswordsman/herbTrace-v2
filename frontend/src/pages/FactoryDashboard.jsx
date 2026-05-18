import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode, CheckCircle, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiClient from '../api/client';
import Layout from '../components/Layout';

export default function FactoryDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [batch, setBatch] = useState(null);
  const [quality, setQuality] = useState('A');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize QR Scanner when component mounts
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });
    
    scanner.render(
      (result) => {
        scanner.clear();
        // Assume QR contains the full URL like http://.../track/BT-123, extract ID
        const parts = result.split('/');
        const batchId = parts[parts.length - 1];
        setScanResult(batchId);
        fetchBatch(batchId);
      },
      (error) => { /* Ignore constant scan errors */ }
    );

    return () => { scanner.clear(); };
  }, []);

  const fetchBatch = async (id) => {
    try {
      const res = await apiClient.get(`/batches/${id}`);
      setBatch(res.data);
      if (res.data.status === 'created') {
        // Mark as received automatically
        await apiClient.post(`/batches/${id}/receive`);
        setMessage('Batch marked as Received.');
      }
    } catch (err) {
      setMessage('Error fetching batch.');
    }
  };

  const handleRate = async () => {
    try {
      await apiClient.post(`/batches/${scanResult}/rate`, {
        quality,
        factory_rating: parseInt(rating, 10)
      });
      setMessage('Batch quality rated and hash-chain updated.');
      setBatch(prev => ({ ...prev, status: 'rated' }));
    } catch (err) {
      setMessage('Failed to rate batch.');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-display text-3xl text-white">Factory Operations</h1>
        <p className="text-on-surface/70">Scan incoming herb batches to register receipt and quality.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <motion.div className="glass-panel p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-4">
            <ScanBarcode className="text-brand-green" /> QR Scanner
          </h2>
          {!scanResult ? (
            <div id="reader" className="w-full bg-brand-surface rounded-lg overflow-hidden border border-brand-green/20"></div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle className="text-brand-green mx-auto mb-4" size={48} />
              <p className="text-xl text-white mb-4">Scan Successful</p>
              <button onClick={() => { setScanResult(null); setBatch(null); setMessage(''); }} className="px-4 py-2 border border-brand-green/30 text-brand-green rounded hover:bg-brand-green/10 transition">
                Scan Another Batch
              </button>
            </div>
          )}
        </motion.div>

        <motion.div className="glass-panel p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-4">
            <Search className="text-brand-green" /> Batch Details
          </h2>
          
          {message && (
            <div className="mb-4 p-3 bg-brand-surface border border-brand-green/20 text-brand-green rounded text-sm">
              {message}
            </div>
          )}

          {batch ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-dark/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-on-surface/50">Batch ID</p>
                  <p className="font-mono text-white text-sm break-all">{batch.id}</p>
                </div>
                <div className="bg-brand-dark/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-on-surface/50">Herb</p>
                  <p className="font-semibold text-white">{batch.herb}</p>
                </div>
                <div className="bg-brand-dark/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-on-surface/50">Quantity</p>
                  <p className="font-semibold text-white">{batch.quantity} kg</p>
                </div>
                <div className="bg-brand-dark/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-on-surface/50">Farmer</p>
                  <p className="font-semibold text-white">{batch.users?.name}</p>
                </div>
              </div>

              {batch.image_url && (
                <div className="mt-4">
                  <p className="text-xs text-on-surface/50 mb-2">Harvest Photo</p>
                  <img src={batch.image_url} alt="Harvest" className="w-full h-48 object-cover rounded-lg border border-white/10" />
                </div>
              )}

              {batch.status !== 'rated' && (
                <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-2">Quality Assessment</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-on-surface/50 mb-1">Grade</label>
                      <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full bg-brand-dark border border-brand-green/20 rounded p-2 text-white outline-none">
                        <option value="A+">A+ (Premium)</option>
                        <option value="A">A (Standard)</option>
                        <option value="B">B (Substandard)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-on-surface/50 mb-1">Farmer Rating</label>
                      <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} className="w-full bg-brand-dark border border-brand-green/20 rounded p-2 text-white outline-none" />
                    </div>
                  </div>
                  <button onClick={handleRate} className="w-full bg-brand-green text-brand-dark font-semibold py-2 rounded mt-4 hover:bg-[#00e479] transition">
                    Submit Rating & Hash
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface/40 border border-dashed border-white/10 rounded-lg">
              Waiting for scan...
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </Layout>
  );
}
