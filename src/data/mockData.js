/**
 * RideFlow 100% Valid Real-World Transit Data
 * Hub: Tamil Nadu & South Indian Commercial Corridors
 * Includes authentic PIN codes, RTO vehicle registrations, and 5 pre-seeded role personas.
 */

import { generate100Rentals, generate100Carpools, generate40Drivers } from './extendedListings.js';

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

// 100% Valid Indian Commercial Self-Drive Fleet (100 Cars & Bikes)
export const MOCK_RENTALS = generate100Rentals();

// Valid Commercial Driver Captains & Bike Taxis (40 Verified Captains)
export const MOCK_DRIVERS = generate40Drivers();

// Valid Carpool Routes Across Tamil Nadu & South India (100 Active Carpools)
export const MOCK_CARPOOLS = generate100Carpools();

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


