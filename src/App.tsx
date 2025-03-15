
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
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
import { useUser } from '@/contexts/UserContext';
import { Toaster } from 'sonner';
import Dashboard from '@/pages/Dashboard';
import ProjectIdeasNew from '@/pages/ProjectIdeasNew';
import AdminDashboard from '@/pages/admin/Dashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  admin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, admin = false }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user?.user_metadata?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
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

        {/* User Panel Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/project-ideas/new" element={<ProtectedRoute><ProjectIdeasNew /></ProtectedRoute>} />
        <Route
          path="/user-dashboard"
          element={<ProtectedRoute>
            <MainLayout>
              <UserDashboard />
            </MainLayout>
          </ProtectedRoute>}
        />

        {/* Admin Panel Routes */}
        <Route path="/admin" element={<ProtectedRoute admin><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute admin><Users /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute admin><ProjectsAdmin /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute admin><Messages /></ProtectedRoute>} />
        <Route path="/admin/portfolio" element={<ProtectedRoute admin><PortfolioAdmin /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute admin><Settings /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute admin><Categories /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
      </Routes>
      <Toaster richColors />
    </>
  );
}

export default App;
