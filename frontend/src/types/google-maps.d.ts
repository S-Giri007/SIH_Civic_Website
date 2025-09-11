// Google Maps API type declarations
declare global {
  interface Window {
    google: typeof google;
  }
}

// Basic Google Maps types (you can expand these as needed)
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      addListener(eventName: string, handler: Function): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng | undefined;
      addListener(eventName: string, handler: Function): void;
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
      title?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    interface GeocoderRequest {
      location: LatLng | LatLngLiteral;
    }

    interface GeocoderResult {
      formatted_address: string;
    }

    type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  }
}

export {};