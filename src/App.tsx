import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PublicIssueForm from './components/PublicIssueForm';
import OfficerLogin from './components/OfficerLogin';
import OfficerDashboard from './components/OfficerDashboard';
import Navigation from './components/Navigation';
import { User, AuthState } from './types';
import { getStoredUser, isAuthenticated, isOfficer } from './utils/auth';
import { setAuthData } from './utils/auth';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });
  const [currentView, setCurrentView] = useState('public');

  useEffect(() => {
    // Check for existing authentication
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setAuthState({
          user: storedUser,
          isAuthenticated: true,
          loading: false,
        });
        setCurrentView('dashboard');
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }

    // Listen for officer login navigation
    const handleShowOfficerLogin = () => {
      setCurrentView('officer-login');
    };

    window.addEventListener('showOfficerLogin', handleShowOfficerLogin);
    
    return () => {
      window.removeEventListener('showOfficerLogin', handleShowOfficerLogin);
    };
  }, []);

  const handleLogin = (user: User) => {
    setAuthData('mock-token', user);
    setAuthState({
      user,
      isAuthenticated: true,
      loading: false,
    });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    setCurrentView('public');
  };

  const showOfficerLogin = () => {
    setCurrentView('officer-login');
  };

  const backToPublic = () => {
    setCurrentView('public');
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show officer dashboard if authenticated
  if (authState.isAuthenticated && authState.user && isOfficer(authState.user)) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation
            user={authState.user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={handleLogout}
          />
          <main>
            <OfficerDashboard user={authState.user} />
          </main>
        </div>
      </Router>
    );
  }

  // Show officer login or public form based on current view
  if (currentView === 'officer-login') {
    return <OfficerLogin onLogin={handleLogin} onBackToPublic={backToPublic} />;
  }

  // Default: Show public complaint form
  return <PublicIssueForm />;
}

export default App;