import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PublicIssueForm from './components/PublicIssueForm';
import OfficerLogin from './components/OfficerLogin';
import OfficerDashboard from './components/OfficerDashboard';
import Navigation from './components/Navigation';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';
import { User, AuthState } from './types';
import { getStoredUser, isAuthenticated, isOfficer } from './utils/auth';
import { setAuthData } from './utils/auth';

// Protected Route Component
const ProtectedRoute = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  if (!user || !isOfficer(user)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check for existing authentication on app load
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setAuthState({
          user: storedUser,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuthData('mock-token', user);
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        {/* Navigation - show for authenticated users and report page */}
        {(authState.isAuthenticated && authState.user) && (
          <Navigation
            user={authState.user}
            onLogout={handleLogout}
          />
        )}
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<PublicIssueForm />} />
            <Route 
              path="/login" 
              element={
                authState.isAuthenticated && authState.user ? 
                  <Navigate to="/dashboard" replace /> : 
                  <OfficerLogin onLogin={handleLogin} />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute user={authState.user}>
                  <OfficerDashboard user={authState.user!} />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;