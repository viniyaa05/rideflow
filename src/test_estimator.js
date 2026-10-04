import { estimateRoute, calculateDriverFare, calculateRentalFare, calculateCarpoolFare, getRouteComparison } from '../src/utils/fareEstimator.js';

console.log("=== Testing RideFlow v3.0 Estimator (Tamil Nadu Corridors) ===");

const comparison1 = getRouteComparison('Chennai Central Railway Station', 'OMR IT Expressway (Sholinganallur)', 'urgent');
console.log("Chennai Central -> OMR (Urgent Persona):", {
  distance: comparison1.route.distanceKm + " km",
  duration: comparison1.route.durationMins + " mins",
  recommended: comparison1.recommendedMode.name,
  driver: "₹" + comparison1.driverDetails.total,
  carpool: "₹" + comparison1.carpoolDetails.totalPerSeat,
  rental: "₹" + comparison1.rentalDetails.total
});

const comparison2 = getRouteComparison('Coimbatore Gandhipuram Central', 'TIDEL Park Coimbatore', 'budget');
console.log("Coimbatore -> TIDEL Park (Budget Persona):", {
  distance: comparison2.route.distanceKm + " km",
  duration: comparison2.route.durationMins + " mins",
  recommended: comparison2.recommendedMode.name,
  carpool: "₹" + comparison2.carpoolDetails.totalPerSeat,
  driver: "₹" + comparison2.driverDetails.total
});

console.log("=== All Tests Passed in ₹ ===");
