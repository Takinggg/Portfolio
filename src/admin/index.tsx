import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminSchedulingLayout from './AdminSchedulingLayout';
import '../index.css';

const handleLogout = () => {
  window.location.href = '/';
};

// Check if we're on the admin scheduling route
if (window.location.pathname === '/admin/scheduling') {
  const container = document.getElementById('root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <AdminSchedulingLayout onLogout={handleLogout} />
      </React.StrictMode>
    );
  }
}