import express from 'express';
import { pricingService } from '../services/pricingService.js';

const router = express.Router();

// Pre-indexed coordinate matrix for Tamil Nadu and South India
const GEO_COORDINATES = {
  'chennai central': { lat: 13.0827, lng: 80.2707, name: 'Chennai Central Railway Station (600003)' },
  'chennai central railway station': { lat: 13.0827, lng: 80.2707, name: 'Chennai Central Railway Station (600003)' },
  'chennai airport': { lat: 12.9941, lng: 80.1709, name: 'Chennai International Airport MAA (600027)' },
  'chennai international airport': { lat: 12.9941, lng: 80.1709, name: 'Chennai International Airport MAA (600027)' },
  'omr': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'omr it expressway': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'sholinganallur': { lat: 12.9010, lng: 80.2279, name: 'OMR IT Expressway - Sholinganallur (600119)' },
  'siruseri': { lat: 12.8310, lng: 80.2185, name: 'SIPCOT IT Park Siruseri (603103)' },
  't. nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar Commercial Hub (600017)' },
  't nagar': { lat: 13.0418, lng: 80.2341, name: 'T. Nagar Commercial Hub (600017)' },
  'anna nagar': { lat: 13.0850, lng: 80.2100, name: 'Anna Nagar Tower Park (600040)' },
  'tambaram': { lat: 12.9249, lng: 80.1000, name: 'Tambaram Railway Terminal (600045)' },
  'koyambedu': { lat: 13.0694, lng: 80.1948, name: 'Koyambedu CMBT Bus Terminal (600107)' },
  'velachery': { lat: 12.9815, lng: 80.2180, name: 'Velachery MRTS Junction (600042)' },
  'guindy': { lat: 13.0067, lng: 80.2025, name: 'Guindy Industrial Estate (600032)' },
  'mahabalipuram': { lat: 12.6269, lng: 80.1927, name: 'Mahabalipuram Shore Heritage (603104)' },
  'kanchipuram': { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram Silk City (631501)' },

  // Coimbatore & Kongu
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Gandhipuram Central (641012)' },
  'gandhipuram': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore Gandhipuram Central (641012)' },
  'tidel park coimbatore': { lat: 11.0285, lng: 77.0270, name: 'TIDEL Park Coimbatore (641014)' },
  'avinashi': { lat: 11.0285, lng: 77.0270, name: 'TIDEL Park Coimbatore - Avinashi Rd (641014)' },
  'rs puram': { lat: 11.0125, lng: 76.9460, name: 'RS Puram Commercial Center (641002)' },
  'tiruppur': { lat: 11.1085, lng: 77.3411, name: 'Tiruppur Textile City (641601)' },
  'erode': { lat: 11.3410, lng: 77.7172, name: 'Erode Junction (638001)' },
  'salem': { lat: 11.6643, lng: 78.1460, name: 'Salem Junction Terminal (636005)' },

  // Madurai & South
  'madurai': { lat: 9.9195, lng: 78.1193, name: 'Madurai Meenakshi Junction (625001)' },
  'mattuthavani': { lat: 9.9480, lng: 78.1560, name: 'Mattuthavani Bus Terminal (625007)' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli Junction (627001)' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, name: 'Kanyakumari Cape Terminal (629702)' },

  // Central
  'trichy': { lat: 10.7905, lng: 78.7047, name: 'Trichy Central Bus Stand (620001)' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, name: 'Trichy Central Bus Stand (620001)' },
  'thanjavur': { lat: 10.7870, lng: 79.1378, name: 'Thanjavur Brihadeeswara Hub (613001)' },

  // North & Neighbors
  'vellore': { lat: 12.9165, lng: 79.1325, name: 'Vellore Fort & CMC Hub (632004)' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, name: 'Puducherry White Town Promenade (605001)' },
  'puducherry': { lat: 11.9416, lng: 79.8083, name: 'Puducherry White Town Promenade (605001)' },
  'hosur': { lat: 12.7409, lng: 77.8253, name: 'Hosur SIPCOT Electronic City (635109)' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Kempegowda (560001)' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Kempegowda (560001)' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi Central (110001)' },
  'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi Central (110001)' },
  'gurugram': { lat: 28.4595, lng: 77.0266, name: 'Gurugram Cyber City (122002)' },
  'noida': { lat: 28.5355, lng: 77.3910, name: 'Noida Electronic City (201301)' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai BKC & Marine Drive (400001)' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune Hinjawadi IT Hub (411057)' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad HITEC City (500081)' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata Howrah & Salt Lake (700001)' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Cochin MG Road & Infopark (682001)' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad SG Highway (380001)' },
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur Pink City (302001)' },
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow Charbagh (226001)' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, name: 'Chandigarh Sector 17 (160017)' },
  'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa Panaji & Mopa Hub (403001)' }
};

const CACHE = new Map();

function getPreindexedCoords(query) {
  const clean = (query || '').toLowerCase().trim();
  if (!clean) return null;
  
  // Sort keys descending by length so specific places like "tidel park coimbatore" match before "coimbatore"
  const sortedEntries = Object.entries(GEO_COORDINATES).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sortedEntries) {
    if (clean === k || clean.includes(k)) {
      return v;
    }
  }
  return null;
}

async function geocode(query) {
  const preindexed = getPreindexedCoords(query);
  if (preindexed) return preindexed;

  // Try Photon geocoder first (Fast OSM based)
  try {
    const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const pRes = await fetch(pUrl, { headers: { 'User-Agent': 'RideFlow-Mobility-App/1.0' } });
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData && pData.features && pData.features[0]) {
        const coords = pData.features[0].geometry.coordinates;
        return {
          lng: coords[0],
          lat: coords[1],
          name: pData.features[0].properties?.name || query
        };
      }
    }
  } catch (pErr) {
    console.warn('[Photon Geocode Warning]', pErr.message);
  }

  // Fallback to Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' India')}&limit=1`;
    const res = await fetch(url, {
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
    console.warn('[Geocode API Error]', err.message);
  }

  // Fallback default coordinate in Tamil Nadu
  return { lat: 13.0827, lng: 80.2707, name: query };
}

// Calculate Haversine distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadFactor = (R * c) < 20 ? 1.32 : 1.25;
  return Number((R * c * roadFactor).toFixed(1));
}

// GET /api/route/distance?from=...&to=...
router.get('/distance', async (req, res) => {
  try {
    const fromText = (req.query.from || 'Chennai Central').trim();
    const toText = (req.query.to || 'OMR IT Expressway').trim();

    if (fromText.toLowerCase() === toText.toLowerCase()) {
      return res.json({
        success: true,
        distanceKm: 2.0,
        durationMins: 10,
        from: fromText,
        to: toText,
        source: 'local'
      });
    }

    const cacheKey = `${fromText.toLowerCase()}-->${toText.toLowerCase()}`;
    if (CACHE.has(cacheKey)) {
      return res.json(CACHE.get(cacheKey));
    }

    const c1 = await geocode(fromText);
    const c2 = await geocode(toText);

    let distanceKm = 0;
    let durationMins = 0;
    let source = 'osrm-live';

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${c1.lng},${c1.lat};${c2.lng},${c2.lat}?overview=false`;
      const osrmRes = await fetch(osrmUrl);
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (osrmData.code === 'Ok' && osrmData.routes && osrmData.routes[0]) {
          const r = osrmData.routes[0];
          distanceKm = Number((r.distance / 1000).toFixed(1));
          durationMins = Math.max(12, Math.round(r.duration / 60));
        }
      }
    } catch (osrmErr) {
      console.warn('[OSRM Server Route Warning]', osrmErr.message);
    }

    if (!distanceKm || distanceKm <= 0) {
      distanceKm = haversineKm(c1.lat, c1.lng, c2.lat, c2.lng);
      const avgSpeed = distanceKm > 60 ? 55 : 28;
      durationMins = Math.max(12, Math.round((distanceKm / avgSpeed) * 60));
      source = 'haversine-calculated';
    }

    const responseData = {
      success: true,
      distanceKm,
      durationMins,
      from: fromText,
      to: toText,
      origin: c1,
      destination: c2,
      source
    };

    CACHE.set(cacheKey, responseData);
    return res.json(responseData);

  } catch (err) {
    console.error('[Route Distance API Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET/POST /fares - Calculate dynamic route fares with surge pricing
 */
router.all('/fares', (req, res) => {
  const distanceKm = Number(req.query.distanceKm || req.body?.distanceKm || 12.5);
  const surgeMultiplier = req.query.surgeMultiplier ? Number(req.query.surgeMultiplier) : undefined;
  const result = pricingService.calculateFares(distanceKm, { surgeMultiplier });
  return res.json({ success: true, ...result });
});

export default router;
