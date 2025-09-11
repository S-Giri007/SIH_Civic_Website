import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Eye,
  Edit3,
  MapPin,
  Calendar,
  User,
  Phone,
  X,
  Save,
  Map
} from 'lucide-react';
import { Issue } from '../types';
import { getIssues, updateIssue } from '../services/mongodb';
import IssueLocationMap from './IssueLocationMap';
import SingleLocationMap from './SingleLocationMap';

interface OfficerDashboardProps {
  user: any;
}

const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ user }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { getIssues } = await import('../services/mongodb');
        const response = await getIssues({ limit: 10000 }); // Get more issues for dashboard
        
        // Debug: Log the raw response to see what coordinates we're getting
        console.log('Raw issues from backend:', response.issues.map(issue => ({
          title: issue.title,
          location: issue.location,
          locationCoordinates: issue.locationCoordinates
        })));
        
        // Use the issues as they come from the backend (with real coordinates)
        console.log('Issues with coordinates:', response.issues.filter(issue => issue.locationCoordinates).length);
        console.log('Issues without coordinates:', response.issues.filter(issue => !issue.locationCoordinates).length);
        
        setIssues(response.issues);
        setFilteredIssues(response.issues);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        // Set empty array on error
        setIssues([]);
        setFilteredIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    setFilteredIssues(filtered);
  }, [searchTerm, statusFilter, categoryFilter, issues]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string, notes?: string) => {
    try {
      const { updateIssue } = await import('../services/mongodb');
      const updatedIssue = await updateIssue(issueId, {
        status: newStatus as Issue['status'],
        notes,
        assignedOfficer: user._id
      });

      const updatedIssues = issues.map(issue =>
        issue._id === issueId ? updatedIssue : issue
      );
      setIssues(updatedIssues);

      if (selectedIssue && selectedIssue._id === issueId) {
        setSelectedIssue(updatedIssue);
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating issue:', error);
      alert(error.message || 'Failed to update issue');
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              {user.role === 'officer' ? 'Municipal Officer' : 'Officer'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600">Total Issues</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                <p className="text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="road">Road</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="garbage">Garbage</option>
                <option value="park">Parks</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {showMap && !selectedIssue && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Issue Locations Map</h2>
                <p className="text-sm text-gray-600">
                  {issues.filter(i => i.locationCoordinates).length} of {issues.length} issues have location coordinates
                </p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                title="Hide Map"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <strong>Debug Info:</strong> 
                <span className="ml-2">
                  Total Issues: {issues.length}, 
                  With Coordinates: {issues.filter(i => i.locationCoordinates).length},
                  Sample Coordinates Added: {issues.filter(i => i.locationCoordinates && !i.location.includes('lat')).length}
                </span>
              </div>
            )}
            
            <div className="relative z-10">
              <IssueLocationMap
                key={`map-${showMap}`} // Force re-initialization when map is shown
                issues={issues}
                selectedIssue={selectedIssue}
                onIssueSelect={setSelectedIssue}
                height="500px"
              />
            </div>
          </div>
        )}

        {/* Toggle Map Button */}
        {!showMap && (
          <div className="mb-6">
            <button
              onClick={() => setShowMap(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Map className="w-4 h-4 mr-2" />
              Show Map ({issues.filter(i => i.locationCoordinates).length} locations)
            </button>
          </div>
        )}

        {/* Issues List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Issues List</h2>
          <div className="text-sm text-gray-600">
            {filteredIssues.length} of {issues.length} issues
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                    <span className={`font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {issue.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <>
          <style>{`
            .leaflet-container,
            .leaflet-control-container,
            .leaflet-pane,
            .leaflet-map-pane {
              z-index: 1 !important;
            }
          `}</style>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
            style={{ zIndex: 9999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedIssue(null);
                setIsEditing(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto relative" 
              style={{ zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Issue Details</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIssue(null);
                      setIsEditing(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedIssue.title}</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('-', ' ')}
                    </span>
                    <span className={`font-medium ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority} priority
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div>{selectedIssue.location}</div>
                        {selectedIssue.locationCoordinates && (
                          <div className="text-xs text-gray-500 mt-1">
                            Coordinates: {selectedIssue.locationCoordinates.lat.toFixed(6)}, {selectedIssue.locationCoordinates.lng.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      {selectedIssue.citizenName}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      {selectedIssue.citizenContact}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {selectedIssue.createdAt ? new Date(selectedIssue.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedIssue.description}</p>

                  {/* Location Map */}
                  {selectedIssue.locationCoordinates && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Location Map</h4>
                      <SingleLocationMap
                        latitude={selectedIssue.locationCoordinates.lat}
                        longitude={selectedIssue.locationCoordinates.lng}
                        address={selectedIssue.location}
                        title={selectedIssue.title}
                        height="200px"
                        showControls={true}
                      />
                    </div>
                  )}

                  {selectedIssue.images && selectedIssue.images.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssue.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Issue ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['pending', 'in-progress', 'resolved', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedIssue._id!, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIssue.status === status
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Officer Notes
                    </label>
                    <textarea
                      placeholder="Add notes about actions taken or updates..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      defaultValue={selectedIssue.notes || ''}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
    </div>
        </>
      )}
    </div>
  );
};

export default OfficerDashboard;