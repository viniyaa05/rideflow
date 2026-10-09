/**
 * RideFlow Pricing & Route Surge Engine
 * Calculates dynamic route fares across Tamil Nadu corridors.
 */

export const pricingService = {
  /**
   * Determine dynamic surge multiplier based on time and location
   */
  getSurgeMultiplier(hour = new Date().getHours()) {
    // Peak traffic hours in Chennai/OMR: 08:30-11:00 AM and 05:30-08:30 PM
    const isMorningPeak = hour >= 8 && hour <= 10;
    const isEveningPeak = hour >= 17 && hour <= 20;

    if (isMorningPeak || isEveningPeak) {
      return 1.25; // 25% peak hour surge
    }
    return 1.0;
  },

  /**
   * Calculate multi-modal fare comparison for a given distance
   */
  calculateFares(distanceKm = 12.5, options = {}) {
    const surge = options.surgeMultiplier || this.getSurgeMultiplier();
    const d = Math.max(1, Number(distanceKm) || 12.5);

    // 1. Solo Bike Taxi: Base ₹20 + ₹6/km
    const bikeBase = 20;
    const bikePerKm = 6;
    const bikeFare = Math.round((bikeBase + (d * bikePerKm)) * surge);

    // 2. City Auto: Base ₹30 + ₹12/km
    const autoBase = 30;
    const autoPerKm = 12;
    const autoFare = Math.round((autoBase + (d * autoPerKm)) * surge);

    // 3. Cab Prime / Chauffeur: Base ₹60 + ₹14/km
    const cabBase = 60;
    const cabPerKm = 14;
    const cabFare = Math.round((cabBase + (d * cabPerKm)) * surge);

    // 4. Carpool Connect: ₹70–₹90 flat seat share
    const carpoolFare = Math.min(90, Math.max(70, Math.round(75 + (d * 0.8))));

    // 5. Self-Drive Rental blocks
    const rentalHourly = 180;
    const rental4hr = rentalHourly * 4;
    const rental8hr = Math.round(rentalHourly * 8 * 0.9); // 10% daily discount
    const rental24hr = Math.round(rentalHourly * 24 * 0.75); // 25% 24hr discount

    return {
      distanceKm: d,
      surgeMultiplier: surge,
      isSurgeActive: surge > 1.0,
      modes: {
        bike: {
          mode: 'Solo Bike Taxi',
          serviceType: 'bike-taxi',
          basePrice: bikeBase,
          pricePerKm: bikePerKm,
          fare: bikeFare,
          etaMinutes: Math.round(d * 1.8),
          co2Kg: Number((d * 0.035).toFixed(2))
        },
        auto: {
          mode: 'City Auto',
          serviceType: 'auto',
          basePrice: autoBase,
          pricePerKm: autoPerKm,
          fare: autoFare,
          etaMinutes: Math.round(d * 2.1),
          co2Kg: Number((d * 0.065).toFixed(2))
        },
        cab: {
          mode: 'Cab Prime',
          serviceType: 'cab',
          basePrice: cabBase,
          pricePerKm: cabPerKm,
          fare: cabFare,
          etaMinutes: Math.round(d * 2.3),
          co2Kg: Number((d * 0.12).toFixed(2))
        },
        carpool: {
          mode: 'Carpool Connect',
          serviceType: 'carpool',
          fare: carpoolFare,
          etaMinutes: Math.round(d * 2.2),
          co2Kg: Number((d * 0.02).toFixed(2)),
          savingsPercent: 45
        },
        rental: {
          mode: 'Self-Drive Rental',
          serviceType: 'rental',
          hourlyRate: rentalHourly,
          packages: {
            '4_hours': rental4hr,
            '8_hours': rental8hr,
            '24_hours': rental24hr
          }
        }
      }
    };
  }
};
