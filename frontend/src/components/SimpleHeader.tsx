import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, MessageSquare } from 'lucide-react';

const SimpleHeader = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              CivicPortal
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <Link
              to="/login"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Shield className="w-4 h-4 mr-1" />
              Officer Login
            </Link>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Civic Complaint Portal</h1>
          <p className="text-gray-600">Report issues in your community and help us make it better</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeader;