import { useState, useEffect, useRef } from 'react';
import { MapPin, Crosshair, Navigation, AlertCircle, Map, Loader } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}
    
const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [address, setAddress] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      try {
        // Default location (center of a typical city)
        const defaultLocation = selectedLocation || currentLocation || { lat: 40.7128, lng: -74.0060 };

        // Create map
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: selectedLocation || currentLocation ? 16 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Create geocoder
        geocoderRef.current = new window.google.maps.Geocoder();

        // Add marker if location is selected
        if (selectedLocation) {
          addMarker(selectedLocation);
        }

        // Add click listener to map
        mapInstanceRef.current.addListener('click', (event: any) => {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          
          setSelectedLocation(clickedLocation);
          addMarker(clickedLocation);
          reverseGeocode(clickedLocation);
        });

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        setMapError(true);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  // Add marker to map
  const addMarker = (location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: 'Selected Location',
      animation: window.google.maps.Animation.DROP,
    });

    // Center map on marker
    mapInstanceRef.current.setCenter(location);
    mapInstanceRef.current.setZoom(16);
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = (location: { lat: number; lng: number }) => {
    if (!geocoderRef.current) {
      // Fallback to coordinate display
      const addressString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      setAddress(addressString);
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: addressString,
      });
      return;
    }

    geocoderRef.current.geocode(
      { location: location },
      (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const addressString = results[0].formatted_address;
          setAddress(addressString);
          onLocationSelect({
            lat: location.lat,
            lng: location.lng,
            address: addressString,
          });
        } else {
          // Fallback to coordinates
          const addressString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
          setAddress(addressString);
          onLocationSelect({
            lat: location.lat,
            lng: location.lng,
            address: addressString,
          });
        }
      }
    );
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

  // Handle manual address input
  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualAddress(value);
    
    if (value.trim()) {
      onLocationSelect({
        lat: 0, // Will be updated when we have geocoding
        lng: 0,
        address: value,
      });
    }
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
    
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 40.7128, lng: -74.0060 });
      mapInstanceRef.current.setZoom(10);
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
        <div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={manualAddress}
              onChange={handleManualAddressChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter specific address or landmark"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the complete address including street, area, and city
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Map Container */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {mapError ? (
              <div className="h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Map could not be loaded</p>
                  <p className="text-xs text-gray-500">Please use manual entry or try again later</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={mapRef}
                  className="h-64 w-full bg-gray-100"
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Display */}
          {selectedLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Location Selected</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-green-700">
                      <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                    {address && (
                      <p className="text-xs text-green-700">
                        <strong>Address:</strong> {address}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Clear
                </button>
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
            <p className="font-medium text-gray-700 mb-1">How to select location:</p>
            <p>• Click "Use My Location" to automatically detect your GPS position</p>
            <p>• Click anywhere on the map to manually select a location</p>
            <p>• Use manual entry if you prefer to type the address</p>
            <p>• Make sure location services are enabled for best accuracy</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLocationPicker;