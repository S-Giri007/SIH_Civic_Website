import { useState, useEffect, useRef } from 'react';
import { MapPin, Crosshair, Navigation, AlertCircle, Map, Loader, ExternalLink } from 'lucide-react';

interface LocationPickerWithMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPickerWithMap: React.FC<LocationPickerWithMapProps> = ({ onLocationSelect, initialLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [address, setAddress] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);

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
        
        // Create address string from coordinates
        const addressString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        setAddress(addressString);
        
        onLocationSelect({
          lat: location.lat,
          lng: location.lng,
          address: addressString,
        });
        
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
  };

  // Open location in external map
  const openInMaps = () => {
    if (selectedLocation) {
      const url = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  // Generate embedded map URL using OpenStreetMap
  const getEmbeddedMapUrl = (location: { lat: number; lng: number }) => {
    const zoom = 15;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01},${location.lat-0.01},${location.lng+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`;
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
                Use GPS
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
          {/* Location Display with Embedded Map */}
          {selectedLocation ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Embedded Interactive Map */}
              <div className="relative h-64 bg-gray-100">
                <iframe
                  src={getEmbeddedMapUrl(selectedLocation)}
                  className="w-full h-full border-0"
                  title="Location Map"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to coordinate display
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback display */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 hidden items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">Location Selected</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Location Info Panel */}
              <div className="bg-white border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Selected Location</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        <strong>Address:</strong> {address || 'Address not available'}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={openInMaps}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open in Maps
                    </button>
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition-colors"
                    >
                      Clear Location
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No location selected</p>
              <p className="text-sm text-gray-500 mb-4">
                Click "Use My Location" to automatically detect your position
              </p>
              
              {/* Sample map placeholder */}
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Map will appear here</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Location Info */}
          {currentLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Navigation className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">GPS Location Detected</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Your current location has been automatically detected and will be shown on the map
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-700 mb-1">How to select location:</p>
            <p>• Click "Use My Location" to automatically detect your GPS position</p>
            <p>• The location will be displayed on a map preview above</p>
            <p>• Click "View" to open the location in Google Maps</p>
            <p>• Use manual entry if you prefer to type the address</p>
            <p>• Make sure location services are enabled for best accuracy</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPickerWithMap;