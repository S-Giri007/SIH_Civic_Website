import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MapPin,
    Crosshair,
    Navigation,
    AlertCircle,
    Search,
    Layers,
    Maximize,
    Minimize,
    RotateCcw,
    Zap,
    Target,
    Map as MapIcon,
    Satellite,
    Route
} from 'lucide-react';

// Global script loading state to prevent multiple loads
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;

interface LocationPickerProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string;
        placeDetails?: any;
    }) => void;
    initialLocation?: { lat: number; lng: number };
    height?: string;
    showSearch?: boolean;
    showMapTypes?: boolean;
    showFullscreen?: boolean;
    apiKey?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    onLocationSelect,
    initialLocation,
    height = "h-64",
    showSearch = true,
    showMapTypes = true,
    showFullscreen = true,
    apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgaJzuU17R8" // Replace with your API key
}) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
    const [address, setAddress] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
    const [showTraffic, setShowTraffic] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Default location (New Delhi, India)
    const defaultLocation = { lat: 28.6139, lng: 77.2090 };

    // Initialize Google Maps with advanced features
    const initializeMap = useCallback(() => {
        if (!window.google || mapLoaded || !mapRef.current) return;

        // Prevent multiple initializations
        if (map) return;

        const mapOptions: google.maps.MapOptions = {
            center: selectedLocation || currentLocation || defaultLocation,
            zoom: 15,
            mapTypeId: mapType,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: false,
            zoomControl: true,
            scaleControl: true,
            rotateControl: true,
            clickableIcons: true,
            gestureHandling: 'cooperative',
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                }
            ]
        };

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        // Initialize services
        const places = new window.google.maps.places.PlacesService(newMap);
        const directions = new window.google.maps.DirectionsService();
        const directionsDisplay = new window.google.maps.DirectionsRenderer({
            draggable: true,
            suppressMarkers: false
        });

        setPlacesService(places);
        setDirectionsService(directions);
        setDirectionsRenderer(directionsDisplay);
        directionsDisplay.setMap(newMap);

        // Initialize autocomplete for search
        if (searchInputRef.current && showSearch) {
            const autoComplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                types: ['establishment', 'geocode'],
                componentRestrictions: { country: 'in' }, // Restrict to India, change as needed
                fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types', 'photos']
            });

            autoComplete.bindTo('bounds', newMap);
            setAutocomplete(autoComplete);

            autoComplete.addListener('place_changed', () => {
                const place = autoComplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    updateLocation(location, place.formatted_address || '', place.place_id, place);
                    newMap.setCenter(location);
                    newMap.setZoom(17);
                }
            });
        }

        // Add click listener to map
        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                updateLocation({ lat, lng });
            }
        });

        // Add zoom change listener
        newMap.addListener('zoom_changed', () => {
            const zoom = newMap.getZoom();
            if (zoom && zoom > 16 && selectedLocation) {
                searchNearbyPlaces(selectedLocation);
            }
        });

        // Add traffic layer
        const trafficLayer = new window.google.maps.TrafficLayer();
        if (showTraffic) {
            trafficLayer.setMap(newMap);
        }

        setMapLoaded(true);
    }, [selectedLocation, currentLocation, mapLoaded, mapType, showSearch, showTraffic]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            // Cleanup map instance
            if (map) {
                // Remove all listeners
                window.google?.maps?.event?.clearInstanceListeners(map);
            }

            // Cleanup marker
            if (marker) {
                marker.setMap(null);
            }

            // Cleanup services
            if (directionsRenderer) {
                directionsRenderer.setMap(null);
            }
        };
    }, [map, marker, directionsRenderer]);

    // Load Google Maps script with better error handling
    useEffect(() => {
        const loadGoogleMaps = async () => {
            // If already loaded, initialize immediately
            if (window.google && isGoogleMapsLoaded) {
                initializeMap();
                return;
            }

            // If already loading, wait for it
            if (isGoogleMapsLoading) {
                const waitForLoad = () => {
                    if (window.google && isGoogleMapsLoaded) {
                        initializeMap();
                    } else {
                        setTimeout(waitForLoad, 100);
                    }
                };
                waitForLoad();
                return;
            }

            // Check if script already exists
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                isGoogleMapsLoading = true;
                const waitForExisting = () => {
                    if (window.google) {
                        isGoogleMapsLoaded = true;
                        isGoogleMapsLoading = false;
                        initializeMap();
                    } else {
                        setTimeout(waitForExisting, 100);
                    }
                };
                waitForExisting();
                return;
            }

            // Load new script
            isGoogleMapsLoading = true;

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=3.55`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                isGoogleMapsLoaded = true;
                isGoogleMapsLoading = false;
                initializeMap();
            };

            script.onerror = () => {
                isGoogleMapsLoading = false;
                setError('Failed to load Google Maps. Please check your API key and internet connection.');
            };

            document.head.appendChild(script);
        };

        loadGoogleMaps();

        // No cleanup needed - let the script stay loaded for other components
    }, [initializeMap, apiKey]);

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
                updateLocation(location);
                setLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setError('Unable to get your location. Please select manually on the map.');
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        );
    };

    // Update location and marker with enhanced features
    const updateLocation = (
        location: { lat: number; lng: number },
        providedAddress?: string,
        placeId?: string,
        placeDetails?: any
    ) => {
        setSelectedLocation(location);

        if (map) {
            map.setCenter(location);

            // Remove existing marker
            if (marker) {
                marker.setMap(null);
            }

            // Create custom marker with enhanced styling
            const markerIcon = {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
                        <circle cx="16" cy="16" r="3" fill="#FFFFFF"/>
                    </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16)
            };

            // Add new marker with animation
            const newMarker = new window.google.maps.Marker({
                position: location,
                map: map,
                draggable: true,
                title: 'Selected Location',
                icon: markerIcon,
                animation: window.google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div class="p-2">
                        <h3 class="font-semibold text-sm">Selected Location</h3>
                        <p class="text-xs text-gray-600">${providedAddress || 'Getting address...'}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            newMarker.addListener('click', () => {
                infoWindow.open(map, newMarker);
            });

            // Add drag listener to marker
            newMarker.addListener('dragend', () => {
                const position = newMarker.getPosition();
                if (position) {
                    const newLocation = {
                        lat: position.lat(),
                        lng: position.lng(),
                    };
                    setSelectedLocation(newLocation);
                    reverseGeocode(newLocation);
                }
            });

            setMarker(newMarker);

            // Search for nearby places
            searchNearbyPlaces(location);
        }

        // Get address for the location if not provided
        if (providedAddress) {
            setAddress(providedAddress);
            onLocationSelect({
                lat: location.lat,
                lng: location.lng,
                address: providedAddress,
                placeId,
                placeDetails
            });
        } else {
            reverseGeocode(location);
        }
    };

    // Enhanced reverse geocoding to get detailed address
    const reverseGeocode = (location: { lat: number; lng: number }) => {
        if (!window.google) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            {
                location: location,
                language: 'en',
                region: 'IN' // Change as needed
            },
            (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const result = results[0];
                    const formattedAddress = result.formatted_address;
                    setAddress(formattedAddress);

                    // Extract detailed address components
                    const addressComponents = result.address_components;
                    const placeDetails = {
                        streetNumber: '',
                        route: '',
                        locality: '',
                        administrativeArea: '',
                        country: '',
                        postalCode: ''
                    };

                    addressComponents?.forEach(component => {
                        const types = component.types;
                        if (types.includes('street_number')) {
                            placeDetails.streetNumber = component.long_name;
                        } else if (types.includes('route')) {
                            placeDetails.route = component.long_name;
                        } else if (types.includes('locality')) {
                            placeDetails.locality = component.long_name;
                        } else if (types.includes('administrative_area_level_1')) {
                            placeDetails.administrativeArea = component.long_name;
                        } else if (types.includes('country')) {
                            placeDetails.country = component.long_name;
                        } else if (types.includes('postal_code')) {
                            placeDetails.postalCode = component.long_name;
                        }
                    });

                    onLocationSelect({
                        lat: location.lat,
                        lng: location.lng,
                        address: formattedAddress,
                        placeId: result.place_id,
                        placeDetails
                    });
                } else {
                    const fallbackAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                    setAddress(fallbackAddress);
                    onLocationSelect({
                        lat: location.lat,
                        lng: location.lng,
                        address: fallbackAddress,
                    });
                }
            }
        );
    };

    // Search for nearby places
    const searchNearbyPlaces = (location: { lat: number; lng: number }) => {
        if (!placesService) return;

        const request = {
            location: new window.google.maps.LatLng(location.lat, location.lng),
            radius: 500,
            type: 'point_of_interest'
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setNearbyPlaces(results.slice(0, 5)); // Limit to 5 places
            }
        });
    };

    // Search places by text
    const searchPlaces = (query: string) => {
        if (!placesService || !query.trim()) return;

        const request = {
            query: query,
            location: map?.getCenter(),
            radius: 50000,
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types', 'rating']
        };

        placesService.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                const place = results[0];
                if (place.geometry && place.geometry.location) {
                    const location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    updateLocation(location, place.formatted_address, place.place_id, place);
                    map?.setCenter(location);
                    map?.setZoom(17);
                }
            }
        });
    };

    // Map type change handler
    const changeMapType = (newMapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
        setMapType(newMapType);
        if (map) {
            map.setMapTypeId(newMapType);
        }
    };

    // Toggle traffic layer
    const toggleTraffic = () => {
        setShowTraffic(!showTraffic);
        if (map) {
            const trafficLayer = new window.google.maps.TrafficLayer();
            if (!showTraffic) {
                trafficLayer.setMap(map);
            } else {
                trafficLayer.setMap(null);
            }
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Reset map to default view
    const resetMap = () => {
        if (map) {
            map.setCenter(defaultLocation);
            map.setZoom(15);
            setSelectedLocation(null);
            setAddress('');
            if (marker) {
                marker.setMap(null);
                setMarker(null);
            }
        }
    };

    // Get directions to selected location
    const getDirections = () => {
        if (!directionsService || !directionsRenderer || !selectedLocation || !currentLocation) {
            alert('Please enable location services and select a destination');
            return;
        }

        const request = {
            origin: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
            destination: new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng),
            travelMode: window.google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK' && result) {
                directionsRenderer.setDirections(result);
            }
        });
    };

    // Handle search input
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchPlaces(searchQuery);
        }
    };

    // Center map on current location
    useEffect(() => {
        if (map && currentLocation) {
            map.setCenter(currentLocation);
        }
    }, [map, currentLocation]);

    return (
        <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            {/* Header with controls */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Location *
                </label>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={loading}
                        className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <Navigation className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                            <Crosshair className="w-4 h-4 mr-1" />
                        )}
                        My Location
                    </button>

                    {showFullscreen && (
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-4 h-4" />
                            ) : (
                                <Maximize className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Search bar */}
            {showSearch && (
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search for places, addresses, or landmarks..."
                    />
                </form>
            )}

            {/* Map controls */}
            {showMapTypes && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Map Type:</span>
                        <div className="flex space-x-1">
                            {[
                                { type: 'roadmap', icon: MapIcon, label: 'Map' },
                                { type: 'satellite', icon: Satellite, label: 'Satellite' },
                                { type: 'hybrid', icon: Layers, label: 'Hybrid' },
                                { type: 'terrain', icon: MapIcon, label: 'Terrain' }
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => changeMapType(type as any)}
                                    className={`p-1 rounded text-xs ${mapType === type
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={toggleTraffic}
                            className={`flex items-center px-2 py-1 text-xs rounded ${showTraffic
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Zap className="w-3 h-3 mr-1" />
                            Traffic
                        </button>

                        {selectedLocation && currentLocation && (
                            <button
                                type="button"
                                onClick={getDirections}
                                className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                                <Route className="w-3 h-3 mr-1" />
                                Directions
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={resetMap}
                            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Map container */}
            <div className="relative">
                <div
                    ref={mapRef}
                    className={`w-full ${isFullscreen ? 'h-screen' : height} rounded-lg border border-gray-300 bg-gray-100`}
                >
                    {!mapLoaded && (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-green-50">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">Loading Google Maps...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Location info overlay */}
                {selectedLocation && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                                <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Selected Location</p>
                                    <p className="text-sm text-gray-600 truncate">{address || 'Getting address...'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedLocation) {
                                        map?.setCenter(selectedLocation);
                                        map?.setZoom(18);
                                    }
                                }}
                                className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Center on location"
                            >
                                <Target className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Nearby places */}
                {nearbyPlaces.length > 0 && (
                    <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Nearby Places</h4>
                        <div className="space-y-1">
                            {nearbyPlaces.map((place, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        if (place.geometry && place.geometry.location) {
                                            const location = {
                                                lat: place.geometry.location.lat(),
                                                lng: place.geometry.location.lng()
                                            };
                                            updateLocation(location, place.name, place.place_id, place);
                                        }
                                    }}
                                    className="block w-full text-left text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1 rounded truncate"
                                >
                                    {place.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Click on the map to select a location</p>
                <p>• Drag the marker to adjust the position</p>
                <p>• Use search to find specific places</p>
                <p>• Switch map types for different views</p>
                {currentLocation && <p>• Get directions from your current location</p>}
            </div>
        </div>
    );
};

export default LocationPicker;