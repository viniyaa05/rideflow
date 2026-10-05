/**
 * Real-world Geolocation and GPS Proximity Utilities for RideFlow Tamil Nadu
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

export function estimateWalkingOrDrivingTime(distanceKm, speedKmH = 25) {
  if (!distanceKm) return '2 mins';
  const minutes = Math.round((distanceKm / speedKmH) * 60);
  return minutes < 1 ? '1 min' : `${minutes} mins`;
}

// Popular Tamil Nadu Transit Hubs with authentic GPS coordinates
export const TN_TRANSIT_HUBS = [
  { id: 'hub_chennai_central', name: 'Chennai Central Railway Station (600003)', lat: 13.0827, lng: 80.2707 },
  { id: 'hub_chennai_omr', name: 'OMR IT Corridor - Sholinganallur (600119)', lat: 12.9010, lng: 80.2279 },
  { id: 'hub_chennai_tnagar', name: 'T. Nagar Panagal Park (600017)', lat: 13.0418, lng: 80.2341 },
  { id: 'hub_chennai_annanagar', name: 'Anna Nagar Tower Park (600040)', lat: 13.0850, lng: 80.2100 },
  { id: 'hub_chennai_guindy', name: 'Guindy Industrial Estate / Race Course (600032)', lat: 13.0067, lng: 80.2026 },
  { id: 'hub_chennai_airport', name: 'Chennai International Airport MAA (600027)', lat: 12.9822, lng: 80.1636 },
  { id: 'hub_chennai_velachery', name: 'Velachery Phoenix Marketcity (600042)', lat: 12.9815, lng: 80.2180 },
  { id: 'hub_chennai_tambaram', name: 'Tambaram Railway Station (600045)', lat: 12.9249, lng: 80.1000 },
  { id: 'hub_coimbatore_gandhipuram', name: 'Coimbatore Gandhipuram Central (641012)', lat: 11.0168, lng: 76.9558 },
  { id: 'hub_coimbatore_airport', name: 'Coimbatore Airport CJB (641014)', lat: 11.0300, lng: 77.0434 },
  { id: 'hub_madurai_meenakshi', name: 'Madurai Meenakshi Amman Temple (625001)', lat: 9.9195, lng: 78.1193 },
  { id: 'hub_madurai_junction', name: 'Madurai Railway Junction (625001)', lat: 9.9252, lng: 78.1198 },
  { id: 'hub_trichy_central', name: 'Tiruchirappalli Central Junction (620001)', lat: 10.7905, lng: 78.7047 },
  { id: 'hub_salem_central', name: 'Salem Central Junction (636005)', lat: 11.6643, lng: 78.1460 }
];
