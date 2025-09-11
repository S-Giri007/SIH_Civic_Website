// Utility functions for geocoding and location handling

export interface Coordinates {
  lat: number;
  lng: number;
}

// Geocode an address to coordinates using Nominatim API
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address || address.trim().length < 3) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (error) {
    console.warn('Geocoding failed for address:', address, error);
  }
  
  return null;
};

// Check if coordinates are valid
export const isValidCoordinates = (coords: Coordinates | null | undefined): coords is Coordinates => {
  if (!coords) return false;
  
  const { lat, lng } = coords;
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
};

// Parse coordinates from various string formats
export const parseCoordinatesFromString = (locationString: string): Coordinates | null => {
  if (!locationString) return null;
  
  // Try to extract coordinates from strings like "40.7128, -74.0060" or "lat: 40.7128, lng: -74.0060"
  const coordRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
  const match = locationString.match(coordRegex);
  
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    
    if (isValidCoordinates({ lat, lng })) {
      return { lat, lng };
    }
  }
  
  return null;
};

// Generate sample coordinates for testing (remove in production)
export const generateSampleCoordinates = (index: number = 0): Coordinates => {
  // Generate coordinates around New York City area for testing
  const baseLatitude = 40.7128;
  const baseLongitude = -74.0060;
  
  // Add some random offset based on index
  const latOffset = (Math.sin(index) * 0.1) + (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.cos(index) * 0.1) + (Math.random() - 0.5) * 0.05;
  
  return {
    lat: baseLatitude + latOffset,
    lng: baseLongitude + lngOffset
  };
};

// Batch geocode multiple addresses with rate limiting
export const batchGeocodeAddresses = async (
  addresses: string[], 
  delay: number = 1000
): Promise<(Coordinates | null)[]> => {
  const results: (Coordinates | null)[] = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const coords = await geocodeAddress(addresses[i]);
    results.push(coords);
    
    // Add delay to respect API rate limits
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};