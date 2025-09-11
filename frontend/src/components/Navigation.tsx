import { LogOut, User, FileText, BarChart3, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clearAuthData, isOfficer } from '../utils/auth';
import { User as UserType } from '../types';

interface NavigationProps {
  user: UserType;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    clearAuthData();
    onLogout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              CivicPortal
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>

              <Link
                to="/report"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Report Issue
              </Link>

              {isOfficer(user) && (
                <Link
                  to="/dashboard"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">{user.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOfficer(user) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;