import { useState, useEffect, useRef } from 'react';
import { MapPin, Crosshair, Navigation, AlertCircle, Map, Loader, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

interface EmbeddedMapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const EmbeddedMapPicker: React.FC<EmbeddedMapPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [address, setAddress] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Leaflet map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = (window as any).L;
        if (!L) {
          // Load Leaflet if not already loaded
          await loadLeaflet();
        }

        const leaflet = (window as any).L;
        
        // Default location (center of a typical city)
        const defaultLocation = selectedLocation || currentLocation || { lat: 40.7128, lng: -74.0060 };

        // Create map
        mapInstanceRef.current = leaflet.map(mapRef.current, {
          center: [defaultLocation.lat, defaultLocation.lng],
          zoom: selectedLocation || currentLocation ? 16 : 10,
          zoomControl: false, // We'll add custom controls
        });

        // Add tile layer (OpenStreetMap)
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Add marker if location is selected
        if (selectedLocation) {
          addMarker(selectedLocation);
        }

        // Add click listener to map
        mapInstanceRef.current.on('click', (event: any) => {
          const clickedLocation = {
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          };
          
          setSelectedLocation(clickedLocation);
          addMarker(clickedLocation);
          reverseGeocode(clickedLocation);
        });

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoaded(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Load Leaflet library
  const loadLeaflet = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).L) {
        resolve();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });
  };

  // Add marker to map
  const addMarker = (location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([location.lat, location.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup(`Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`)
      .openPopup();

    // Center map on marker
    mapInstanceRef.current.setView([location.lat, location.lng], 16);
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (location: { lat: number; lng: number }) => {
    try {
      // Using Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const addressString = data.display_name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        setAddress(addressString);
        onLocationSelect({
          lat: location.lat,
          lng: location.lng,
          address: addressString,
        });
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      // Fallback to coordinates
      const addressString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      setAddress(addressString);
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: addressString,
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setCurrentLocation(location);
        setSelectedLocation(location);
        
        // Add marker to map
        if (mapInstanceRef.current) {
          addMarker(location);
        }
        
        // Get address
        reverseGeocode(location);
        
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Handle manual address change
  const handleManualAddressChange = (value: string) => {
    setManualAddress(value);
  };

  // Handle location selection from autocomplete
  const handleAutocompleteLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setAddress(location.address);
    
    // Add marker to map if available
    if (mapInstanceRef.current) {
      addMarker(location);
    }
    
    onLocationSelect(location);
  };

  // Toggle between location picker and manual entry
  const toggleInputMethod = () => {
    setUseManualEntry(!useManualEntry);
    setError('');
  };

  // Clear selected location
  const clearLocation = () => {
    setSelectedLocation(null);
    setAddress('');
    setCurrentLocation(null);
    
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([40.7128, -74.0060], 10);
    }
  };

  // Open location in external maps
  const openInMaps = () => {
    if (selectedLocation) {
      const url = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
      window.open(url, '_blank');
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleInputMethod}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {useManualEntry ? (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                Use Map
              </>
            ) : (
              <>
                <Map className="w-4 h-4 mr-1" />
                Manual Entry
              </>
            )}
          </button>
          {!useManualEntry && (
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4 mr-1" />
              )}
              Use My Location
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {useManualEntry ? (
        <AddressAutocomplete
          value={manualAddress}
          onChange={handleManualAddressChange}
          onLocationSelect={handleAutocompleteLocationSelect}
          placeholder="Start typing an address, landmark, or place name..."
          required
        />
      ) : (
        <div className="space-y-4">
          {/* Interactive Map Container */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="relative">
              <div
                ref={mapRef}
                className="h-80 w-full bg-gray-100"
              />
              
              {/* Map Loading Overlay */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-600">Loading interactive map...</p>
                  </div>
                </div>
              )}

              {/* Custom Zoom Controls */}
              {mapLoaded && (
                <div className="absolute top-4 right-4 flex flex-col space-y-1">
                  <button
                    type="button"
                    onClick={zoomIn}
                    className="bg-white shadow-md p-2 rounded hover:bg-gray-50 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={zoomOut}
                    className="bg-white shadow-md p-2 rounded hover:bg-gray-50 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location Info Panel */}
          {selectedLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Location Selected</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-green-700">
                      <strong>Address:</strong> {address || 'Getting address...'}
                    </p>
                    <p className="text-xs text-green-700">
                      <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={openInMaps}
                    className="flex items-center px-3 py-1 bg-white text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors border border-green-300"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in Maps
                  </button>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Location Info */}
          {currentLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Navigation className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">GPS Location Detected</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Your current location has been automatically detected and marked on the map
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-700 mb-1">How to use the interactive map:</p>
            <p>• Click "Use My Location" to automatically detect your GPS position</p>
            <p>• Click anywhere on the map to manually select a location</p>
            <p>• Use zoom controls (+/-) to get a better view</p>
            <p>• The selected location will show a marker and popup</p>
            <p>• Use manual entry if you prefer to type the address</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddedMapPicker;