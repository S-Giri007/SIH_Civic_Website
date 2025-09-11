import { useState, useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Loader, ZoomIn, ZoomOut } from 'lucide-react';

interface SingleLocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  title?: string;
  height?: string;
  showControls?: boolean;
  className?: string;
}

const SingleLocationMap: React.FC<SingleLocationMapProps> = ({
  latitude,
  longitude,
  address,
  title,
  height = "300px",
  showControls = true,
  className = ""
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Leaflet map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude) || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
          console.error('Invalid coordinates provided:', latitude, longitude);
          setMapError(true);
          return;
        }

        // Load Leaflet if not already loaded
        if (!(window as any).L) {
          await loadLeaflet();
        }

        const L = (window as any).L;
        
        // Create map centered on the provided coordinates
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 16,
          zoomControl: false,
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Add marker
        const markerIcon = L.divIcon({
          className: 'custom-single-marker',
          html: `
            <div class="relative">
              <div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div class="absolute -top-1 -left-1 w-10 h-10 bg-red-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        markerRef.current = L.marker([latitude, longitude], { icon: markerIcon })
          .addTo(mapInstanceRef.current);

        // Add popup if title or address is provided
        if (title || address) {
          const popupContent = `
            <div class="p-2">
              ${title ? `<h3 class="font-semibold text-sm mb-1">${title}</h3>` : ''}
              ${address ? `<p class="text-xs text-gray-600 mb-2">${address}</p>` : ''}
              <div class="text-xs text-gray-500">
                ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
              </div>
            </div>
          `;
          markerRef.current.bindPopup(popupContent).openPopup();
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
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
  }, [latitude, longitude, title, address]);

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

  // Open in external maps
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Map Container */}
      <div className="relative" style={{ height }}>
        {mapError ? (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Map could not be loaded</p>
              <p className="text-xs text-gray-500">Please check your internet connection</p>
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

            {/* Map Controls */}
            {mapLoaded && showControls && (
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

      {/* Location Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
            )}
            {address && (
              <p className="text-xs text-gray-600 truncate">{address}</p>
            )}
            <p className="text-xs text-gray-500 font-mono">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
          <button
            onClick={openInMaps}
            className="ml-2 flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleLocationMap;