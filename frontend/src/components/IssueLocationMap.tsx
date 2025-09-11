import { useState, useEffect, useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, Loader, ExternalLink } from 'lucide-react';
import { Issue } from '../types';
import { geocodeAddress, isValidCoordinates, parseCoordinatesFromString, generateSampleCoordinates } from '../utils/geocoding';

interface IssueLocationMapProps {
  issues: Issue[];
  selectedIssue?: Issue | null;
  onIssueSelect?: (issue: Issue) => void;
  height?: string;
  showControls?: boolean;
}

const IssueLocationMap: React.FC<IssueLocationMapProps> = ({
  issues,
  selectedIssue,
  onIssueSelect,
  height = "400px",
  showControls = true
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [issuesWithCoords, setIssuesWithCoords] = useState<Issue[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markerGroupRef = useRef<any>(null);

  // Process issues to ensure they have coordinates
  useEffect(() => {
    const processIssues = async () => {
      const processedIssues: Issue[] = [];
      
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        let coordinates = issue.locationCoordinates;
        
        // If no coordinates, try to get them from the location string
        if (!isValidCoordinates(coordinates)) {
          // First try to parse coordinates from the location string
          coordinates = parseCoordinatesFromString(issue.location);
          
          // If still no coordinates, try geocoding the address
          if (!coordinates && issue.location) {
            try {
              coordinates = await geocodeAddress(issue.location);
            } catch (error) {
              console.warn('Failed to geocode address:', issue.location, error);
            }
          }
          
          // Don't generate sample coordinates - use real data only
          if (!coordinates) {
            console.log('No coordinates available for issue:', issue.title, 'skipping map display');
          }
        }
        
        if (coordinates && isValidCoordinates(coordinates)) {
          processedIssues.push({
            ...issue,
            locationCoordinates: coordinates
          });
        } else {
          console.warn('Could not determine valid coordinates for issue:', issue.title, issue.location);
        }
      }
      
      setIssuesWithCoords(processedIssues);
    };
    
    if (issues.length > 0) {
      processIssues();
    } else {
      setIssuesWithCoords([]);
    }
  }, [issues]);

  // Filter issues based on selected filters
  const filteredIssues = issuesWithCoords.filter(issue => {
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  // Debug log
  console.log('Total issues:', issues.length);
  console.log('Issues with coordinates:', issuesWithCoords.length);
  console.log('Filtered issues for map:', filteredIssues.length);

  // Initialize Leaflet map
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // Reset error state on retry
        setMapError(false);
        
        // Load Leaflet if not already loaded
        if (!(window as any).L) {
          await loadLeaflet();
        }

        const L = (window as any).L;
        
        // Wait a bit for the container to be properly sized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if container has dimensions
        if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
          throw new Error('Map container has no dimensions');
        }
        
        // Default center (you can adjust this based on your region)
        const defaultCenter = [40.7128, -74.0060]; // New York City
        
        // Create map
        mapInstanceRef.current = L.map(mapRef.current, {
          center: defaultCenter,
          zoom: 10,
          zoomControl: false, // We'll add custom controls
        });

        // Add tile layer (OpenStreetMap)
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        });
        
        // Wait for tile layer to load
        await new Promise((resolve, reject) => {
          tileLayer.on('load', resolve);
          tileLayer.on('tileerror', reject);
          tileLayer.addTo(mapInstanceRef.current);
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(null), 10000);
        });

        // Create marker group for better performance
        markerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

        // Force map to invalidate size (important for proper rendering)
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

        setMapLoaded(true);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map (attempt ' + (retryCount + 1) + '):', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log('Retrying map initialization in 2 seconds...');
          setTimeout(() => {
            initializeMap();
          }, 2000);
        } else {
          setMapError(true);
        }
      }
    };

    // Add a small delay before initializing to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 200);

    return () => {
      clearTimeout(timer);
      // Cleanup existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [retryKey]); // Add retryKey to dependencies to trigger re-initialization

  // Load Leaflet library
  const loadLeaflet = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).L) {
        resolve();
        return;
      }

      console.log('Loading Leaflet library...');

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.onerror = () => {
        console.warn('Failed to load Leaflet CSS, trying alternative CDN...');
        // Try alternative CDN
        const altCssLink = document.createElement('link');
        altCssLink.rel = 'stylesheet';
        altCssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(altCssLink);
      };
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('Leaflet library loaded successfully');
        // Wait a bit for Leaflet to fully initialize
        setTimeout(() => resolve(), 100);
      };
      script.onerror = () => {
        console.warn('Failed to load Leaflet from unpkg, trying alternative CDN...');
        // Try alternative CDN
        const altScript = document.createElement('script');
        altScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        altScript.onload = () => {
          console.log('Leaflet library loaded from alternative CDN');
          setTimeout(() => resolve(), 100);
        };
        altScript.onerror = () => reject(new Error('Failed to load Leaflet from all CDNs'));
        document.head.appendChild(altScript);
      };
      document.head.appendChild(script);
    });
  };

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current || !mapLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    try {
      // Clear existing markers
      markerGroupRef.current.clearLayers();
      markersRef.current = [];

      if (filteredIssues.length === 0) {
        // No issues to display, center on default location
        mapInstanceRef.current.setView([40.7128, -74.0060], 10);
        return;
      }

    // Add markers for each issue
    const bounds = L.latLngBounds();
    let validMarkersCount = 0;
    
    filteredIssues.forEach((issue) => {
      if (!issue.locationCoordinates?.lat || !issue.locationCoordinates?.lng) return;

      const lat = issue.locationCoordinates.lat;
      const lng = issue.locationCoordinates.lng;

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn('Invalid coordinates for issue:', issue.title, lat, lng);
        return;
      }

      // Create custom marker based on status
      const markerColor = getMarkerColor(issue.status);
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="w-6 h-6 ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            ${selectedIssue?._id === issue._id ? 
              '<div class="absolute -top-1 -left-1 w-8 h-8 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>' : 
              ''
            }
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      try {
        // Create marker
        const marker = L.marker([lat, lng], { icon: markerIcon })
          .bindPopup(createPopupContent(issue))
          .addTo(markerGroupRef.current);

        // Add click handler
        marker.on('click', () => {
          if (onIssueSelect) {
            onIssueSelect(issue);
          }
        });

        markersRef.current.push(marker);
        bounds.extend([lat, lng]);
        validMarkersCount++;
      } catch (error) {
        console.error('Error creating marker for issue:', issue.title, error);
      }
    });

    // Fit map to show all markers only if we have valid bounds
    try {
      if (validMarkersCount > 0 && bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else if (validMarkersCount === 0) {
        // No valid markers, center on default location
        mapInstanceRef.current.setView([40.7128, -74.0060], 10);
      }
    } catch (error) {
      console.error('Error fitting bounds:', error);
      // Fallback to default view
      mapInstanceRef.current.setView([40.7128, -74.0060], 10);
    }
    } catch (error) {
      console.error('Error updating markers:', error);
      setMapError(true);
    }
  }, [filteredIssues, selectedIssue, mapLoaded]);

  // Get marker color based on issue status
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Create popup content for markers
  const createPopupContent = (issue: Issue) => {
    const statusColor = getMarkerColor(issue.status).replace('bg-', '');
    return `
      <div class="p-2 min-w-48">
        <h3 class="font-semibold text-sm mb-1">${issue.title}</h3>
        <div class="flex items-center mb-2">
          <span class="px-2 py-1 text-xs rounded-full bg-${statusColor}-100 text-${statusColor}-800">
            ${issue.status.replace('-', ' ')}
          </span>
        </div>
        <p class="text-xs text-gray-600 mb-2 line-clamp-2">${issue.description}</p>
        <div class="text-xs text-gray-500">
          <div class="flex items-center mb-1">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            ${issue.location}
          </div>
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
            </svg>
            ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>
    `;
  };

  // Zoom controls
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Center on selected issue
  useEffect(() => {
    if (selectedIssue?.locationCoordinates && mapInstanceRef.current) {
      const { lat, lng } = selectedIssue.locationCoordinates;
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  }, [selectedIssue]);

  // Open in external maps
  const openInMaps = () => {
    if (filteredIssues.length > 0) {
      // Open with first issue location or selected issue
      const issue = selectedIssue || filteredIssues[0];
      if (issue.locationCoordinates) {
        const { lat, lng } = issue.locationCoordinates;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Issue Locations</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredIssues.length} of {issuesWithCoords.length} issues with coordinates
              {issuesWithCoords.length < issues.length && (
                <span className="text-yellow-600 ml-2">
                  ({issues.length - issuesWithCoords.length} issues missing location data)
                </span>
              )}
            </p>
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height }}>
        {mapError ? (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Map could not be loaded</p>
              <p className="text-xs text-gray-500 mb-4">Please check your internet connection</p>
              <button
                onClick={() => {
                  setMapError(false);
                  setMapLoaded(false);
                  setRetryKey(prev => prev + 1);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Loading Map
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={mapRef}
              className="w-full h-full bg-gray-100"
            />
            
            {/* Loading Overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {mapLoaded && issuesWithCoords.length === 0 && issues.length > 0 && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-600">Processing issue locations...</p>
                  <p className="text-xs text-gray-500 mt-1">Geocoding addresses and generating coordinates</p>
                </div>
              </div>
            )}

            {/* Map Controls */}
            {mapLoaded && (
              <div className="absolute top-4 right-4 flex flex-col space-y-1">
                <button
                  onClick={zoomIn}
                  className="bg-white shadow-md p-2 rounded hover:bg-gray-50 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={zoomOut}
                  className="bg-white shadow-md p-2 rounded hover:bg-gray-50 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={openInMaps}
                  className="bg-white shadow-md p-2 rounded hover:bg-gray-50 transition-colors"
                  title="Open in Maps"
                >
                  <ExternalLink className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 font-medium">Status Legend:</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Rejected</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Click markers for details • {filteredIssues.length} locations shown
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueLocationMap;