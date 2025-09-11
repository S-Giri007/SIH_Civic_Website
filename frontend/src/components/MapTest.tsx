import { useState } from 'react';
import IssueLocationMap from './IssueLocationMap';
import { Issue } from '../types';

const MapTest = () => {
  // Sample test data with coordinates
  const [testIssues] = useState<Issue[]>([
    {
      _id: '1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues',
      category: 'road',
      priority: 'high',
      status: 'pending',
      location: 'Main Street, New York, NY',
      locationCoordinates: {
        lat: 40.7128,
        lng: -74.0060
      },
      images: [],
      citizenId: 'citizen1',
      citizenName: 'John Doe',
      citizenContact: 'john@example.com',
      createdAt: new Date()
    },
    {
      _id: '2',
      title: 'Broken Street Light',
      description: 'Street light not working at intersection',
      category: 'electricity',
      priority: 'medium',
      status: 'in-progress',
      location: 'Broadway & 42nd St, New York, NY',
      locationCoordinates: {
        lat: 40.7589,
        lng: -73.9851
      },
      images: [],
      citizenId: 'citizen2',
      citizenName: 'Jane Smith',
      citizenContact: 'jane@example.com',
      createdAt: new Date()
    },
    {
      _id: '3',
      title: 'Water Leak',
      description: 'Water leak in Central Park',
      category: 'water',
      priority: 'high',
      status: 'resolved',
      location: 'Central Park, New York, NY',
      locationCoordinates: {
        lat: 40.7829,
        lng: -73.9654
      },
      images: [],
      citizenId: 'citizen3',
      citizenName: 'Bob Johnson',
      citizenContact: 'bob@example.com',
      createdAt: new Date()
    }
  ]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Map Test Component</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testIssues.map(issue => (
              <div key={issue._id} className="p-3 border border-gray-200 rounded">
                <h3 className="font-medium">{issue.title}</h3>
                <p className="text-sm text-gray-600">{issue.location}</p>
                <p className="text-xs text-gray-500">
                  {issue.locationCoordinates?.lat.toFixed(4)}, {issue.locationCoordinates?.lng.toFixed(4)}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                  issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <IssueLocationMap
            issues={testIssues}
            selectedIssue={selectedIssue}
            onIssueSelect={setSelectedIssue}
            height="600px"
          />
        </div>

        {selectedIssue && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Selected Issue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">{selectedIssue.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedIssue.description}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedIssue.location}</p>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Status:</strong> {selectedIssue.status}
                </p>
                <p className="text-sm">
                  <strong>Category:</strong> {selectedIssue.category}
                </p>
                <p className="text-sm">
                  <strong>Priority:</strong> {selectedIssue.priority}
                </p>
                <p className="text-sm">
                  <strong>Coordinates:</strong> {selectedIssue.locationCoordinates?.lat.toFixed(6)}, {selectedIssue.locationCoordinates?.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTest;