/**
 * RideFlow Extended 100+ Listings Generator
 * Generates 100 Authentic Carpools, 100 Fleet Rentals (Cars & 2-Wheelers), and 40+ Driver Captains
 * Across Tamil Nadu Commercial Corridors & South Indian Transit Hubs
 */

// Authentic South Indian Names & Hosts
const HOST_NAMES = [
  'Ananya Ramakrishnan', 'Alex Chen', 'Siddharth Raman', 'Captain Karthik Selvam', 'Pooja Sundaram',
  'Divya Krishnan', 'Vigneshwaran Mani', 'Sangeetha Balan', 'Aravind Swaminathan', 'Lakshmi Narayanan',
  'Preeti Venkatesh', 'Harish Raghavan', 'Meena Subramanian', 'Kavin Raj', 'Deepa Natarajan',
  'Ashwin Kumar', 'Gautham Vasudevan', 'Nithya Kalyani', 'Saravanan Velu', 'Pavithra Sridhar',
  'Dinesh Chandran', 'Sneha Parthasarathy', 'Manoj Prabhakar', 'Gayathri Murali', 'Ramesh Ayyappan',
  'Shalini Ramasamy', 'Balaji Venkat', 'Revathi Shankar', 'Gokul Kannan', 'Archana Soundararajan',
  'Pradeep Rajendran', 'Swetha Srinivasan', 'Sanjay Bharathi', 'Yamuna Dharmarajan', 'Madhan Kumar',
  'Keerthana Sundar', 'Vijay Annamalai', 'Bhavani Shankar', 'Naveen Prakash', 'Subashini Sethuraman'
];

const HOST_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
];

const COMPANIES = [
  'TCS Siruseri Hub', 'Infosys Sholinganallur', 'Cognizant MEPZ', 'Zoho Estancia',
  'Amazon WTC Perungudi', 'Bosch Coimbatore', 'HCL Tech Navallur', 'PayPal Chennai',
  'Ford Global Technology', 'Standard Chartered GBS', 'Freshworks OMR', 'L&T Technology Services',
  'Renault Nissan Tech', 'TVS Mobility', 'Wipro Electronic City', 'Mahindra Tech Hub'
];

// Verified Corridors & Hub Pairs (From -> To)
const CORRIDOR_ROUTES = [
  { from: 'Anna Nagar Tower Park (600040)', to: 'Siruseri SIPCOT IT Park (603103)', km: 34, lat: 13.0850, lng: 80.2100 },
  { from: 'Chennai Central Railway Station (600003)', to: 'OMR IT Expressway - Sholinganallur (600119)', km: 26, lat: 13.0827, lng: 80.2707 },
  { from: 'T. Nagar Panagal Park (600017)', to: 'Siruseri SIPCOT IT Park (603103)', km: 28, lat: 13.0418, lng: 80.2341 },
  { from: 'Velachery Phoenix Marketcity (600042)', to: 'Navallur OMR Marina Mall (603103)', km: 16, lat: 12.9815, lng: 80.2180 },
  { from: 'Chennai International Airport MAA (600027)', to: 'OMR IT Corridor Hub (600119)', km: 18, lat: 12.9822, lng: 80.1636 },
  { from: 'Guindy Industrial Estate (600032)', to: 'Siruseri SIPCOT IT Park (603103)', km: 24, lat: 13.0067, lng: 80.2026 },
  { from: 'Tambaram Sanatorium (600047)', to: 'Sholinganallur Junction (600119)', km: 19, lat: 12.9279, lng: 80.1215 },
  { from: 'Porur DLF IT Park (600116)', to: 'Perungudi Toll Plaza (600096)', km: 21, lat: 13.0336, lng: 80.1584 },
  { from: 'Thiruvanmiyur Beach Road (600041)', to: 'Siruseri SIPCOT IT Park (603103)', km: 20, lat: 12.9820, lng: 80.2590 },
  { from: 'Koyambedu CMBT Bus Terminus (600107)', to: 'OMR IT Expressway (600119)', km: 29, lat: 13.0694, lng: 80.1948 },
  { from: 'Coimbatore Gandhipuram Central (641012)', to: 'TIDEL Park Coimbatore - Avinashi Rd (641014)', km: 12, lat: 11.0168, lng: 76.9558 },
  { from: 'RS Puram Flower Market (641002)', to: 'Saravanampatti IT Corridor CHIL SEZ (641035)', km: 15, lat: 11.0089, lng: 76.9458 },
  { from: 'Coimbatore International Airport CJB (641014)', to: 'Gandhipuram Central (641012)', km: 11, lat: 11.0300, lng: 77.0434 },
  { from: 'Madurai Meenakshi Amman Temple (625001)', to: 'Madurai IT Park - Ilanthaikulam (625020)', km: 9, lat: 9.9195, lng: 78.1193 },
  { from: 'Mattuthavani Integrated Bus Terminal (625007)', to: 'Madurai International Airport IXM (625022)', km: 18, lat: 9.9453, lng: 78.1542 },
  { from: 'Tiruchirappalli Central Junction (620001)', to: 'NIT Tiruchirappalli - Thuvakudi (620015)', km: 22, lat: 10.7905, lng: 78.6946 },
  { from: 'Salem Central Junction (636005)', to: 'Salem Steel Plant Township (636030)', km: 14, lat: 11.6643, lng: 78.1460 },
  { from: 'Pondicherry White Town Beach Promenade (605001)', to: 'Auroville International Township (605101)', km: 13, lat: 11.9338, lng: 79.8336 },
  { from: 'Vellore VIT University Corridor (632014)', to: 'Chennai Central Railway Station (600003)', km: 138, lat: 12.9692, lng: 79.1559 },
  { from: 'Bengaluru Electronic City Toll (560100)', to: 'Hosur SIPCOT Industrial Complex (635126)', km: 23, lat: 12.8452, lng: 77.6602 },
  { from: 'Chennai Central Hub (600003)', to: 'Mahabalipuram ECR Beach (603104)', km: 55, lat: 13.0827, lng: 80.2707 },
  { from: 'Adyar Gate (600020)', to: 'Mahindra World City Chengalpattu (603002)', km: 46, lat: 13.0012, lng: 80.2565 }
];

// Carpool Vehicle Models & Images
const CARPOOL_VEHICLES = [
  { model: 'Tata Nexon EV Max (Electric SUV)', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600', isEv: true },
  { model: 'Maruti Suzuki Swift Dzire VXi', img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600', isEv: false },
  { model: 'Hyundai Creta SX (Sunroof Edition)', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', isEv: false },
  { model: 'Honda City 1.5 i-VTEC ZX', img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600', isEv: false },
  { model: 'Toyota Innova Crysta 2.4 VX (7-Seater)', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600', isEv: false },
  { model: 'Tata Tiago EV Long Range', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600', isEv: true },
  { model: 'Kia Seltos GTX Plus Turbo', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600', isEv: false },
  { model: 'Maruti Suzuki Ertiga Smart Hybrid', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600', isEv: false },
  { model: 'Mahindra XUV700 AX7 Luxury', img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600', isEv: false },
  { model: 'MG ZS EV Exclusive', img: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600', isEv: true },
  { model: 'Hyundai i20 Asta Turbo', img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', isEv: false },
  { model: 'Maruti Suzuki Baleno Smart Hybrid', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600', isEv: false }
];

const DEPARTURE_TIMES = [
  '06:45 AM', '07:15 AM', '07:30 AM', '07:45 AM', '08:00 AM', '08:15 AM', '08:30 AM',
  '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM', '10:00 AM', '04:45 PM', '05:15 PM',
  '05:45 PM', '06:15 PM', '06:45 PM', '07:15 PM', '07:45 PM', '08:15 PM'
];

const AMENITY_SETS = [
  ['AC Climate Control', 'Fastag Toll Included', 'Spotify Music', 'Non-Smoking'],
  ['Electric Silent Ride', 'Chilled AC', 'Laptop Charging', 'Fastag Enabled'],
  ['Clean Interior', 'Punctual Departure', 'AC On', 'Quiet Commute'],
  ['AC Climate', 'Boot Space Available', 'Women Friendly', 'Verified Host'],
  ['Fastag Express', 'Mobile Chargers', 'Water Bottle', 'Non-Smoking Zone'],
  ['EV Green Commute', 'Chilled AC', 'Bluetooth Audio', 'Fast Corridor Lane']
];

/**
 * Generate 100 Authentic Carpool Listings
 */
export function generate100Carpools() {
  const carpools = [
    // Pre-seeded Carpools (Exact IDs & Personas for full backward compatibility)
    {
      id: 'pool-1',
      hostName: 'Ananya Ramakrishnan',
      hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      hostRating: 4.97,
      hostTrips: 19,
      hostBio: 'Tech Lead at TCS Siruseri. Daily commuter on Anna Nagar ➔ OMR route.',
      from: 'Anna Nagar Tower Park (600040)',
      to: 'Siruseri SIPCOT IT Park (603103)',
      departureTime: '08:30 AM',
      isRecurring: true,
      recurringDays: 'Mon - Fri',
      pricePerSeat: 85,
      availableSeats: 3,
      totalSeats: 4,
      vehicleModel: 'Maruti Suzuki Swift Dzire VXi',
      vehicleImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600',
      amenities: ['AC Climate Control', 'Non-Smoking', 'Toll Fastag', 'Spotify Music'],
      verifiedCompany: 'TCS Siruseri Hub',
      co2SavedKg: 5.4,
      postedByUserId: 'usr_ananya_ram',
      currentLocation: { lat: 13.0850, lng: 80.2100, speedKmH: 40 },
      createdAt: '2026-10-06T08:00:00.000Z'
    },
    {
      id: 'pool-2',
      hostName: 'Alex Chen',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostRating: 4.94,
      hostTrips: 28,
      hostBio: 'Fintech PM in Sholinganallur. Daily office commute with friendly co-riders.',
      from: 'Chennai Central Railway Station (600003)',
      to: 'OMR IT Expressway - Sholinganallur (600119)',
      departureTime: '09:00 AM',
      isRecurring: true,
      recurringDays: 'Mon - Fri',
      pricePerSeat: 90,
      availableSeats: 2,
      totalSeats: 4,
      vehicleModel: 'Tata Nexon EV Max',
      vehicleImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600',
      amenities: ['Electric Silent Ride', 'Chilled AC', 'Laptop Charging'],
      verifiedCompany: 'RideFlow Connect Partner',
      co2SavedKg: 6.8,
      postedByUserId: 'usr_alex_chen',
      currentLocation: { lat: 13.0827, lng: 80.2707, speedKmH: 35 },
      createdAt: '2026-10-06T08:15:00.000Z'
    },
    {
      id: 'pool-3',
      hostName: 'Siddharth Raman',
      hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      hostRating: 4.91,
      hostTrips: 34,
      hostBio: 'Bosch Coimbatore Engineer. Regular commute to TIDEL Park Avinashi Rd.',
      from: 'Coimbatore Gandhipuram Central (641012)',
      to: 'TIDEL Park Coimbatore - Avinashi Rd (641014)',
      departureTime: '08:45 AM',
      isRecurring: true,
      recurringDays: 'Mon - Fri',
      pricePerSeat: 50,
      availableSeats: 3,
      totalSeats: 4,
      vehicleModel: 'Maruti Suzuki Baleno Smart Hybrid',
      vehicleImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600',
      amenities: ['Clean Interior', 'Punctual Departure', 'AC On'],
      verifiedCompany: 'Bosch Coimbatore',
      co2SavedKg: 3.9,
      postedByUserId: 'usr_siddharth',
      currentLocation: { lat: 11.0168, lng: 76.9558, speedKmH: 45 },
      createdAt: '2026-10-06T08:30:00.000Z'
    }
  ];

  // Fill up to 100 listings
  for (let i = 4; i <= 100; i++) {
    const route = CORRIDOR_ROUTES[(i - 1) % CORRIDOR_ROUTES.length];
    const hostName = HOST_NAMES[(i - 1) % HOST_NAMES.length];
    const hostAvatar = HOST_AVATARS[(i - 1) % HOST_AVATARS.length];
    const company = COMPANIES[(i - 1) % COMPANIES.length];
    const vehicle = CARPOOL_VEHICLES[(i - 1) % CARPOOL_VEHICLES.length];
    const departureTime = DEPARTURE_TIMES[(i - 1) % DEPARTURE_TIMES.length];
    const amenities = AMENITY_SETS[(i - 1) % AMENITY_SETS.length];

    const baseRatePerKm = vehicle.isEv ? 2.5 : 3.0;
    const computedPrice = Math.round(Math.max(45, Math.min(260, route.km * baseRatePerKm)));
    const co2Saved = Number((route.km * (vehicle.isEv ? 0.22 : 0.16)).toFixed(1));
    const availableSeats = (i % 3) + 1;
    const totalSeats = vehicle.model.includes('7-Seater') ? 6 : 4;
    const isRecurring = i % 5 !== 0;
    const recurringDays = isRecurring ? (i % 4 === 0 ? 'Mon - Sat' : (i % 7 === 0 ? 'Weekend Special' : 'Mon - Fri')) : 'Single Trip';
    const rating = Number((4.85 + ((i % 15) * 0.01)).toFixed(2));
    const trips = 14 + ((i * 7) % 180);

    carpools.push({
      id: `pool-${i}`,
      hostName,
      hostAvatar,
      hostRating: Math.min(5.0, rating),
      hostTrips: trips,
      hostBio: `Verified mobility host at ${company}. Regular commute along ${route.from.split('(')[0].trim()}.`,
      from: route.from,
      to: route.to,
      departureTime,
      isRecurring,
      recurringDays,
      pricePerSeat: computedPrice,
      availableSeats,
      totalSeats,
      vehicleModel: vehicle.model,
      vehicleImage: vehicle.img,
      amenities,
      verifiedCompany: company,
      co2SavedKg: co2Saved,
      postedByUserId: `usr_host_${i}`,
      currentLocation: {
        lat: Number((route.lat + ((i % 10) - 5) * 0.003).toFixed(4)),
        lng: Number((route.lng + ((i % 10) - 5) * 0.003).toFixed(4)),
        speedKmH: 35 + (i % 25)
      },
      createdAt: new Date(Date.now() - (i * 3600000)).toISOString()
    });
  }

  return carpools;
}

// ------------------------------------------------------------------------------------------------
// RENTAL FLEET DEFINITIONS (50 Cars + 50 Bikes & Scooters = 100 Total)
// ------------------------------------------------------------------------------------------------

const CAR_MODELS = [
  { name: 'Toyota Innova Crysta 2.4 VX (7-Seater)', brand: 'Toyota', type: 'SUV', hourly: 380, daily: 2600, range: 750, seats: 7, trans: 'Manual 5-Speed', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600' },
  { name: 'Mahindra Thar 4x4 Hard Top', brand: 'Mahindra', type: 'SUV', hourly: 420, daily: 2900, range: 600, seats: 4, trans: 'Automatic 4x4', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600' },
  { name: 'Tata Nexon EV Max (437 km Long Range)', brand: 'Tata', type: 'Electric', hourly: 290, daily: 1950, range: 437, seats: 5, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600' },
  { name: 'Maruti Suzuki Swift Dzire Tour (Sedan)', brand: 'Maruti Suzuki', type: 'Sedan', hourly: 180, daily: 1300, range: 750, seats: 5, trans: 'Manual', fuel: 'Petrol / CNG', img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600' },
  { name: 'Hyundai Creta SX (Executive Sunroof)', brand: 'Hyundai', type: 'SUV', hourly: 320, daily: 2250, range: 680, seats: 5, trans: 'Automatic IVT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600' },
  { name: 'Mahindra Scorpio-N Z8L (4x4 Expedition)', brand: 'Mahindra', type: 'SUV', hourly: 460, daily: 3100, range: 720, seats: 7, trans: 'Automatic 4WD', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600' },
  { name: 'Honda City 1.5 i-VTEC ZX (Luxury Sedan)', brand: 'Honda', type: 'Sedan', hourly: 240, daily: 1700, range: 700, seats: 5, trans: 'Automatic CVT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600' },
  { name: 'Hyundai i20 Asta Turbo (Smart Hatchback)', brand: 'Hyundai', type: 'Hatchback', hourly: 160, daily: 1150, range: 650, seats: 5, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600' },
  { name: 'Tata Tiago EV Long Range (Fast Charging)', brand: 'Tata', type: 'Electric', hourly: 140, daily: 990, range: 315, seats: 5, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600' },
  { name: 'Toyota Fortuner 4x4 Legender (VIP Fleet)', brand: 'Toyota', type: 'SUV', hourly: 650, daily: 4800, range: 780, seats: 7, trans: 'Automatic 4x4', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600' },
  { name: 'MG ZS EV Exclusive (461 km Range)', brand: 'MG Motor', type: 'Electric', hourly: 310, daily: 2100, range: 461, seats: 5, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600' },
  { name: 'Kia Seltos GTX Plus Turbo (Compact SUV)', brand: 'Kia', type: 'SUV', hourly: 340, daily: 2350, range: 650, seats: 5, trans: 'Automatic 7DCT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600' },
  { name: 'Mahindra XUV700 AX7 Luxury (Panoramic Skyroof)', brand: 'Mahindra', type: 'SUV', hourly: 480, daily: 3300, range: 740, seats: 7, trans: 'Automatic Torque Converter', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600' },
  { name: 'Hyundai Verna SX(O) Turbo 1.5 (Level 2 ADAS)', brand: 'Hyundai', type: 'Sedan', hourly: 260, daily: 1850, range: 680, seats: 5, trans: 'Automatic 7DCT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600' },
  { name: 'Volkswagen Virtus GT Plus (1.5 TSI DSG)', brand: 'Volkswagen', type: 'Sedan', hourly: 280, daily: 1950, range: 670, seats: 5, trans: 'Automatic DSG', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600' },
  { name: 'Tata Safari Dark Edition (Captain Seats)', brand: 'Tata', type: 'SUV', hourly: 490, daily: 3400, range: 730, seats: 7, trans: 'Automatic 6-Speed', fuel: 'Diesel', img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600' },
  { name: 'BYD Atto 3 Blade Battery EV (521 km Range)', brand: 'BYD', type: 'Electric', hourly: 390, daily: 2700, range: 521, seats: 5, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600' },
  { name: 'Maruti Suzuki Grand Vitara Strong Hybrid', brand: 'Maruti Suzuki', type: 'SUV', hourly: 270, daily: 1900, range: 920, seats: 5, trans: 'e-CVT Hybrid', fuel: 'Hybrid Petrol', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600' },
  { name: 'Maruti Suzuki Ertiga CNG Tour M', brand: 'Maruti Suzuki', type: 'MPV', hourly: 210, daily: 1500, range: 780, seats: 7, trans: 'Manual', fuel: 'CNG / Petrol', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600' },
  { name: 'Tata Punch EV Empowered Plus', brand: 'Tata', type: 'Electric', hourly: 170, daily: 1200, range: 421, seats: 5, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600' }
];

const BIKE_MODELS = [
  { name: 'Royal Enfield Hunter 350 (Dapper Ash)', brand: 'Royal Enfield', type: 'Street Roadster', hourly: 80, daily: 550, range: 450, seats: 2, trans: 'Manual 5-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Ather 450X Gen 3 (Warp Mode EV)', brand: 'Ather Energy', type: 'Electric Scooter', hourly: 60, daily: 420, range: 146, seats: 2, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
  { name: 'Royal Enfield Himalayan 450 (Sherpa Adventure)', brand: 'Royal Enfield', type: 'Adventure Tourer', hourly: 110, daily: 780, range: 480, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
  { name: 'KTM Duke 390 (Hyper Naked Sports)', brand: 'KTM', type: 'Sports Motorcycle', hourly: 120, daily: 840, range: 360, seats: 2, trans: 'Manual 6-Speed with Quickshifter', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' },
  { name: 'Honda Activa 6G (Smart Key Deluxe)', brand: 'Honda', type: 'Gearless Scooter', hourly: 40, daily: 280, range: 260, seats: 2, trans: 'Automatic CVT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600' },
  { name: 'Yamaha Aerox 155 VVA (Maxi Sports)', brand: 'Yamaha', type: 'Maxi Sports Scooter', hourly: 75, daily: 520, range: 340, seats: 2, trans: 'Automatic VVA', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Ola S1 Pro Gen 2 (Hyper Mode 195 km)', brand: 'Ola Electric', type: 'Electric Scooter', hourly: 65, daily: 450, range: 195, seats: 2, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
  { name: 'TVS Apache RTR 200 4V (Ride Modes Edition)', brand: 'TVS', type: 'Street Naked Bike', hourly: 65, daily: 450, range: 420, seats: 2, trans: 'Manual 5-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
  { name: 'Bajaj Pulsar NS200 (Perimeter Frame)', brand: 'Bajaj', type: 'Sports Street Bike', hourly: 60, daily: 430, range: 410, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' },
  { name: 'Suzuki Burgman Street 125 (Maxi Comfort)', brand: 'Suzuki', type: 'Maxi Scooter', hourly: 48, daily: 340, range: 310, seats: 2, trans: 'Automatic CVT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Royal Enfield Classic 350 (Dual Channel ABS)', brand: 'Royal Enfield', type: 'Cruiser', hourly: 85, daily: 590, range: 440, seats: 2, trans: 'Manual 5-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'TVS iQube ST Electric Scooter', brand: 'TVS', type: 'Electric Scooter', hourly: 55, daily: 390, range: 145, seats: 2, trans: 'Automatic EV', fuel: 'Electric (EV)', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600' },
  { name: 'Yamaha YZF R15 V4 (Traction Control)', brand: 'Yamaha', type: 'Track Sports Bike', hourly: 90, daily: 630, range: 380, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' },
  { name: 'Triumph Speed 400 (British Roadster)', brand: 'Triumph', type: 'Modern Classic', hourly: 115, daily: 810, range: 400, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Suzuki Access 125 Bluetooth Edition', brand: 'Suzuki', type: 'Family Scooter', hourly: 42, daily: 290, range: 290, seats: 2, trans: 'Automatic CVT', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600' },
  { name: 'Harley-Davidson X440 (Roadster Denim)', brand: 'Harley-Davidson', type: 'Power Cruiser', hourly: 125, daily: 890, range: 390, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Honda CB350 H\'ness (Thumper Exhaust)', brand: 'Honda', type: 'Classic Roadster', hourly: 88, daily: 610, range: 460, seats: 2, trans: 'Manual 5-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'TVS Ronin 225 (Urban Scrambler)', brand: 'TVS', type: 'Scrambler', hourly: 70, daily: 490, range: 410, seats: 2, trans: 'Manual 5-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
  { name: 'Bajaj Dominar 400 (Hyper Touring)', brand: 'Bajaj', type: 'Tourer', hourly: 105, daily: 740, range: 430, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' },
  { name: 'Yamaha MT-15 V2 (Street Fighter)', brand: 'Yamaha', type: 'Naked Sports', hourly: 85, daily: 590, range: 390, seats: 2, trans: 'Manual 6-Speed', fuel: 'Petrol', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600' }
];

const TRANSIT_LOCATIONS = [
  { name: 'Chennai Central Railway Station (600003)', lat: 13.0827, lng: 80.2707, hub: 'Chennai Central Hub' },
  { name: 'OMR IT Corridor Hub - Sholinganallur (600119)', lat: 12.9010, lng: 80.2279, hub: 'OMR Sholinganallur Hub' },
  { name: 'Chennai International Airport MAA (600027)', lat: 12.9822, lng: 80.1636, hub: 'Chennai Airport Terminal 2' },
  { name: 'Anna Nagar Tower Park Hub (600040)', lat: 13.0850, lng: 80.2100, hub: 'North Chennai Transit Hub' },
  { name: 'T. Nagar Panagal Park Hub (600017)', lat: 13.0418, lng: 80.2341, hub: 'Central T. Nagar Plaza' },
  { name: 'Siruseri SIPCOT IT Park Hub (603103)', lat: 12.8350, lng: 80.2180, hub: 'SIPCOT Technology Fleet' },
  { name: 'Velachery Phoenix Marketcity Hub (600042)', lat: 12.9815, lng: 80.2180, hub: 'Velachery Rapid Hub' },
  { name: 'Guindy Industrial Hub (600032)', lat: 13.0067, lng: 80.2026, hub: 'Guindy Metro Station Hub' },
  { name: 'Coimbatore Gandhipuram Central (641012)', lat: 11.0168, lng: 76.9558, hub: 'Kongu Mobility Hub' },
  { name: 'TIDEL Park Coimbatore - Avinashi Rd (641014)', lat: 11.0300, lng: 77.0300, hub: 'Kovai Tech Corridor' },
  { name: 'Madurai Central Hub (625001)', lat: 9.9252, lng: 78.1198, hub: 'Madurai Railway Junction' },
  { name: 'Tiruchirappalli Central Junction (620001)', lat: 10.7905, lng: 78.6946, hub: 'Trichy Delta Mobility Hub' },
  { name: 'Salem Central Junction Hub (636005)', lat: 11.6643, lng: 78.1460, hub: 'Salem Highway Fleet Hub' },
  { name: 'Pondicherry White Town Beach Promenade (605001)', lat: 11.9338, lng: 79.8336, hub: 'Pondy Coastal Fleet' },
  { name: 'Bengaluru Electronic City Toll Hub (560100)', lat: 12.8452, lng: 77.6602, hub: 'Electronic City Express Hub' }
];

/**
 * Generate 100 Authentic Rental Listings (50 Cars & 50 2-Wheelers)
 */
export function generate100Rentals() {
  const rentals = [];

  // Generate 50 Cars
  for (let i = 1; i <= 50; i++) {
    const template = CAR_MODELS[(i - 1) % CAR_MODELS.length];
    const loc = TRANSIT_LOCATIONS[(i - 1) % TRANSIT_LOCATIONS.length];
    const rating = Number((4.86 + ((i % 14) * 0.01)).toFixed(2));
    const reviews = 38 + ((i * 11) % 190);
    const hostIdx = (i - 1) % HOST_NAMES.length;

    rentals.push({
      id: `rent-${i}`,
      category: 'car',
      name: i > 20 ? `${template.name} • Fleet Edition #${i}` : template.name,
      title: template.name,
      brand: template.brand,
      type: template.type,
      hourlyPrice: template.hourly,
      dailyPrice: template.daily,
      pricePerHour: template.hourly,
      rating: Math.min(5.0, rating),
      reviews,
      rangeKm: template.range,
      seats: template.seats,
      transmission: template.trans,
      location: loc.name,
      image: template.img,
      features: [
        'Sanitized & Inspected',
        template.fuel.includes('EV') ? 'Free Fast Charging Access' : 'Fastag Auto-Pay Installed',
        '24/7 Roadside Assistance',
        'Keyless Bluetooth Unlock'
      ],
      freeCancellation: true,
      instantUnlock: true,
      fuel: template.fuel,
      fuelType: template.fuel,
      hostName: `${HOST_NAMES[hostIdx]} (${loc.hub})`,
      postedByUserId: `usr_fleet_car_${i}`,
      available: true,
      gpsLocation: {
        lat: Number((loc.lat + ((i % 8) - 4) * 0.002).toFixed(4)),
        lng: Number((loc.lng + ((i % 8) - 4) * 0.002).toFixed(4)),
        address: loc.name
      }
    });
  }

  // Generate 50 Bikes & 2-Wheelers
  for (let i = 1; i <= 50; i++) {
    const template = BIKE_MODELS[(i - 1) % BIKE_MODELS.length];
    const loc = TRANSIT_LOCATIONS[(i + 4) % TRANSIT_LOCATIONS.length];
    const rating = Number((4.88 + ((i % 12) * 0.01)).toFixed(2));
    const reviews = 45 + ((i * 13) % 220);
    const hostIdx = (i + 5) % HOST_NAMES.length;

    rentals.push({
      id: `rent-bike-${i}`,
      category: 'bike',
      name: i > 20 ? `${template.name} • Rider Fleet #${i}` : template.name,
      title: template.name,
      brand: template.brand,
      type: template.type,
      hourlyPrice: template.hourly,
      dailyPrice: template.daily,
      pricePerHour: template.hourly,
      rating: Math.min(5.0, rating),
      reviews,
      rangeKm: template.range,
      seats: template.seats,
      transmission: template.trans,
      location: loc.name,
      image: template.img,
      features: [
        'Dual Sanitized Helmets Included',
        'Full Fuel / 100% Charged',
        'Smartphone Handlebar Mount',
        'Instant QR Code Unlock'
      ],
      freeCancellation: true,
      instantUnlock: true,
      fuel: template.fuel,
      fuelType: template.fuel,
      hostName: `${HOST_NAMES[hostIdx]} (Rapid Wheels)`,
      postedByUserId: `usr_fleet_bike_${i}`,
      available: true,
      gpsLocation: {
        lat: Number((loc.lat + ((i % 8) - 4) * 0.002).toFixed(4)),
        lng: Number((loc.lng + ((i % 8) - 4) * 0.002).toFixed(4)),
        address: loc.name
      }
    });
  }

  return rentals;
}

/**
 * Generate 40+ Verified Driver Captains & Bike Taxis
 */
export function generate40Drivers() {
  const drivers = [
    {
      id: 'drv-1',
      category: 'car',
      name: 'Captain Karthik Selvam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.96,
      reviewCount: 328,
      trips: 1420,
      vehicleModel: 'Toyota Innova Crysta 2.4 VX',
      licensePlate: 'TN-01-AX-7892',
      categoryName: 'RideFlow XL (Innova 7-Seater)',
      baseFare: 80,
      perKmRate: 16,
      etaMins: 3,
      distanceKm: 0.8,
      badge: 'Elite Top Captain',
      phone: '+91 98402 33445',
      languages: ['Tamil', 'English'],
      city: 'Chennai',
      greeting: "Vanakkam! Clean AC Innova ready at your pickup location.",
      isFlagged: false,
      currentLocation: { lat: 13.0827, lng: 80.2707, speedKmH: 38 }
    },
    {
      id: 'drv-2',
      category: 'car',
      name: 'Captain Selvam Murugan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 4.92,
      reviewCount: 215,
      trips: 980,
      vehicleModel: 'Maruti Suzuki Swift Dzire Tour',
      licensePlate: 'TN-09-BK-4921',
      categoryName: 'RideFlow Prime Sedan',
      baseFare: 50,
      perKmRate: 12,
      etaMins: 5,
      distanceKm: 1.4,
      badge: 'Punctuality Champion',
      phone: '+91 98404 55667',
      languages: ['Tamil', 'English', 'Telugu'],
      city: 'Chennai (OMR Corridor)',
      greeting: "Vanakkam! Punctual pickup with sanitized seats.",
      isFlagged: false,
      currentLocation: { lat: 12.9716, lng: 80.2458, speedKmH: 44 }
    },
    {
      id: 'drv-3',
      category: 'car',
      name: 'Captain Anand Natarajan',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      rating: 4.89,
      reviewCount: 164,
      trips: 740,
      vehicleModel: 'Mahindra Bolero Power+ Plus',
      licensePlate: 'TN-58-CA-9931',
      categoryName: 'RideFlow Outstation 7S',
      baseFare: 65,
      perKmRate: 14,
      etaMins: 7,
      distanceKm: 2.1,
      badge: 'Highway Veteran',
      phone: '+91 98405 66778',
      languages: ['Tamil', 'Malayalam'],
      city: 'Madurai & Coimbatore',
      greeting: "Vanakkam! Safe highway driving with extra boot capacity.",
      isFlagged: false,
      currentLocation: { lat: 9.9252, lng: 78.1198, speedKmH: 52 }
    },
    {
      id: 'drv-bike-1',
      category: 'bike',
      name: 'Captain Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      rating: 4.98,
      reviewCount: 480,
      trips: 1890,
      vehicleModel: 'Royal Enfield Hunter 350',
      licensePlate: 'TN-02-CC-8819',
      categoryName: 'RideFlow Rapid Bike Taxi',
      baseFare: 20,
      perKmRate: 6,
      etaMins: 2,
      distanceKm: 0.4,
      badge: 'Fastest Transit Captain',
      phone: '+91 98408 33221',
      languages: ['Tamil', 'English'],
      city: 'Chennai Central ➔ OMR',
      greeting: "Vanakkam! Sanitized helmet ready. Beat city traffic in record time!",
      isFlagged: false,
      currentLocation: { lat: 13.0815, lng: 80.2680, speedKmH: 32 }
    },
    {
      id: 'drv-bike-2',
      category: 'bike',
      name: 'Captain Vignesh Selvam',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      rating: 4.91,
      reviewCount: 290,
      trips: 1120,
      vehicleModel: 'Honda Activa 6G Premium',
      licensePlate: 'TN-10-AZ-4421',
      categoryName: 'RideFlow Eco Bike Taxi',
      baseFare: 15,
      perKmRate: 5.5,
      etaMins: 3,
      distanceKm: 0.9,
      badge: 'Safe Rider Star',
      phone: '+91 98407 11994',
      languages: ['Tamil', 'English'],
      city: 'OMR Siruseri Tech Park',
      greeting: "Vanakkam! Smooth eco ride with extra safety gear.",
      isFlagged: false,
      currentLocation: { lat: 12.8350, lng: 80.2180, speedKmH: 28 }
    }
  ];

  for (let i = 6; i <= 40; i++) {
    const isBike = i % 2 === 0;
    const loc = TRANSIT_LOCATIONS[(i - 1) % TRANSIT_LOCATIONS.length];
    const name = `Captain ${HOST_NAMES[(i - 1) % HOST_NAMES.length]}`;
    const avatar = HOST_AVATARS[(i - 1) % HOST_AVATARS.length];
    const rtoPlate = `TN-${String((i % 72) + 1).padStart(2, '0')}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 2) % 26))}-${1000 + (i * 137) % 8999}`;
    const rating = Number((4.90 + ((i % 10) * 0.01)).toFixed(2));
    const trips = 420 + (i * 85);

    const vehicleModel = isBike 
      ? (i % 4 === 0 ? 'Royal Enfield Hunter 350' : (i % 3 === 0 ? 'Ather 450X Warp EV' : 'Honda Activa 6G Premium'))
      : (i % 3 === 0 ? 'Toyota Innova Crysta 2.4 VX' : (i % 2 === 0 ? 'Tata Nexon EV Max' : 'Maruti Suzuki Dzire Tour'));

    drivers.push({
      id: isBike ? `drv-bike-${i}` : `drv-${i}`,
      category: isBike ? 'bike' : 'car',
      name,
      avatar,
      rating: Math.min(5.0, rating),
      reviewCount: 95 + (i * 15),
      trips,
      vehicleModel,
      licensePlate: rtoPlate,
      categoryName: isBike ? 'RideFlow Rapid Bike Taxi' : (vehicleModel.includes('Innova') ? 'RideFlow XL (7-Seater)' : 'RideFlow Prime Sedan'),
      baseFare: isBike ? 20 : 60,
      perKmRate: isBike ? 6 : 14,
      etaMins: 2 + (i % 6),
      distanceKm: Number((0.4 + ((i % 8) * 0.3)).toFixed(1)),
      badge: isBike ? 'Fastest Transit Star' : 'Premier Elite Captain',
      phone: `+91 9840${(i % 10)}${String(10000 + i * 421).slice(0, 5)}`,
      languages: ['Tamil', 'English', i % 3 === 0 ? 'Telugu' : 'Hindi'],
      city: loc.hub,
      greeting: isBike ? 'Vanakkam! Sanitized helmet ready. Swift commute guaranteed.' : 'Vanakkam! Clean AC ride ready at your pickup point.',
      isFlagged: false,
      currentLocation: {
        lat: Number((loc.lat + ((i % 6) - 3) * 0.002).toFixed(4)),
        lng: Number((loc.lng + ((i % 6) - 3) * 0.002).toFixed(4)),
        speedKmH: 32 + (i % 26)
      }
    });
  }

  return drivers;
}
