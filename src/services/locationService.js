/**
 * Calculates the distance between two points on the Earth's surface 
 * using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km rounded to 1 decimal place
}

/**
 * Requests the user's current GPS location coordinates.
 * Resolves with fallback Chennai coordinates (Commissioner Office Vepery) if GPS fails or is denied.
 */
export async function getUserCoordinates() {
  const CHENNAI_DEFAULT = { lat: 13.0732, lng: 80.2609, isFallback: true };
  
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(CHENNAI_DEFAULT);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isFallback: false
        });
      },
      (error) => {
        console.warn("Geolocation request failed, using default Chennai coordinates:", error);
        resolve(CHENNAI_DEFAULT);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}
