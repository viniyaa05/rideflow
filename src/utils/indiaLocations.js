/**
 * Comprehensive India-Wide Geographic Locations, Hubs, Airports, and Railway Stations
 * Covers all Indian States, Union Territories, Metro Corridors, Tech Parks & Major Cities.
 */

export const ALL_INDIA_LOCATIONS = [
  // --- NATIONAL CAPITAL REGION (DELHI NCR) ---
  {
    name: 'Indira Gandhi International Airport (DEL)',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'airport',
    lat: 28.5562,
    lng: 77.1000,
    pincode: '110037',
    popular: true
  },
  {
    name: 'New Delhi Railway Station (NDLS)',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'railway',
    lat: 28.6429,
    lng: 77.2195,
    pincode: '110002',
    popular: true
  },
  {
    name: 'Connaught Place (Rajiv Chowk)',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'city',
    lat: 28.6315,
    lng: 77.2167,
    pincode: '110001',
    popular: true
  },
  {
    name: 'Cyber City - DLF Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    category: 'tech_park',
    lat: 28.4950,
    lng: 77.0895,
    pincode: '122002',
    popular: true
  },
  {
    name: 'Noida Electronic City - Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    category: 'tech_park',
    lat: 28.6280,
    lng: 77.3734,
    pincode: '201309',
    popular: true
  },

  // --- MAHARASHTRA & MUMBAI METROPOLITAN ---
  {
    name: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'airport',
    lat: 19.0896,
    lng: 72.8656,
    pincode: '400099',
    popular: true
  },
  {
    name: 'Bandra-Kurla Complex (BKC)',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'tech_park',
    lat: 19.0657,
    lng: 72.8687,
    pincode: '400051',
    popular: true
  },
  {
    name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'railway',
    lat: 18.9400,
    lng: 72.8354,
    pincode: '400001',
    popular: true
  },
  {
    name: 'Pune Railway Station & Hinjawadi IT Park',
    city: 'Pune',
    state: 'Maharashtra',
    category: 'tech_park',
    lat: 18.5913,
    lng: 73.7389,
    pincode: '411057',
    popular: true
  },
  {
    name: 'Dr. Babasaheb Ambedkar Airport',
    city: 'Nagpur',
    state: 'Maharashtra',
    category: 'airport',
    lat: 21.0922,
    lng: 79.0472,
    pincode: '440005'
  },

  // --- KARNATAKA & BENGALURU ---
  {
    name: 'Kempegowda International Airport (BLR)',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'airport',
    lat: 13.1986,
    lng: 77.7066,
    pincode: '560300',
    popular: true
  },
  {
    name: 'Electronic City Phase 1 & 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'tech_park',
    lat: 12.8452,
    lng: 77.6602,
    pincode: '560100',
    popular: true
  },
  {
    name: 'Whitefield - ITPL Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'tech_park',
    lat: 12.9866,
    lng: 77.7317,
    pincode: '560066',
    popular: true
  },
  {
    name: 'KSR Bengaluru City Railway Station (Majestic)',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'railway',
    lat: 12.9784,
    lng: 77.5694,
    pincode: '560023',
    popular: true
  },
  {
    name: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'city',
    lat: 12.9719,
    lng: 77.6412,
    pincode: '560038'
  },
  {
    name: 'Mysuru Palace & City Central',
    city: 'Mysuru',
    state: 'Karnataka',
    category: 'city',
    lat: 12.3052,
    lng: 76.6552,
    pincode: '570001'
  },

  // --- TAMIL NADU CORRIDORS ---
  {
    name: 'Chennai Central Railway Station (MAS)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'railway',
    lat: 13.0827,
    lng: 80.2707,
    pincode: '600003',
    popular: true
  },
  {
    name: 'Chennai International Airport (MAA)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'airport',
    lat: 12.9941,
    lng: 80.1709,
    pincode: '600027',
    popular: true
  },
  {
    name: 'OMR IT Expressway - Sholinganallur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'tech_park',
    lat: 12.9010,
    lng: 80.2279,
    pincode: '600119',
    popular: true
  },
  {
    name: 'SIPCOT IT Park Siruseri',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'tech_park',
    lat: 12.8310,
    lng: 80.2185,
    pincode: '603103',
    popular: true
  },
  {
    name: 'T. Nagar Commercial Hub - Panagal Park',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 13.0418,
    lng: 80.2341,
    pincode: '600017'
  },
  {
    name: 'Koyambedu CMBT Intercity Terminal',
    city: 'Chennai',
    state: 'Tamil Nadu',
    category: 'railway',
    lat: 13.0694,
    lng: 80.1948,
    pincode: '600107'
  },
  {
    name: 'Coimbatore Gandhipuram Central',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 11.0168,
    lng: 76.9558,
    pincode: '641012',
    popular: true
  },
  {
    name: 'TIDEL Park Coimbatore - Avinashi Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    category: 'tech_park',
    lat: 11.0285,
    lng: 77.0270,
    pincode: '641014'
  },
  {
    name: 'Madurai Meenakshi Junction',
    city: 'Madurai',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 9.9195,
    lng: 78.1193,
    pincode: '625001',
    popular: true
  },
  {
    name: 'Trichy Central Bus Stand & Junction',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 10.7905,
    lng: 78.7047,
    pincode: '620001'
  },
  {
    name: 'Salem Junction Main Terminal',
    city: 'Salem',
    state: 'Tamil Nadu',
    category: 'railway',
    lat: 11.6643,
    lng: 78.1460,
    pincode: '636005'
  },
  {
    name: 'Vellore Fort & CMC Medical Hub',
    city: 'Vellore',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 12.9165,
    lng: 79.1325,
    pincode: '632004'
  },
  {
    name: 'Tirunelveli Junction',
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    category: 'railway',
    lat: 8.7139,
    lng: 77.7567,
    pincode: '627001'
  },
  {
    name: 'Kanyakumari Cape Terminal',
    city: 'Kanyakumari',
    state: 'Tamil Nadu',
    category: 'city',
    lat: 8.0883,
    lng: 77.5385,
    pincode: '629702'
  },

  // --- TELANGANA & ANDHRA PRADESH ---
  {
    name: 'Rajiv Gandhi International Airport (HYD)',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'airport',
    lat: 17.2403,
    lng: 78.4294,
    pincode: '500409',
    popular: true
  },
  {
    name: 'HITEC City & Cyber Towers',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'tech_park',
    lat: 17.4474,
    lng: 78.3762,
    pincode: '500081',
    popular: true
  },
  {
    name: 'Gachibowli Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'tech_park',
    lat: 17.4401,
    lng: 78.3489,
    pincode: '500032'
  },
  {
    name: 'Secunderabad Junction Railway Station',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'railway',
    lat: 17.4344,
    lng: 78.5017,
    pincode: '500003'
  },
  {
    name: 'Visakhapatnam Railway Station & Beach Road',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    category: 'city',
    lat: 17.7231,
    lng: 83.2986,
    pincode: '530004'
  },
  {
    name: 'Vijayawada Central Junction',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    category: 'railway',
    lat: 16.5175,
    lng: 80.6200,
    pincode: '520001'
  },

  // --- KERALA ---
  {
    name: 'Cochin International Airport (COK)',
    city: 'Kochi',
    state: 'Kerala',
    category: 'airport',
    lat: 10.1518,
    lng: 76.3930,
    pincode: '683111',
    popular: true
  },
  {
    name: 'Infopark Kochi - Kakkanad',
    city: 'Kochi',
    state: 'Kerala',
    category: 'tech_park',
    lat: 10.0159,
    lng: 76.3659,
    pincode: '682042'
  },
  {
    name: 'Thiruvananthapuram Central (Trivandrum)',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    category: 'railway',
    lat: 8.4875,
    lng: 76.9525,
    pincode: '695001'
  },
  {
    name: 'Technopark Trivandrum',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    category: 'tech_park',
    lat: 8.5581,
    lng: 76.8810,
    pincode: '695581'
  },
  {
    name: 'Kozhikode Railway Station (Calicut)',
    city: 'Kozhikode',
    state: 'Kerala',
    category: 'city',
    lat: 11.2464,
    lng: 75.7820,
    pincode: '673001'
  },

  // --- WEST BENGAL & EAST INDIA ---
  {
    name: 'Netaji Subhash Chandra Bose Airport (CCU)',
    city: 'Kolkata',
    state: 'West Bengal',
    category: 'airport',
    lat: 22.6547,
    lng: 88.4467,
    pincode: '700052',
    popular: true
  },
  {
    name: 'Howrah Railway Junction',
    city: 'Kolkata',
    state: 'West Bengal',
    category: 'railway',
    lat: 22.5839,
    lng: 88.3426,
    pincode: '711101',
    popular: true
  },
  {
    name: 'Salt Lake Sector V Tech Hub',
    city: 'Kolkata',
    state: 'West Bengal',
    category: 'tech_park',
    lat: 22.5867,
    lng: 88.4357,
    pincode: '700091'
  },
  {
    name: 'Biju Patnaik Airport',
    city: 'Bhubaneswar',
    state: 'Odisha',
    category: 'airport',
    lat: 20.2444,
    lng: 85.8178,
    pincode: '751020'
  },
  {
    name: 'Patna Junction Railway Station',
    city: 'Patna',
    state: 'Bihar',
    category: 'railway',
    lat: 25.6022,
    lng: 85.1376,
    pincode: '800001'
  },
  {
    name: 'Lokpriya Gopinath Bordoloi Airport',
    city: 'Guwahati',
    state: 'Assam',
    category: 'airport',
    lat: 26.1061,
    lng: 91.5859,
    pincode: '781015'
  },

  // --- GUJARAT & RAJASTHAN ---
  {
    name: 'Sardar Vallabhbhai Patel Airport (AMD)',
    city: 'Ahmedabad',
    state: 'Gujarat',
    category: 'airport',
    lat: 23.0772,
    lng: 72.6347,
    pincode: '380003',
    popular: true
  },
  {
    name: 'GIFT City Gandhinagar',
    city: 'Gandhinagar',
    state: 'Gujarat',
    category: 'tech_park',
    lat: 23.1610,
    lng: 72.6841,
    pincode: '382355'
  },
  {
    name: 'Surat Railway Station & Diamond Bourse',
    city: 'Surat',
    state: 'Gujarat',
    category: 'city',
    lat: 21.2049,
    lng: 72.8411,
    pincode: '395003'
  },
  {
    name: 'Jaipur International Airport (JAI)',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'airport',
    lat: 26.8286,
    lng: 75.8056,
    pincode: '302011',
    popular: true
  },
  {
    name: 'Jaipur Junction & MI Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'railway',
    lat: 26.9196,
    lng: 75.7878,
    pincode: '302006'
  },
  {
    name: 'Udaipur City Palace & Lake Pichola',
    city: 'Udaipur',
    state: 'Rajasthan',
    category: 'city',
    lat: 24.5764,
    lng: 73.6835,
    pincode: '313001'
  },

  // --- UTTAR PRADESH & CENTRAL INDIA ---
  {
    name: 'Chaudhary Charan Singh Airport (LKO)',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    category: 'airport',
    lat: 26.7606,
    lng: 80.8893,
    pincode: '226009',
    popular: true
  },
  {
    name: 'Lucknow Charbagh Railway Station',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    category: 'railway',
    lat: 26.8322,
    lng: 80.9238,
    pincode: '226004'
  },
  {
    name: 'Varanasi Cantt Railway Station (BSB)',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'railway',
    lat: 25.3283,
    lng: 82.9863,
    pincode: '221002'
  },
  {
    name: 'Taj Mahal Complex & Agra Cantt',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'city',
    lat: 27.1751,
    lng: 78.0421,
    pincode: '282001'
  },
  {
    name: 'Devi Ahilyabai Holkar Airport',
    city: 'Indore',
    state: 'Madhya Pradesh',
    category: 'airport',
    lat: 22.7217,
    lng: 75.8011,
    pincode: '452005'
  },
  {
    name: 'Bhopal Habibganj (Rani Kamlapati)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    category: 'railway',
    lat: 23.2185,
    lng: 77.4385,
    pincode: '462016'
  },

  // --- PUNJAB, HARYANA & CHANDIGARH ---
  {
    name: 'Shaheed Bhagat Singh Airport (IXC)',
    city: 'Chandigarh',
    state: 'Chandigarh',
    category: 'airport',
    lat: 30.6735,
    lng: 76.7885,
    pincode: '160003',
    popular: true
  },
  {
    name: 'Sector 17 Commercial Plaza',
    city: 'Chandigarh',
    state: 'Chandigarh',
    category: 'city',
    lat: 30.7415,
    lng: 76.7794,
    pincode: '160017'
  },
  {
    name: 'Golden Temple & Amritsar Station',
    city: 'Amritsar',
    state: 'Punjab',
    category: 'city',
    lat: 31.6200,
    lng: 74.8765,
    pincode: '143001'
  },

  // --- GOA & UNION TERRITORIES ---
  {
    name: 'Manohar International Airport Mopa (GOX)',
    city: 'Mopa',
    state: 'Goa',
    category: 'airport',
    lat: 15.7667,
    lng: 73.8667,
    pincode: '403512',
    popular: true
  },
  {
    name: 'Dabolim Airport & Vasco da Gama',
    city: 'Dabolim',
    state: 'Goa',
    category: 'airport',
    lat: 15.3808,
    lng: 73.8314,
    pincode: '403801'
  },
  {
    name: 'Puducherry White Town & Rock Beach',
    city: 'Puducherry',
    state: 'Puducherry',
    category: 'city',
    lat: 11.9338,
    lng: 79.8358,
    pincode: '605001'
  }
];

/**
 * Filter India-wide locations based on search query
 * Matches city, name, state, and category
 */
export function searchIndiaLocations(query = '') {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    // Return popular default locations if query is empty
    return ALL_INDIA_LOCATIONS.filter((loc) => loc.popular).slice(0, 8);
  }

  // Exact word boundary matches get priority
  const matches = ALL_INDIA_LOCATIONS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(clean) ||
      loc.city.toLowerCase().includes(clean) ||
      loc.state.toLowerCase().includes(clean) ||
      (loc.pincode && loc.pincode.includes(clean))
    );
  });

  // Sort by priority: exact prefix first, then popular, then alphabetical
  matches.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(clean) || a.city.toLowerCase().startsWith(clean);
    const bStarts = b.name.toLowerCase().startsWith(clean) || b.city.toLowerCase().startsWith(clean);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, 8);
}
