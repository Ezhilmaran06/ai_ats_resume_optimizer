import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Authenticated Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MasterProfilePage from './pages/dashboard/MasterProfilePage';
import ResumeManagerPage from './pages/dashboard/ResumeManagerPage';
import ResumeBuilderPage from './pages/dashboard/ResumeBuilderPage';
import ResumeTemplatesGallery from './pages/dashboard/ResumeTemplatesGallery';
import JobAnalyzerPage from './pages/dashboard/JobAnalyzerPage';
import SavedJobsPage from './pages/dashboard/SavedJobsPage';
import ResumeOptimizerPage from './pages/dashboard/ResumeOptimizerPage';
import AtsAnalyzerPage from './pages/dashboard/AtsAnalyzerPage';
import SkillGapPage from './pages/dashboard/SkillGapPage';
import ApplicationTrackerPage from './pages/dashboard/ApplicationTrackerPage';
import InterviewPrepPage from './pages/dashboard/InterviewPrepPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Route Guard component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: '#64748B' }}>Verifying session...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<MasterProfilePage />} />
              <Route path="resumes" element={<ResumeManagerPage />} />
              <Route path="builder" element={<ResumeBuilderPage />} />
              <Route path="builder/:id" element={<ResumeBuilderPage />} />
              <Route path="templates" element={<ResumeTemplatesGallery />} />
              <Route path="jobs/analyze" element={<JobAnalyzerPage />} />
              <Route path="jobs" element={<SavedJobsPage />} />
              <Route path="optimizer" element={<ResumeOptimizerPage />} />
              <Route path="ats" element={<AtsAnalyzerPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="applications" element={<ApplicationTrackerPage />} />
              <Route path="interview" element={<InterviewPrepPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
