import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import existing components
import App from './App';

// Import admin components
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminAgenda } from './pages/admin/AdminAgenda';

// Import demo page
import { WidgetsDemo } from './pages/WidgetsDemo';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main portfolio routes */}
        <Route path="/" element={<App />} />
        
        {/* Widgets demo page */}
        <Route path="/widgets" element={<WidgetsDemo />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/agenda" element={<AdminAgenda />} />
      </Routes>
    </Router>
  );
};