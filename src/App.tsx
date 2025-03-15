
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import SubmitIdea from '@/pages/SubmitIdea';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import UserDashboard from '@/pages/UserDashboard';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import NotFound from '@/pages/NotFound';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPanel from '@/pages/admin/AdminPanel';
import Users from '@/pages/admin/Users';
import ProjectsAdmin from '@/pages/admin/Projects';
import Messages from '@/pages/admin/Messages';
import PortfolioAdmin from '@/pages/admin/Portfolio';
import Settings from '@/pages/admin/Settings';
import Categories from '@/pages/admin/Categories';
import { Toaster } from 'sonner';
import Dashboard from '@/pages/Dashboard';
import ProjectIdeasNew from '@/pages/ProjectIdeasNew';
import AdminDashboard from '@/pages/admin/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/submit-idea" element={<SubmitIdea />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/project-ideas/new" element={<ProjectIdeasNew />} />
          <Route path="/user-dashboard" element={<MainLayout><UserDashboard /></MainLayout>} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/projects" element={<ProjectsAdmin />} />
          <Route path="/admin/messages" element={<Messages />} />
          <Route path="/admin/portfolio" element={<PortfolioAdmin />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </>
  );
}

export default App;
