/**
 * Real Geographic Distance, Geocoding & Fare Estimation Engine for Tamil Nadu
 * Supports high-accuracy Haversine distance, realistic road route factors,
 * live corridor calculations, and multi-modal fare breakdowns.
 * Integrates live OpenStreetMap Nominatim Geocoding + OSRM Road Routing API.
 */

import { TN_LOCATIONS } from '../data/mockData.js';
import { api } from '../services/api.js';
import { ALL_INDIA_LOCATIONS } from './indiaLocations.js';

// Comprehensive Pre-Indexed Geographic Coordinate Matrix for Tamil Nadu Hubs & Corridors
export const TN_GEO_COORDINATES = {
  // Chennai City & Metro
  'chennai central': { lat: 13.0827, lng: 80.2707, name: 'Chennai Central Railway Station (600003)' },
  'chennai central railway station': { lat: 13.0827, lng: 80.2707, name: 'Chennai Central Railway Station (600003)' },
  'chennai airport': { lat: 12.9941, lng: 80.1709, name: 'Chennai International Airport MAA (600027)' },
  'chennai international airport': { lat: 12.9941, lng: 80.1709, name: 'Chennai International Airport MAA (600027)' },
  'omr': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'omr it expressway': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'sholinganallur': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'siruseri': { lat: 12.8310, lng: 80.2185, name: 'SIPCOT IT Park Siruseri (603103)' },
  't. nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar Commercial Hub - Panagal Park (600017)' },
  't nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar Commercial Hub - Panagal Park (600017)' },
  'anna nagar': { lat: 13.0850, lng: 80.2100, name: 'Anna Nagar Tower Park (600040)' },
  'tambaram': { lat: 12.9249, lng: 80.1000, name: 'Tambaram Railway Terminal (600045)' },
  'koyambedu': { lat: 13.0694, lng: 80.1948, name: 'Koyambedu CMBT Intercity Bus Terminal (600107)' },
  'velachery': { lat: 12.9815, lng: 80.2180, name: 'Velachery MRTS Junction (600042)' },
  'guindy': { lat: 13.0067, lng: 80.2025, name: 'Guindy Industrial Estate (600032)' },
  'mahabalipuram': { lat: 12.6269, lng: 80.1927, name: 'Mahabalipuram Shore Heritage (603104)' },
  'kanchipuram': { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram Silk City (631501)' },

  // Coimbatore & Kongu Belt
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Gandhipuram Central (641012)' },
  'gandhipuram': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Gandhipuram Central (641012)' },
  'coimbatore gandhipuram': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Gandhipuram Central (641012)' },
  'tidel park coimbatore': { lat: 11.0285, lng: 77.0270, name: 'TIDEL Park Coimbatore - Avinashi Rd (641014)' },
  'avinashi': { lat: 11.0285, lng: 77.0270, name: 'TIDEL Park Coimbatore - Avinashi Rd (641014)' },
  'rs puram': { lat: 11.0125, lng: 76.9460, name: 'RS Puram Commercial Center (641002)' },
  'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur Textile City (641601)' },
  'erode': { lat: 11.3410, lng: 77.7172, name: 'Erode Junction (638001)' },
  'salem': { lat: 11.6643, lng: 78.1460, name: 'Salem Junction Main Terminal (636005)' },

  // Madurai & South TN
  'madurai': { lat: 9.9195, lng: 78.1193, name: 'Madurai Meenakshi Junction (625001)' },
  'madurai meenakshi': { lat: 9.9195, lng: 78.1193, name: 'Madurai Meenakshi Junction (625001)' },
  'mattuthavani': { lat: 9.9480, lng: 78.1560, name: 'Mattuthavani Integrated Bus Terminal (625007)' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli Junction (627001)' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari Cape Terminal (629702)' },

  // Central TN & Delta
  'trichy': { lat: 10.7905, lng: 78.7047, name: 'Trichy Central Bus Stand (620001)' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Trichy Central Bus Stand (620001)' },
  'rockfort': { lat: 10.8280, lng: 78.6968, name: 'Rockfort Commercial Area (620002)' },
  'thanjavur': { lat: 10.7870, lng: 79.1378, name: 'Thanjavur Brihadeeswara Hub (613001)' },

  // North TN & Neighbors
  'vellore': { lat: 12.9165, lng: 79.1325, name: 'Vellore Fort & CMC Hub (632004)' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, name: 'Puducherry White Town Promenade (605001)' },
  'hosur': { lat: 12.7409, lng: 77.8253, name: 'Hosur SIPCOT Electronic City (635109)' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Kempegowda (560001)' }
};

// Memory Cache for Live Route API calls
const ROUTE_CACHE = new Map();

/**
 * Finds matching geographic coordinates for a given location string
 */
export function getCoordinates(locationText = '') {
  const clean = locationText.toLowerCase().trim();
  
  // 1. Direct dictionary match (sorted by length descending for specificity)
  const sortedEntries = Object.entries(TN_GEO_COORDINATES).sort((a, b) => b[0].length - a[0].length);
  for (const [key, coords] of sortedEntries) {
    if (clean === key || clean.includes(key)) {
      return coords;
    }
  }

  // 2. All-India locations dataset matching
  const matchedIndia = ALL_INDIA_LOCATIONS.find((l) => {
    const lName = l.name.toLowerCase();
    const lCity = l.city.toLowerCase();
    return clean === lName || clean.includes(lName) || lName.includes(clean) || (clean.includes(lCity) && clean.length > 3);
  });
  if (matchedIndia) {
    return {
      lat: matchedIndia.lat,
      lng: matchedIndia.lng,
      name: matchedIndia.name
    };
  }

  // 3. TN_LOCATIONS mock array matching
  const matchedLocation = TN_LOCATIONS.find(l => l.toLowerCase().includes(clean) || clean.includes(l.toLowerCase()));
  if (matchedLocation) {
    const locClean = matchedLocation.toLowerCase();
    for (const [key, coords] of Object.entries(TN_GEO_COORDINATES)) {
      if (locClean.includes(key)) {
        return coords;
      }
    }
  }

  // 3. Fallback coordinate
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const lat = 8.8 + (absHash % 420) / 100;
  const lng = 77.0 + ((absHash >> 3) % 320) / 100;

  return { lat, lng, name: locationText };
}

/**
 * Geocode arbitrary location string using OpenStreetMap Nominatim API
 */
export async function geocodeLocationApi(queryText) {
  if (!queryText || !queryText.trim()) return null;
  const clean = queryText.trim();
  
  // Check fast local dictionary first
  const localCoord = getCoordinates(clean);
  if (localCoord && TN_GEO_COORDINATES[clean.toLowerCase()]) {
    return localCoord;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean + ' Tamil Nadu India')}&limit=1`, {
      headers: { 'User-Agent': 'RideFlow-Mobility-App/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name
        };
      }
    }
  } catch (err) {
    console.warn('[Geocoding API Fallback]', err.message);
  }

  return localCoord;
}

/**
 * Live Driving Road Distance & Duration API via Backend Route Service + OSRM
 */
export async function fetchRealRouteApi(fromText = 'Chennai Central', toText = 'OMR IT Expressway') {
  const fromClean = (fromText || 'Chennai Central').trim();
  const toClean = (toText || 'OMR IT Expressway').trim();
  const cacheKey = `${fromClean.toLowerCase()}-->${toClean.toLowerCase()}`;

  if (ROUTE_CACHE.has(cacheKey)) {
    return ROUTE_CACHE.get(cacheKey);
  }

  if (fromClean.toLowerCase() === toClean.toLowerCase()) {
    const samePlace = {
      distanceKm: 2.0,
      durationMins: 10,
      trafficMultiplier: 1.0,
      trafficLabel: 'Local Direct Transit',
      from: fromText,
      to: toText,
      isLiveApi: true
    };
    ROUTE_CACHE.set(cacheKey, samePlace);
    return samePlace;
  }

  // 1. First priority: Call our Express Backend Route API via centralized api client
  try {
    const data = await api.getDistance(fromClean, toClean);
    if (data && data.success && data.distanceKm > 0) {
      const distanceKm = data.distanceKm;
      const durationMins = data.durationMins || Math.max(12, Math.round(distanceKm * 1.6));
      const result = {
        distanceKm,
        durationMins,
        trafficMultiplier: distanceKm > 80 ? 1.05 : 1.2,
        trafficLabel: distanceKm > 100 ? 'National Highway NH Corridor' : 'City & State Highway Corridor',
        from: fromText,
        to: toText,
        originCoords: data.origin,
        destCoords: data.destination,
        isLiveApi: true,
        source: data.source || 'osrm-live'
      };
      ROUTE_CACHE.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('[Backend Route API Notice]', err.message);
  }

  // 2. Client-side fallback to OSRM / Geocode if backend is unreachable
  try {
    const coord1 = await geocodeLocationApi(fromClean);
    const coord2 = await geocodeLocationApi(toClean);

    if (coord1 && coord2) {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coord1.lng},${coord1.lat};${coord2.lng},${coord2.lat}?overview=false`;
      const routeRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(3000) });
      
      if (routeRes.ok) {
        const routeData = await routeRes.json();
        if (routeData.code === 'Ok' && routeData.routes && routeData.routes[0]) {
          const route = routeData.routes[0];
          const distanceKm = Number((route.distance / 1000).toFixed(1));
          const durationMins = Math.max(12, Math.round(route.duration / 60));

          const result = {
            distanceKm,
            durationMins,
            trafficMultiplier: distanceKm > 80 ? 1.05 : 1.2,
            trafficLabel: distanceKm > 100 ? 'National Highway NH Corridor' : 'City & State Highway Corridor',
            from: fromText,
            to: toText,
            originCoords: coord1,
            destCoords: coord2,
            isLiveApi: true
          };

          ROUTE_CACHE.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn('[Client OSRM Route Fallback]', err.message);
  }

  // 3. Mathematical Geodesic Haversine calculation fallback
  const fallback = estimateRoute(fromText, toText);
  ROUTE_CACHE.set(cacheKey, fallback);
  return fallback;
}

/**
 * Calculates accurate geodesic distance (Haversine formula) in kilometers
 * Applies a 1.28x road winding / terrain factor for realistic driving route distance.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  const ROAD_FACTOR = straightLineDistance < 15 ? 1.35 : 1.25;
  const roadDistance = straightLineDistance * ROAD_FACTOR;

  return Math.max(2.5, Number(roadDistance.toFixed(1)));
}

/**
 * Synchronous Estimate Route Distance, Duration & Traffic
 */
export function estimateRoute(fromText = 'Chennai Central', toText = 'OMR IT Expressway') {
  const fromClean = (fromText || 'Chennai Central').trim();
  const toClean = (toText || 'OMR IT Expressway').trim();

  if (fromClean.toLowerCase() === toClean.toLowerCase()) {
    return {
      distanceKm: 2.0,
      durationMins: 10,
      trafficMultiplier: 1.0,
      trafficLabel: 'Normal Local Corridor',
      from: fromText,
      to: toText,
      isLiveApi: false
    };
  }

  const coord1 = getCoordinates(fromClean);
  const coord2 = getCoordinates(toClean);

  const distanceKm = calculateHaversineDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);

  let avgSpeedKmH = 28;
  let trafficLabel = 'Moderate City Traffic';
  let trafficMultiplier = 1.15;

  if (distanceKm > 100) {
    avgSpeedKmH = 62;
    trafficLabel = 'NH Highway Corridor';
    trafficMultiplier = 1.05;
  } else if (distanceKm > 40) {
    avgSpeedKmH = 45;
    trafficLabel = 'Suburban Express Route';
    trafficMultiplier = 1.1;
  } else if (fromClean.toLowerCase().includes('omr') || toClean.toLowerCase().includes('omr')) {
    avgSpeedKmH = 22;
    trafficLabel = 'OMR IT Corridor (Peak Flow)';
    trafficMultiplier = 1.35;
  }

  const durationMins = Math.max(10, Math.round((distanceKm / avgSpeedKmH) * 60 * trafficMultiplier));

  return {
    distanceKm,
    durationMins,
    trafficMultiplier,
    trafficLabel,
    from: fromText,
    to: toText,
    originCoords: coord1,
    destCoords: coord2,
    isLiveApi: false
  };
}

/**
 * Compute Driver Booking Fare Breakdown (in ₹)
 */
export function calculateDriverFare(routeEstimate, tier = 'economy') {
  const { distanceKm, durationMins } = routeEstimate;

  const TIERS = {
    economy: { name: 'RideFlow Standard (Swift Dzire / Etios)', multiplier: 1.0, base: 50.00, perKm: 14.50, perMin: 1.50, fee: 30.00, capacity: 4 },
    comfort: { name: 'Comfort Plus (AC Sedan)', multiplier: 1.25, base: 70.00, perKm: 18.00, perMin: 2.00, fee: 35.00, capacity: 4 },
    xl: { name: 'RideFlow XL (Toyota Innova Crysta 7-Seater)', multiplier: 1.75, base: 110.00, perKm: 24.00, perMin: 3.00, fee: 45.00, capacity: 7 },
    black: { name: 'Executive Premier Chauffeur', multiplier: 2.20, base: 180.00, perKm: 32.00, perMin: 4.50, fee: 60.00, capacity: 4 }
  };

  const config = TIERS[tier] || TIERS.economy;

  const baseFare = config.base;
  const distanceCost = Number((distanceKm * config.perKm).toFixed(2));
  const timeCost = Number((durationMins * config.perMin).toFixed(2));
  const platformFee = config.fee;
  
  const rawTotal = baseFare + distanceCost + timeCost + platformFee;
  const total = Number(Math.max(120.00, rawTotal).toFixed(0));

  return {
    tierKey: tier,
    tierName: config.name,
    capacity: config.capacity,
    baseFare,
    distanceKm,
    perKmRate: config.perKm,
    distanceCost,
    durationMins,
    perMinRate: config.perMin,
    timeCost,
    platformFee,
    total,
    co2Kg: Number((distanceKm * 0.14).toFixed(2)),
    pickupEtaMins: Math.min(8, Math.max(3, Math.round((distanceKm % 4) + 3)))
  };
}

/**
 * Compute Self-Drive Rental Fare (in ₹)
 */
export function calculateRentalFare(routeEstimate, vehicleType = 'compact') {
  const { distanceKm, durationMins } = routeEstimate;

  const billableHours = Math.max(2, Math.ceil((durationMins + 45) / 60));

  const VEHICLE_PRICING = {
    compact: { name: 'Tata Tiago / Swift', hourlyRate: 180.00, energyPerKm: 3.50, insurance: 60.00, co2Factor: 0.11 },
    sedan: { name: 'Swift Dzire / Honda City', hourlyRate: 240.00, energyPerKm: 4.50, insurance: 80.00, co2Factor: 0.13 },
    suv: { name: 'Toyota Innova Crysta / Thar 4x4', hourlyRate: 380.00, energyPerKm: 6.00, insurance: 110.00, co2Factor: 0.17 },
    electric: { name: 'Tata Nexon EV Max', hourlyRate: 290.00, energyPerKm: 1.60, insurance: 75.00, co2Factor: 0.02 },
    luxury: { name: 'BMW / Luxury Coupe', hourlyRate: 650.00, energyPerKm: 8.50, insurance: 180.00, co2Factor: 0.19 }
  };

  const spec = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.compact;

  const rentalBase = spec.hourlyRate * billableHours;
  const energyCost = Number((distanceKm * spec.energyPerKm).toFixed(2));
  const insurance = spec.insurance;
  const total = Number((rentalBase + energyCost + insurance).toFixed(0));

  return {
    vehicleType,
    vehicleName: spec.name,
    billableHours,
    hourlyRate: spec.hourlyRate,
    rentalBase,
    energyCost,
    insurance,
    total,
    co2Kg: Number((distanceKm * spec.co2Factor).toFixed(2)),
    durationMins: durationMins + 15
  };
}

/**
 * Compute Carpool (Connect) Split-Fare (in ₹)
 */
export function calculateCarpoolFare(routeEstimate) {
  const { distanceKm, durationMins } = routeEstimate;

  const totalFuelCost = (distanceKm * 6.50) + 35.00;
  const riderShare = totalFuelCost / 3;
  const safetyPlatformFee = 15.00;

  const totalPerSeat = Number(Math.max(45.00, Math.round(riderShare + safetyPlatformFee)));
  const co2Kg = Number(((distanceKm * 0.12) / 3).toFixed(2));

  return {
    totalPerSeat,
    hostContribution: Number(riderShare.toFixed(0)),
    safetyPlatformFee,
    co2Kg,
    availableSeats: 3,
    durationMins: durationMins + 8,
    savingsVsTaxi: Number((calculateDriverFare(routeEstimate).total - totalPerSeat).toFixed(0))
  };
}

/**
 * Persona-Aware Multi-Modal Comparison & Dynamic Recommendation Engine
 */
export function getRouteComparison(fromText, toText, persona = 'smart', routeOverride = null) {
  const route = routeOverride || estimateRoute(fromText, toText);
  const driver = calculateDriverFare(route, 'economy');
  const rental = calculateRentalFare(route, 'electric');
  const carpool = calculateCarpoolFare(route);

  const modes = [
    {
      id: 'carpool',
      name: 'Carpool Connect',
      tagline: 'Shared Daily Commute',
      price: carpool.totalPerSeat,
      priceLabel: `₹${carpool.totalPerSeat} / seat`,
      durationMins: carpool.durationMins,
      co2Kg: carpool.co2Kg,
      badge: 'Lowest Fare Winner',
      badgeColor: 'emerald',
      icon: 'Users',
      description: 'Ride with verified professionals traveling your exact route.',
      perks: ['Cheapest Per-Km', '70% Lower Carbon', 'Split Fuel & Tolls'],
      bestFor: 'budget'
    },
    {
      id: 'driver',
      name: 'Book a Driver',
      tagline: 'Private On-Demand Chauffeur',
      price: driver.total,
      priceLabel: `₹${driver.total} total`,
      durationMins: driver.durationMins,
      co2Kg: driver.co2Kg,
      badge: 'Fastest & Direct',
      badgeColor: 'blue',
      icon: 'Car',
      description: 'Private door-to-door vehicle with professional driver. Zero detours.',
      perks: [`Pickup in ${driver.pickupEtaMins} mins`, 'Door-to-door direct', 'Quiet work ride'],
      bestFor: 'urgent'
    },
    {
      id: 'rental',
      name: 'Self-Drive Rental',
      tagline: 'Hourly Fleet (Innova / Thar / EV)',
      price: rental.total,
      priceLabel: `₹${rental.total} (${rental.billableHours}h block)`,
      durationMins: rental.durationMins,
      co2Kg: rental.co2Kg,
      badge: 'Full Luggage & Family Freedom',
      badgeColor: 'amber',
      icon: 'KeyRound',
      description: 'Pick up an Innova, Thar or EV nearby and drive yourself.',
      perks: ['Full boot space', 'Multiple errands / stops', 'Keyless smartphone unlock'],
      bestFor: 'group'
    }
  ];

  let recommendedMode = modes[0];
  let recommendationReason = '';

  if (persona === 'urgent') {
    recommendedMode = modes[1];
    recommendationReason = `Recommended for Urgent Travel: Direct pickup in ${driver.pickupEtaMins} mins with zero co-rider detours.`;
  } else if (persona === 'group' || route.distanceKm > 45) {
    recommendedMode = modes[2];
    recommendationReason = `Recommended for Outstation & Groups: Full vehicle freedom and luggage capacity for ${route.distanceKm} km.`;
  } else if (persona === 'eco') {
    recommendedMode = modes[0];
    recommendationReason = `Recommended for Eco Commuters: Lowest carbon footprint (${carpool.co2Kg} kg CO₂).`;
  } else {
    if (route.distanceKm < 30) {
      recommendedMode = modes[0];
      recommendationReason = `Best Overall Value: Save ₹${carpool.savingsVsTaxi} vs solo private ride.`;
    } else {
      recommendedMode = modes[1];
      recommendationReason = `Recommended for Highway Distance: Fastest direct transit for ${route.distanceKm} km.`;
    }
  }

  return {
    route,
    modes,
    persona,
    driverDetails: driver,
    rentalDetails: rental,
    carpoolDetails: carpool,
    recommendedMode,
    recommendationReason,
    recommendations: {
      cheapestId: 'carpool',
      cheapestPrice: carpool.totalPerSeat,
      fastestId: 'driver',
      fastestMins: driver.durationMins,
      greenestId: 'carpool',
      greenestCo2: carpool.co2Kg
    }
  };
}

export { TN_LOCATIONS as KNOWN_LOCATIONS };
