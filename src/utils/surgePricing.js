/**
 * Algorithmic Dynamic Surge Pricing & Carbon Offset Formula Engine
 * 
 * Non-CRUD Resume Defense Feature:
 * Calculates real-time corridor congestion, peak-hour coefficients,
 * EV carbon displacement, and GST breakdowns.
 */

// Rush hours in Tamil Nadu tech corridors (8:30-10:30 AM & 5:30-8:30 PM)
export function calculateSurgeMultiplier(origin = '', destination = '', date = new Date()) {
  const hour = date.getHours();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  let multiplier = 1.0;
  let reason = 'Standard Corridor Flow';
  let level = 'normal'; // 'normal' | 'moderate' | 'peak' | 'severe'

  const isOMRorAirport = 
    origin.toLowerCase().includes('omr') || 
    origin.toLowerCase().includes('airport') ||
    destination.toLowerCase().includes('omr') || 
    destination.toLowerCase().includes('airport') ||
    origin.toLowerCase().includes('tidel') ||
    destination.toLowerCase().includes('tidel');

  // Morning Peak (08:30 - 10:30)
  if (!isWeekend && hour >= 8 && hour <= 10) {
    multiplier = isOMRorAirport ? 1.35 : 1.20;
    reason = 'Morning IT Corridor Commute Peak';
    level = 'peak';
  }
  // Evening Peak (17:30 - 20:30)
  else if (!isWeekend && hour >= 17 && hour <= 20) {
    multiplier = isOMRorAirport ? 1.45 : 1.25;
    reason = 'Evening Tech Corridor Congestion Surge';
    level = 'severe';
  }
  // Weekend Leisure Peak to ECR / Marina / Airport
  else if (isWeekend && hour >= 16 && hour <= 21) {
    multiplier = 1.18;
    reason = 'Weekend Outstation & Promenade Traffic';
    level = 'moderate';
  }
  // Late Night Safe Transit (23:00 - 05:00)
  else if (hour >= 23 || hour <= 4) {
    multiplier = 1.15;
    reason = 'Night-Time Driver Incentive Premium';
    level = 'moderate';
  }

  return {
    multiplier,
    reason,
    level,
    formattedPercentage: `${Math.round((multiplier - 1.0) * 100)}% Surge`
  };
}

/**
 * Calculates CO2 Carbon Emissions Displaced by Mode vs Solo ICE Car
 * Standard ICE car emits ~140g CO2 per km.
 */
export function calculateCarbonOffset(distanceKm = 10, mode = 'carpool', vehicleType = 'Sedan') {
  const baseSoloEmissionsGrams = distanceKm * 142; // Grams of CO2
  let modeEmissionsGrams = baseSoloEmissionsGrams;

  if (mode.toLowerCase().includes('carpool')) {
    // 3 passengers sharing = 1/3 emissions per person
    modeEmissionsGrams = baseSoloEmissionsGrams / 3.2;
  } else if (vehicleType.toLowerCase().includes('electric') || mode.toLowerCase().includes('ev')) {
    // EV solar grid charging emissions ~80% reduction
    modeEmissionsGrams = baseSoloEmissionsGrams * 0.18;
  } else if (mode.toLowerCase().includes('driver')) {
    modeEmissionsGrams = baseSoloEmissionsGrams * 1.05; // Return deadhead
  }

  const savedKg = Math.max(0, (baseSoloEmissionsGrams - modeEmissionsGrams) / 1000);
  const treesEquivalent = Number((savedKg * 0.045).toFixed(2)); // ~1 tree absorbs 22kg CO2/year

  return {
    savedKg: Number(savedKg.toFixed(2)),
    emittedKg: Number((modeEmissionsGrams / 1000).toFixed(2)),
    treesEquivalent,
    percentageReduction: Math.round(((baseSoloEmissionsGrams - modeEmissionsGrams) / baseSoloEmissionsGrams) * 100)
  };
}

/**
 * Validates and computes itemized GST (5% for Commercial Passenger Transport)
 */
export function calculateGstBreakdown(netFare = 500) {
  const gstRate = 0.05; // 5% GST
  const cgstRate = 0.025; // 2.5% Central GST
  const sgstRate = 0.025; // 2.5% State GST (Tamil Nadu)

  const netAmount = Math.round(netFare / (1 + gstRate));
  const totalTax = netFare - netAmount;
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;

  return {
    netAmount,
    totalTax,
    cgst,
    sgst,
    grossFare: netFare,
    gstin: '33AAACR4921F1ZX',
    sacCode: '996412 (Passenger Transport by Road)'
  };
}
