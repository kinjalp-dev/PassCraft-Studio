import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { TemplatesList } from './pages/TemplatesList';
import { TemplateEditor } from './pages/TemplateEditor';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PublicDownload } from './pages/PublicDownload';
import { useStore } from './store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Public Routes for End Users - App Level Portal */}
        <Route path="/download" element={<PublicDownload />} />
        <Route path="/download/:id" element={<PublicDownload />} />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/admin/templates" element={
          <ProtectedRoute><TemplatesList /></ProtectedRoute>
        } />

        <Route path="/admin/templates/create" element={
          <ProtectedRoute><TemplateEditor /></ProtectedRoute>
        } />

        <Route path="/admin/templates/:id" element={
          <ProtectedRoute><TemplateEditor /></ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute><Users /></ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;