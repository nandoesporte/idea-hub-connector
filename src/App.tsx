
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import ForgotPassword from '@/pages/ForgotPassword';
import UserDashboard from '@/pages/UserDashboard';
import SubmitIdea from '@/pages/SubmitIdea';
import ProjectTracking from '@/pages/ProjectTracking';
import ProjectDetails from '@/pages/ProjectDetails';
import AdminPanel from '@/pages/AdminPanel';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/admin/Users';
import Projects from '@/pages/admin/Projects';
import Messages from '@/pages/admin/Messages';
import AdminPortfolio from '@/pages/admin/Portfolio';
import Settings from '@/pages/admin/Settings';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';
import Portfolio from '@/pages/Portfolio';
import PortfolioDetails from '@/pages/PortfolioDetails';
import Categories from '@/pages/admin/Categories';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<PortfolioDetails />} />
        
        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/submit-idea" element={<SubmitIdea />} />
          <Route path="/projects" element={<ProjectTracking />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Route>
        
        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/messages" element={<Messages />} />
          <Route path="/admin/portfolio" element={<AdminPortfolio />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/categories" element={<Categories />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
