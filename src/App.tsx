
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SubmitIdea from "./pages/SubmitIdea";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProjectTracking from "./pages/ProjectTracking";
import ProjectDetails from "./pages/ProjectDetails";
import AdminPanel from "./pages/AdminPanel";
import Portfolio from "./pages/Portfolio";
import PortfolioDetails from "./pages/PortfolioDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Admin pages
import AdminUsers from "./pages/admin/Users";
import AdminProjects from "./pages/admin/Projects";
import AdminMessages from "./pages/admin/Messages";
import AdminPortfolio from "./pages/admin/Portfolio";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

// Google OAuth Client ID (this should ideally come from environment variables)
const GOOGLE_CLIENT_ID = "558535956476-d3bhilc9hftmapbmtj1v12t0b4ul4o1j.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:id" element={<PortfolioDetails />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/submit-idea" element={<SubmitIdea />} />
                <Route path="/projects" element={<ProjectTracking />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/portfolio" element={<AdminPortfolio />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
