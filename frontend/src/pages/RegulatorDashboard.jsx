import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, Activity, Users, UserPlus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import apiClient from '../api/client';
import Layout from '../components/Layout';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RegulatorDashboard() {
  const [fraudData, setFraudData] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Farmer Registration State
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [regMsg, setRegMsg] = useState({ type: '', text: '' });
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fraudRes, farmersRes] = await Promise.all([
        apiClient.get('/regulator/fraud'),
        apiClient.get('/regulator/farmers')
      ]);
      setFraudData(fraudRes.data);
      setFarmers(farmersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/regulator/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'flagged_batches.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error exporting CSV or no high-risk batches found.");
    }
  };

  const handleRegisterFarmer = async (e) => {
    e.preventDefault();
    setRegMsg({ type: '', text: '' });
    setRegLoading(true);

    try {
      // Ensure it starts with whatsapp:
      let formattedPhone = farmerPhone.trim();
      if (!formattedPhone.startsWith('whatsapp:')) {
        formattedPhone = `whatsapp:${formattedPhone.startsWith('+') ? formattedPhone : '+' + formattedPhone}`;
      }

      await apiClient.post('/auth/register', {
        name: farmerName,
        phone: formattedPhone,
        role: 'farmer'
      });

      setRegMsg({ type: 'success', text: `Farmer ${farmerName} registered. They can now submit batches via WhatsApp.` });
      setFarmerName('');
      setFarmerPhone('');
      
      // Refresh list
      const farmersRes = await apiClient.get('/regulator/farmers');
      setFarmers(farmersRes.data);
    } catch (err) {
      setRegMsg({ type: 'error', text: err.response?.data?.error || 'Registration failed' });
    } finally {
      setRegLoading(false);
    }
  };

  const getChartData = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    fraudData.forEach(item => {
      if (counts[item.risk_level] !== undefined) counts[item.risk_level]++;
    });

    return {
      labels: ['High Risk', 'Medium Risk', 'Low Risk'],
      datasets: [
        {
          data: [counts.high, counts.medium, counts.low],
          backgroundColor: ['#ffb4ab', '#F59E0B', '#00FF88'],
          borderColor: ['#93000a', '#b45309', '#007139'],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: { legend: { labels: { color: '#dae6d8' } } },
    cutout: '70%'
  };

  if (loading) return <div className="min-h-screen bg-brand-dark"></div>;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-3xl text-white">Regulator Control Center</h1>
            <p className="text-on-surface/70">Monitor supply chain integrity and manage rural onboarding.</p>
          </div>
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-surface border border-brand-green/30 text-brand-green rounded hover:bg-brand-green/10 transition">
            <Download size={18} /> Export Flagged CSV
          </button>
        </header>

        {/* Fraud Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div className="glass-panel p-6 lg:col-span-1 flex flex-col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-6">
              <Activity className="text-brand-green" /> Risk Distribution
            </h2>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              {fraudData.length > 0 ? (
                <Doughnut data={getChartData()} options={chartOptions} />
              ) : (
                <p className="text-on-surface/40">No analysis data available.</p>
              )}
            </div>
          </motion.div>

          <motion.div className="glass-panel p-0 lg:col-span-2 overflow-hidden" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                <ShieldAlert className="text-error" /> Algorithmic Analysis Logs
              </h2>
            </div>
            
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-brand-dark z-10">
                  <tr className="bg-white/5 text-on-surface/70 text-sm">
                    <th className="p-4 font-medium">Batch ID</th>
                    <th className="p-4 font-medium">Herb / Farmer</th>
                    <th className="p-4 font-medium">Risk Score</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {fraudData.map(row => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-xs text-white/80">{row.batch_id}</td>
                      <td className="p-4">
                        <p className="text-white font-medium">{row.batches?.herb}</p>
                        <p className="text-xs text-on-surface/50">{row.batches?.users?.name}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-white">{(row.risk_score * 100).toFixed(1)}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`chip ${row.risk_level === 'high' ? 'chip-danger' : row.risk_level === 'medium' ? 'chip-pending' : 'chip-verified'}`}>
                          {row.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {row.factors.hashIntegrity?.risk > 0 && <span title="Hash Mismatch" className="w-2 h-2 rounded-full bg-error"></span>}
                          {row.factors.location?.risk > 0 && <span title="Location Anomaly" className="w-2 h-2 rounded-full bg-brand-amber"></span>}
                          {row.factors.quantity?.risk > 0 && <span title="Quantity Anomaly" className="w-2 h-2 rounded-full bg-brand-amber"></span>}
                          {row.factors.reputation?.risk > 0 && <span title="Low Reputation" className="w-2 h-2 rounded-full bg-brand-amber"></span>}
                          {row.risk_score === 0 && <span className="text-xs text-on-surface/50">Clean</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fraudData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-on-surface/40">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Farmer Registry Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div className="glass-panel p-6 lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl text-white font-semibold flex items-center gap-2 mb-6">
              <UserPlus className="text-brand-green" /> Register Farmer
            </h2>
            
            {regMsg.text && (
              <div className={`mb-4 p-3 rounded text-sm ${regMsg.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-error/10 text-error border border-error/20'}`}>
                {regMsg.text}
              </div>
            )}

            <form onSubmit={handleRegisterFarmer} className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface/80 mb-1">Farmer Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Singh"
                  className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface/80 mb-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="+919876543210"
                  className="w-full bg-brand-dark/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors font-mono text-sm"
                  value={farmerPhone}
                  onChange={e => setFarmerPhone(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={regLoading}
                className="w-full mt-4 bg-brand-green/20 text-brand-green border border-brand-green/30 hover:bg-brand-green/30 font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
              >
                {regLoading ? 'Registering...' : 'Onboard Farmer'}
              </button>
            </form>
          </motion.div>

          <motion.div className="glass-panel p-0 lg:col-span-2 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                <Users className="text-brand-green" /> Registered Farmers Registry
              </h2>
            </div>
            
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-brand-dark z-10">
                  <tr className="bg-white/5 text-on-surface/70 text-sm">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">WhatsApp Identity</th>
                    <th className="p-4 font-medium">Reputation</th>
                    <th className="p-4 font-medium">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map(farmer => (
                    <tr key={farmer.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{farmer.name}</td>
                      <td className="p-4 font-mono text-sm text-on-surface/80">{farmer.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${farmer.reputation >= 4.0 ? 'bg-brand-green/20 text-brand-green' : farmer.reputation >= 3.0 ? 'bg-brand-amber/20 text-brand-amber' : 'bg-error/20 text-error'}`}>
                          {farmer.reputation.toFixed(2)} / 5.00
                        </span>
                      </td>
                      <td className="p-4 text-xs text-on-surface/50">
                        {new Date(farmer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {farmers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-on-surface/40">No farmers registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

      </div>
    </Layout>
  );
}
