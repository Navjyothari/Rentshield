import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Landing } from './pages/root/Landing';
import { NotFound } from './pages/root/NotFound';
import { HeatmapPage } from './pages/public/HeatmapPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { ReportIssue } from './pages/tenant/ReportIssue';
import { TenantDashboard } from './pages/tenant/TenantDashboard';
import { LandlordDashboard } from './pages/landlord/LandlordDashboard';
import { DAODashboard } from './pages/dao/DAODashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { IssueDetail } from './pages/issues/IssueDetail';

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="rentshield-theme">
        <AuthProvider> 
          <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary/30">
            <Navbar />
            
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public Roots */}
                <Route path="/" element={<Landing />} />
                <Route path="/map" element={<HeatmapPage />} />
                
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/issues/:id" element={<IssueDetail />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                  <Route path="/report" element={<ReportIssue />} />
                  <Route path="/dashboard/tenant" element={<TenantDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
                  <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['dao_member']} />}>
                  <Route path="/dashboard/dao" element={<DAODashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                </Route>

                {/* Catch All */}
                <Route path="/unauthorized" element={<div className="p-12 text-center text-xl text-destructive">Restricted Access Module</div>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
          </div>

          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'font-body text-sm',
              style: {
                background: 'hsl(var(--secondary))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem'
              }
            }} 
          />
        </AuthProvider>
      </ThemeProvider> 
    </BrowserRouter>
  );
}

export default App;
