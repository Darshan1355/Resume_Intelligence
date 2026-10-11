import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import ResumeDetail from './pages/ResumeDetail';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Matching from './pages/Matching';
import Recommendations from './pages/Recommendations';
import Interview from './pages/Interview';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState message="Verifying authentication session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated SaaS Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Resumes />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Jobs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <JobDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matching"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Matching />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Recommendations />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Interview />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Catch All */}
        <Route
          path="*"
          element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
