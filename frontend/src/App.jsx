import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import FactoryDashboard from './pages/FactoryDashboard';
import ConsumerTimeline from './pages/ConsumerTimeline';
import RegulatorDashboard from './pages/RegulatorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/factory" element={<FactoryDashboard />} />
        <Route path="/track/:batchId" element={<ConsumerTimeline />} />
        <Route path="/regulator" element={<RegulatorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
