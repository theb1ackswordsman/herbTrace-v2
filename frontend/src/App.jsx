import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import FactoryDashboard from './pages/FactoryDashboard';
import ConsumerTimeline from './pages/ConsumerTimeline';
import RegulatorDashboard from './pages/RegulatorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:batchId" element={<ConsumerTimeline />} />

        {/* Protected Routes — Role Enforced */}
        <Route path="/farmer" element={
          <ProtectedRoute requiredRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/factory" element={
          <ProtectedRoute requiredRole="factory">
            <FactoryDashboard />
          </ProtectedRoute>
        } />
        <Route path="/regulator" element={
          <ProtectedRoute requiredRole="regulator">
            <RegulatorDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
