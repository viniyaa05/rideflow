/**
 * RideFlow 100% Valid Real-World Transit Data
 * Hub: Tamil Nadu & South Indian Commercial Corridors
 * Includes authentic PIN codes, RTO vehicle registrations, and 5 pre-seeded role personas.
 */

// 5 Pre-Seeded Realistic User Personas (Commuters & Drivers)
export const SEEDED_PERSONAS = [
  {
    id: 'usr_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@rideflow.in',
    password: 'alex123',
    role: 'HOST_RIDER',
    roleLabel: 'Gold Commuter & Host',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98401 23456',
    loyaltyTier: 'Gold Commuter',
    rewardPoints: 1420,
    walletBalance: 1250.00,
    isHost: true,
    isAdmin: false,
    isFlagged: false,
    strikeCount: 0,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Daily commuter on Chennai Central ➔ OMR corridor. Offers weekend carpool rides.',
    stats: {
      totalTrips: 28,
      co2SavedKg: 84.5,
      moneySavedRupees: 2840.00,
      preferredMode: 'Carpool Connect'
    }
  },
  {
    id: 'usr_pooja_sundaram',
    name: 'Pooja Sundaram',
    email: 'pooja.sundaram@gmail.com',
    password: 'pooja123',
    role: 'SOLO_RIDER',
    roleLabel: 'Solo Tech Commuter',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98409 11223',
    loyaltyTier: 'Silver Member',
    rewardPoints: 580,
    walletBalance: 650.00,
    isHost: false,
    isAdmin: false,
    isFlagged: false,
    strikeCount: 0,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Senior Software Engineer at OMR IT Park. Prefers private drivers, bike taxis and verified carpools.',
    stats: {
      totalTrips: 14,
      co2SavedKg: 38.2,
      moneySavedRupees: 1450.00,
      preferredMode: 'Book a Driver'
    }
  },
  {
    id: 'usr_capt_karthik',
    name: 'Captain Karthik Selvam',
    email: 'captain.karthik@rideflow.in',
    password: 'karthik123',
    role: 'COMMERCIAL_DRIVER',
    roleLabel: 'Driver Partner Captain',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98402 33445',
    loyaltyTier: 'Commercial Premier Captain',
    rewardPoints: 3200,
    walletBalance: 4850.00,
    isHost: true,
    isAdmin: false,
    isDriver: true,
    isFlagged: false,
    strikeCount: 0,
    vehicleModel: 'Toyota Innova Crysta 2.4 VX (7-Seater)',
    licensePlate: 'TN-01-AX-7892',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Commercial badge driver with 1,420 completed trips and 4.96⭐ rating across Chennai & Outstation.',
    stats: {
      totalTrips: 1420,
      co2SavedKg: 210.0,
      moneySavedRupees: 42000.00,
      preferredMode: 'Book a Driver'
    }
  },
  {
    id: 'usr_ananya_ram',
    name: 'Ananya Ramakrishnan',
    email: 'ananya.r@tcs.com',
    password: 'ananya123',
    role: 'CORPORATE_HOST',
    roleLabel: 'Corporate Carpool Host',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98403 77889',
    loyaltyTier: 'Corporate Eco Ambassador',
    rewardPoints: 950,
    walletBalance: 1100.00,
    isHost: true,
    isAdmin: false,
    isFlagged: false,
    strikeCount: 0,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'TCS Siruseri Tech Lead. Hosts regular Monday-Friday carpool from Anna Nagar to Siruseri.',
    stats: {
      totalTrips: 19,
      co2SavedKg: 62.4,
      moneySavedRupees: 2100.00,
      preferredMode: 'Carpool Connect'
    }
  },
  {
    id: 'usr_rajesh_bike',
    name: 'Rajesh Kumar',
    email: 'rajesh.rider@rideflow.in',
    password: 'rajesh123',
    role: 'BIKE_CAPTAIN',
    roleLabel: 'Bike Taxi Captain & Commuter',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98408 33221',
    loyaltyTier: 'Rapid Rider Captain',
    rewardPoints: 1120,
    walletBalance: 1850.00,
    isHost: true,
    isAdmin: false,
    isDriver: true,
    isFlagged: false,
    strikeCount: 0,
    vehicleModel: 'Royal Enfield Hunter 350 (Dapper Ash)',
    licensePlate: 'TN-02-CC-8819',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Verified Bike Taxi Captain offering swift 1-passenger commutes through peak Chennai traffic.',
    stats: {
      totalTrips: 340,
      co2SavedKg: 95.0,
      moneySavedRupees: 8900.00,
      preferredMode: 'Bike Taxi'
    }
  }
];

// Dedicated Super Admin Credentials (Separated from regular commuter cards)
export const ADMIN_CREDENTIALS = {
  id: 'usr_super_admin',
  name: 'Super Admin Officer',
  email: 'admin@rideflow.in',
  password: 'admin123',
  role: 'SUPER_ADMIN',
  roleLabel: 'Root Administrator',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  phone: '+91 94440 99999',
  loyaltyTier: 'Transport Safety Administrator',
  rewardPoints: 9999,
  walletBalance: 50000.00,
  isHost: true,
  isAdmin: true,
  isFlagged: false,
  strikeCount: 0,
  badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  description: 'Chief Safety Officer with permissions to monitor live fleet telemetry, manage 3-strike flags, and review appeals.',
  stats: {
    totalTrips: 420,
    co2SavedKg: 980.0,
    moneySavedRupees: 65000.00,
    preferredMode: 'Admin Console'
  }
};

// Valid Tamil Nadu Locations with Real PIN Codes
export const TN_LOCATIONS = [
  'Chennai Central Railway Station (600003)',
  'OMR IT Expressway - Sholinganallur (600119)',
  'Chennai International Airport MAA (600027)',
  'Anna Nagar Tower Park (600040)',
  'T. Nagar Panagal Park (600017)',
  'Siruseri SIPCOT IT Park (603103)',
  'Marina Beach Promenade (600005)',
  'Coimbatore Gandhipuram Central (641012)',
  'TIDEL Park Coimbatore - Avinashi Rd (641014)',
  'Coimbatore International Airport CJB (641014)',
  'Madurai Meenakshi Amman Temple (625001)',
  'Madurai International Airport IXM (625022)',
  'Tiruchirappalli Central Junction (620001)',
  'NIT Tiruchirappalli - Thuvakudi (620015)',
  'Salem Central Junction (636005)',
  'Pondicherry White Town Beach Promenade (605001)',
  'Bengaluru Electronic City Toll (560100)'
];

// 100% Valid Indian Commercial Self-Drive Fleet (Cars & Bikes)
export const MOCK_RENTALS = [
  // --- Cars ---
  {
    id: 'rent-1',
    category: 'car',
    name: 'Toyota Innova Crysta 2.4 VX (7-Seater)',
    brand: 'Toyota',
    type: 'SUV',
    hourlyPrice: 380,
    dailyPrice: 2600,
    rating: 4.94,
    reviews: 64,
    rangeKm: 750,
    seats: 7,
    transmission: 'Manual 5-Speed',
    location: 'Chennai Central Hub (600003)',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    features: ['Roof Luggage Carrier', 'Rear AC Vents', 'GPS Fastag Enabled', 'Full ₹5L Insurance'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Diesel',
    hostName: 'Karthik Fleet Services',
    gpsLocation: { lat: 13.0827, lng: 80.2707, address: 'Chennai Central Railway Hub' }
  },
  {
    id: 'rent-2',
    category: 'car',
    name: 'Mahindra Thar 4x4 Hard Top',
    brand: 'Mahindra',
    type: 'SUV',
    hourlyPrice: 420,
    dailyPrice: 2900,
    rating: 4.96,
    reviews: 82,
    rangeKm: 600,
    seats: 4,
    transmission: 'Automatic 4x4',
    location: 'Anna Nagar Hub, Chennai (600040)',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    features: ['Convertible 4x4', 'Touchscreen Infotainment', 'High Ground Clearance', 'Free Cancellation'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Diesel',
    hostName: 'Chennai SelfDrive Co.',
    gpsLocation: { lat: 13.0850, lng: 80.2100, address: 'Anna Nagar 2nd Avenue' }
  },
  {
    id: 'rent-3',
    category: 'car',
    name: 'Tata Nexon EV Max (437 km Range)',
    brand: 'Tata',
    type: 'Electric',
    hourlyPrice: 290,
    dailyPrice: 1950,
    rating: 4.91,
    reviews: 47,
    rangeKm: 437,
    seats: 5,
    transmission: 'Automatic EV',
    location: 'OMR IT Corridor Hub (600119)',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
    features: ['Zero Emissions', 'Free CCS2 Fast Charging Included', 'Smartphone Keyless Unlock'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Electric (EV)',
    hostName: 'EcoRide Tamil Nadu',
    gpsLocation: { lat: 12.9010, lng: 80.2279, address: 'Sholinganallur Junction' }
  },
  {
    id: 'rent-4',
    category: 'car',
    name: 'Maruti Suzuki Swift Dzire Tour (Sedan)',
    brand: 'Maruti Suzuki',
    type: 'Sedan',
    hourlyPrice: 180,
    dailyPrice: 1300,
    rating: 4.88,
    reviews: 118,
    rangeKm: 750,
    seats: 5,
    transmission: 'Manual',
    location: 'T. Nagar Hub, Chennai (600017)',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&auto=format&fit=crop&q=80',
    features: ['24 km/l Mileage', 'Boot Space 378L', 'Chilled AC', 'Free Cancellation'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Petrol / CNG',
    hostName: 'Tamil Nadu Cabs Fleet',
    gpsLocation: { lat: 13.0418, lng: 80.2341, address: 'Panagal Park Hub' }
  },
  
  // --- Bikes & 2-Wheelers ---
  {
    id: 'rent-bike-1',
    category: 'bike',
    name: 'Royal Enfield Classic 350 (Stealth Black)',
    brand: 'Royal Enfield',
    type: 'Cruiser Motorcycle',
    hourlyPrice: 85,
    dailyPrice: 590,
    rating: 4.97,
    reviews: 142,
    rangeKm: 420,
    seats: 2,
    transmission: 'Manual 5-Speed',
    location: 'Chennai Central Hub (600003)',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    features: ['Dual Channel ABS', 'Free ISI Helmet Provided', 'Mobile Mount & USB Charger', 'Zero Deposit'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Petrol',
    hostName: 'Chennai Bullet Rentals',
    gpsLocation: { lat: 13.0835, lng: 80.2740, address: 'Chennai Central Station' }
  },
  {
    id: 'rent-bike-2',
    category: 'bike',
    name: 'Ola S1 Pro Gen 2 (Electric Scooter)',
    brand: 'Ola Electric',
    type: 'Electric Scooter',
    hourlyPrice: 55,
    dailyPrice: 380,
    rating: 4.92,
    reviews: 98,
    rangeKm: 195,
    seats: 2,
    transmission: 'Automatic EV',
    location: 'OMR IT Corridor Hub (600119)',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600&auto=format&fit=crop&q=80',
    features: ['120 km/h Top Speed', 'Hyper Mode', 'Touchscreen GPS Map', 'Free Fast Charging'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Electric (EV)',
    hostName: 'GreenWheels Tamil Nadu',
    gpsLocation: { lat: 12.8990, lng: 80.2285, address: 'OMR Tech Corridor' }
  },
  {
    id: 'rent-bike-3',
    category: 'bike',
    name: 'TVS Jupiter 125 Disc SmartXonnect',
    brand: 'TVS',
    type: 'Gearless Scooter',
    hourlyPrice: 45,
    dailyPrice: 320,
    rating: 4.86,
    reviews: 165,
    rangeKm: 280,
    seats: 2,
    transmission: 'Automatic CVT',
    location: 'Coimbatore Gandhipuram (641012)',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    features: ['33L Underseat Storage (2 Helmets)', 'Front Fuel Fill', 'ET-Fi EcoThrust 50 km/l'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Petrol',
    hostName: 'Kovai Bike Point',
    gpsLocation: { lat: 11.0168, lng: 76.9558, address: 'Gandhipuram Bus Stand' }
  },
  {
    id: 'rent-bike-4',
    category: 'bike',
    name: 'Yamaha Aerox 155 VVA (Maxi Sports)',
    brand: 'Yamaha',
    type: 'Maxi Sports Scooter',
    hourlyPrice: 75,
    dailyPrice: 520,
    rating: 4.95,
    reviews: 74,
    rangeKm: 340,
    seats: 2,
    transmission: 'Automatic VVA',
    location: 'Madurai Central Hub (625001)',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    features: ['155cc R15 Liquid-Cooled Engine', 'Traction Control', 'LED Projector Headlamps'],
    freeCancellation: true,
    instantUnlock: true,
    fuel: 'Petrol',
    hostName: 'Madurai Riders Hub',
    gpsLocation: { lat: 9.9252, lng: 78.1198, address: 'Madurai Junction' }
  }
];

// Valid Commercial Driver Captains & Bike Taxis
export const MOCK_DRIVERS = [
  // --- Car Chauffeurs ---
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
  
  // --- Bike Taxi Captains ---
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

// Valid Carpool Routes
export const MOCK_CARPOOLS = [
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
    currentLocation: { lat: 13.0850, lng: 80.2100, speedKmH: 40 }
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
    currentLocation: { lat: 13.0827, lng: 80.2707, speedKmH: 35 }
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
    currentLocation: { lat: 11.0168, lng: 76.9558, speedKmH: 45 }
  }
];

export const INITIAL_USER_BOOKINGS = [
  {
    id: 'RF-TN-849201',
    mode: 'Carpool Connect',
    title: 'Shared Commute with Ananya Ramakrishnan',
    scheduledTime: 'Today, 08:30 AM',
    fare: 85,
    discount: 0,
    driverOrHost: 'Maruti Swift Dzire • TCS Siruseri Partner',
    driverPhone: '+91 98403 77889',
    paymentMethod: 'wallet',
    paymentMethodName: 'RideFlow Wallet',
    status: 'Confirmed',
    rideOtp: '4892',
    isOtpVerified: false,
    pickupEta: 'Driver arriving in ~4 mins (0.6 km away)',
    pickupLocation: 'Chennai Central Railway Station (600003)',
    dropoffLocation: 'OMR IT Expressway - Sholinganallur (600119)',
    driverCoordinates: { lat: 13.0827, lng: 80.2707, speedKmH: 36 },
    canCancel: true,
    refundAmount: 85,
    createdAt: '08:10 AM'
  }
];

// User Reporting & 3-Strike Moderation System
export const MOCK_USER_REPORTS = [
  {
    id: 'rep-1',
    targetUserId: 'usr_rash_driver',
    targetName: 'Vijay K. (Indica Driver)',
    targetRole: 'Driver',
    reporterName: 'Pooja Sundaram',
    date: 'Today, 09:30 AM',
    reason: 'Unsafe Speeding & Harsh Braking',
    description: 'Driver was cutting lanes recklessly near Tidal Park junction on OMR and refused to slow down.',
    status: 'Flagged (3 Strikes Reached)',
    strikeNumber: 3,
    actionTaken: 'Account suspended pending appeal.'
  },
  {
    id: 'rep-2',
    targetUserId: 'usr_rash_driver',
    targetName: 'Vijay K. (Indica Driver)',
    targetRole: 'Driver',
    reporterName: 'Karthik S.',
    date: 'Yesterday, 06:15 PM',
    reason: 'Route Deviation & Fare Demands',
    description: 'Demanded ₹100 extra in cash outside the app.',
    status: 'Strike 2 Recorded',
    strikeNumber: 2,
    actionTaken: 'Formal warning SMS dispatched.'
  },
  {
    id: 'rep-3',
    targetUserId: 'usr_rash_driver',
    targetName: 'Vijay K. (Indica Driver)',
    targetRole: 'Driver',
    reporterName: 'Ananya R.',
    date: '3 days ago',
    reason: 'Vehicle AC Mismatch',
    description: 'Vehicle AC was broken and driver refused to open windows properly.',
    status: 'Strike 1 Recorded',
    strikeNumber: 1,
    actionTaken: 'Inspection ticket opened.'
  }
];

// User Appeal Submissions for Flagged Accounts
export const MOCK_USER_APPEALS = [
  {
    id: 'app-101',
    userId: 'usr_rash_driver',
    userName: 'Vijay K.',
    userRole: 'Driver Partner',
    strikeCount: 3,
    dateSubmitted: 'Today, 10:05 AM',
    status: 'Pending Review',
    reasonForFlag: 'Unsafe Driving & Route Deviation (3 Strikes)',
    explanation: 'Vanakkam Admin, my speedometer sensor was malfunctioning which caused inaccurate telemetry. I have serviced the vehicle at TVS Mobility Guindy today and attached the service receipt. Please clear the suspension.',
    adminNotes: ''
  }
];

// Support Queries & Inquiries Desk for Admin
export const MOCK_SUPPORT_QUERIES = [
  {
    id: 'sup-1',
    userName: 'Pooja Sundaram',
    userEmail: 'pooja.sundaram@gmail.com',
    category: 'Bike Taxi Availability',
    subject: 'Requesting more Bike Taxi Captains near Sholinganallur',
    message: 'Vanakkam Team, evening rush hours between 6 PM to 8 PM on OMR have high demand for Bike Taxis. Can you onboard more captains near ELCOT SEZ?',
    date: 'Today, 09:15 AM',
    status: 'Open',
    adminReply: ''
  },
  {
    id: 'sup-2',
    userName: 'Alex Chen',
    userEmail: 'alex.chen@rideflow.in',
    category: 'GST Tax Invoice',
    subject: 'Need corporate GST invoice copy for IT reimbursement',
    message: 'The PDF download feature is working great! Wanted to verify if the SAC code 996412 is accepted for input tax credit.',
    date: 'Yesterday',
    status: 'Resolved',
    adminReply: 'Yes Alex, SAC 996412 is 100% compliant for corporate input tax credit under Tamil Nadu GST rules.'
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    targetType: 'driver',
    targetName: 'Captain Karthik Selvam',
    targetModel: 'Toyota Innova Crysta (TN-01-AX-7892)',
    userName: 'Pooja Sundaram',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 5,
    date: 'Yesterday',
    tags: ['Super Punctual', 'Chilled AC', 'Smooth Driving'],
    comment: 'Captain Karthik arrived 5 minutes early at Chennai Central. Excellent driving on the OMR toll expressway!'
  },
  {
    id: 'rev-2',
    targetType: 'rental',
    targetName: 'Tata Nexon EV Max',
    targetModel: 'Electric SUV',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 5,
    date: '2 days ago',
    tags: ['Keyless Unlock', 'Quiet EV', 'Clean Interior'],
    comment: 'Smartphone keyless unlock worked seamlessly. Drove to Mahabalipuram and back on a single charge with zero emissions!'
  },
  {
    id: 'rev-3',
    targetType: 'bike_taxi',
    targetName: 'Captain Rajesh Kumar',
    targetModel: 'Royal Enfield Hunter 350',
    userName: 'Pooja Sundaram',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 5,
    date: 'Today',
    tags: ['Sanitized Helmet', 'Beat the Traffic', 'Fast Transit'],
    comment: 'Best way to travel on OMR during peak hours! Reached my office in 18 minutes through heavy traffic.'
  }
];

export const MOCK_ADMIN_INCIDENTS = [
  {
    id: 'inc-101',
    driverName: 'Captain Selvam Murugan',
    vehiclePlate: 'TN-09-BK-4921',
    reporterName: 'Automated Telemetry Sensor',
    date: 'Today, 10:15 AM',
    type: 'Speed Telemetry Warning',
    description: 'Vehicle exceeded 80 km/h speed limit on OMR Elevated Corridor (recorded 86 km/h).',
    severity: 'Medium',
    status: 'Driver Warned',
    actionTaken: 'Automated SMS advisory dispatched to captain.'
  }
];

export const MOCK_RECENT_TRIPS = [
  {
    id: 'past-trip-1',
    mode: 'Carpool Connect',
    title: 'OMR Express Commute with Ananya',
    date: 'Yesterday, 06:15 PM',
    from: 'OMR IT Expressway - Sholinganallur (600119)',
    to: 'Chennai Central Railway Station (600003)',
    fare: 85,
    status: 'Completed',
    vehicleModel: 'Maruti Swift Dzire (TN-11-CC-2041)',
    co2SavedKg: 3.2,
    hasReviewed: false,
    reviewTarget: {
      type: 'carpool',
      name: 'Ananya Ramakrishnan',
      model: 'Maruti Swift Dzire'
    }
  },
  {
    id: 'past-trip-2',
    mode: 'Book a Driver',
    title: 'Airport Transfer MAA with Captain Karthik',
    date: '3 days ago',
    from: 'Anna Nagar Tower Park (600040)',
    to: 'Chennai International Airport MAA (600027)',
    fare: 450,
    status: 'Completed',
    vehicleModel: 'Toyota Innova Crysta (TN-01-AX-7892)',
    co2SavedKg: 0,
    hasReviewed: true,
    reviewTarget: {
      type: 'driver',
      name: 'Captain Karthik Selvam',
      model: 'Toyota Innova Crysta'
    }
  },
  {
    id: 'past-trip-3',
    mode: 'Self-Drive Rental',
    title: 'Weekend Trip to Mahabalipuram',
    date: 'Last Weekend',
    from: 'Chennai Central Hub (600003)',
    to: 'Mahabalipuram ECR Beach',
    fare: 1950,
    status: 'Completed',
    vehicleModel: 'Tata Nexon EV Max (Electric SUV)',
    co2SavedKg: 14.8,
    hasReviewed: true,
    reviewTarget: {
      type: 'rental',
      name: 'Tata Nexon EV Max',
      model: 'Electric SUV'
    }
  }
];


