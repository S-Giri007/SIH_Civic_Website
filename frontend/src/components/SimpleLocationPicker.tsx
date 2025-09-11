import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, Navigation, AlertCircle, Map } from 'lucide-react';

interface SimpleLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const SimpleLocationPicker: React.FC<SimpleLocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [address, setAddress] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useManualEntry, setUseManualEntry] = useState(false);

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
        
        // Create a readable address from coordinates
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
                <Navigation className="w-4 h-4 mr-1 " />
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
          {/* Location Display */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            
            {selectedLocation ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Location Selected</p>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-600 mb-1">Coordinates:</p>
                  <p className="text-sm font-mono text-gray-800">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                  {address && (
                    <>
                      <p className="text-xs text-gray-600 mt-2 mb-1">Address:</p>
                      <p className="text-sm text-gray-800">{address}</p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(null);
                    setAddress('');
                    setCurrentLocation(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear Location
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">No location selected</p>
                <p className="text-sm text-gray-500">
                  Click "Use My Location" to automatically detect your position
                </p>
              </div>
            )}
          </div>

          {/* Location Info */}
          {currentLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Navigation className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Current Location Detected</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Your device location has been successfully obtained
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click "Use My Location" to automatically detect your current position</p>
            <p>• Make sure location services are enabled in your browser</p>
            <p>• You can switch to manual entry if GPS is not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleLocationPicker;