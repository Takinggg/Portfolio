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

// Import admin auth provider
import { AdminAuthProvider } from './context/AdminAuthContext';

// Wrapper component for admin routes with auth provider
const AdminWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminAuthProvider>
    {children}
  </AdminAuthProvider>
);

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main portfolio routes */}
        <Route path="/" element={<App />} />
        
        {/* Widgets demo page */}
        <Route path="/widgets" element={<WidgetsDemo />} />
        
        {/* Admin routes - wrapped with auth provider */}
        <Route path="/admin" element={
          <AdminWrapper>
            <AdminDashboard />
          </AdminWrapper>
        } />
        <Route path="/admin/messages" element={
          <AdminWrapper>
            <AdminMessages />
          </AdminWrapper>
        } />
        <Route path="/admin/agenda" element={
          <AdminWrapper>
            <AdminAgenda />
          </AdminWrapper>
        } />
      </Routes>
    </Router>
  );
};