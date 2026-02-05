import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import ProviderList from './pages/ProviderList';
import BookingPage from './pages/BookingPage';
import ProviderDashboard from './pages/ProviderDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import MyAppointments from './pages/MyAppointments';
import ProfileSettings from './pages/ProfileSettings';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component to redirect logged-in users away from auth pages
const RedirectIfLoggedIn = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes with Redirect if Logged In */}
        <Route path="/login" element={
          <RedirectIfLoggedIn>
            <LoginPage />
          </RedirectIfLoggedIn>
        } />
        <Route path="/register" element={
          <RedirectIfLoggedIn>
            <RegisterPage />
          </RedirectIfLoggedIn>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        } />
        <Route path="/profile-settings" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />

        {/* Service and Booking Routes */}
        <Route path="/services/:category" element={<ProviderList />} />
        <Route path="/book/:serviceId" element={<BookingPage />} />
      </Routes>
    </div>
  );
}

export default App;
