import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode, CheckCircle, Search, List, RotateCcw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiClient from '../api/client';
import Layout from '../components/Layout';

export default function FactoryDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [batch, setBatch] = useState(null);
  const [quality, setQuality] = useState('A');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [recentBatches, setRecentBatches] = useState([]);
  const [scannerKey, setScannerKey] = useState(0); // forces scanner remount
  const scannerRef = useRef(null);

  // Fetch recent batches on mount
  useEffect(() => {
    fetchRecentBatches();
  }, []);

  // Initialize QR scanner whenever scannerKey changes (mount + "Scan Another")
  useEffect(() => {
    if (scanResult) return; // Don't init if we already have a result

    // Small delay to ensure the #reader div is in the DOM
    const timer = setTimeout(() => {
      const readerEl = document.getElementById('reader');
      if (!readerEl) return;

      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scannerRef.current = scanner;

      scanner.render(
        (result) => {
          scanner.clear().catch(() => {});
          const parts = result.split('/');
          const batchId = parts[parts.length - 1];
          setScanResult(batchId);
          fetchBatch(batchId);
        },
        () => { /* Ignore continuous scan errors */ }
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerKey, scanResult]);

  const fetchRecentBatches = async () => {
    try {
      const res = await apiClient.get('/batches');
      // Show batches that have been received or rated (factory activity)
      const processed = res.data.filter(b => b.status !== 'created');
      setRecentBatches(processed.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch recent batches');
    }
  };

  const fetchBatch = async (id) => {
    try {
      const res = await apiClient.get(`/batches/${id}`);
      setBatch(res.data);
      if (res.data.status === 'created') {
        await apiClient.post(`/batches/${id}/receive`);
        setMessage('Batch marked as Received.');
      }
    } catch (err) {
      setMessage('Error fetching batch. Check that the batch ID is valid.');
    }
  };

  const handleRate = async () => {
    try {
      await apiClient.post(`/batches/${scanResult}/rate`, {
        quality,
        factory_rating: parseInt(rating, 10)
      });
      setMessage('Batch quality rated and hash-chain updated.');
      setBatch(prev => ({ ...prev, status: 'rated', quality }));
      // Refresh recent activity
      fetchRecentBatches();
    } catch (err) {
      setMessage('Failed to rate batch.');
    }
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setBatch(null);
    setMessage('');
    setQuality('A');
    setRating(5);
    // Increment key to force a fresh scanner mount
    setScannerKey(prev => prev + 1);
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
            <div key={scannerKey} id="reader" className="w-full bg-brand-surface rounded-lg overflow-hidden border border-brand-green/20"></div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle className="text-brand-green mx-auto mb-4" size={48} />
              <p className="text-xl text-white mb-4">Scan Successful</p>
              <button onClick={handleScanAnother} className="flex items-center gap-2 mx-auto px-4 py-2 border border-brand-green/30 text-brand-green rounded hover:bg-brand-green/10 transition">
                <RotateCcw size={16} /> Scan Another Batch
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

              {batch.status === 'rated' && (
                <div className="mt-4 p-3 bg-brand-green/10 border border-brand-green/20 rounded text-brand-green text-sm text-center">
                  ✅ Quality graded as <span className="font-bold">{batch.quality}</span> — Hash chain updated
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

      {/* Recent Activity Section */}
      <motion.div
        className="glass-panel p-0 max-w-6xl mx-auto mt-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl text-white font-semibold flex items-center gap-2">
            <List className="text-brand-green" /> Recent Activity
          </h2>
        </div>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-brand-dark z-10">
              <tr className="bg-white/5 text-on-surface/70 text-sm">
                <th className="p-4 font-medium">Batch ID</th>
                <th className="p-4 font-medium">Herb</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Farmer</th>
                <th className="p-4 font-medium">Grade</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map(b => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-white/80">{b.id}</td>
                  <td className="p-4 text-white font-medium">{b.herb}</td>
                  <td className="p-4 text-white/80">{b.quantity} kg</td>
                  <td className="p-4 text-on-surface/70">{b.users?.name || '-'}</td>
                  <td className="p-4 text-brand-green font-bold">{b.quality || '-'}</td>
                  <td className="p-4">
                    <span className={`chip ${b.status === 'rated' || b.status === 'verified' ? 'chip-verified' : b.status === 'flagged' ? 'chip-danger' : 'chip-pending'}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBatches.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface/40">No batches processed yet. Scan a QR code above to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
    </Layout>
  );
}
