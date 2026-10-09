import Carpool from '../models/Carpool.js';
import { dbStore } from './dbStore.js';

export const carpoolService = {
  /**
   * Offer / Post a new Carpool ride
   */
  async offerCarpool(poolData) {
    const poolId = poolData.id || 'pool_' + Date.now();
    const doc = {
      ...poolData,
      id: poolId,
      availableSeats: Number(poolData.availableSeats ?? poolData.seats ?? 3),
      totalSeats: Number(poolData.totalSeats ?? poolData.seats ?? 4),
      pricePerSeat: Number(poolData.pricePerSeat ?? poolData.price ?? 80),
      createdAt: new Date()
    };

    let saved = doc;
    try {
      saved = await Carpool.findOneAndUpdate(
        { id: poolId },
        { $set: doc },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.warn('[CarpoolService] MongoDB save warning:', err.message);
    }

    dbStore.addCarpool(doc);
    return saved;
  },

  /**
   * Atomic seat decrement when booking a carpool seat
   */
  async bookSeatAtomic(poolId, seatsCount = 1) {
    const count = Number(seatsCount) || 1;

    let updated = null;
    try {
      updated = await Carpool.findOneAndUpdate(
        { id: poolId, availableSeats: { $gte: count } },
        { $inc: { availableSeats: -count } },
        { new: true }
      );
    } catch (err) {
      console.warn('[CarpoolService] Atomic decrement warning:', err.message);
    }

    if (!updated) {
      // Check in dbStore
      const local = dbStore.getCarpools().find((c) => c.id === poolId);
      if (local && local.availableSeats >= count) {
        local.availableSeats -= count;
        dbStore.addCarpool(local);
        return { success: true, carpool: local, availableSeats: local.availableSeats };
      }
      return { success: false, error: 'No available seats left for this carpool route' };
    }

    // Keep dbStore in sync
    const local = dbStore.getCarpools().find((c) => c.id === poolId);
    if (local) {
      local.availableSeats = updated.availableSeats;
      dbStore.addCarpool(local);
    }

    return {
      success: true,
      carpool: updated,
      availableSeats: updated.availableSeats
    };
  },

  /**
   * Atomic seat restoration when carpool booking is cancelled
   */
  async restoreSeatAtomic(poolId, seatsCount = 1) {
    const count = Number(seatsCount) || 1;
    let updated = null;
    try {
      updated = await Carpool.findOneAndUpdate(
        { id: poolId },
        { $inc: { availableSeats: count } },
        { new: true }
      );
    } catch {}

    const local = dbStore.getCarpools().find((c) => c.id === poolId);
    if (local) {
      local.availableSeats = (local.availableSeats || 0) + count;
      dbStore.addCarpool(local);
    }

    return { success: true, availableSeats: updated ? updated.availableSeats : (local?.availableSeats) };
  },

  /**
   * Get carpools list
   */
  async getCarpools() {
    let list = [];
    try {
      list = await Carpool.find({}).sort({ createdAt: -1 });
    } catch {}

    if (!list || list.length === 0) {
      list = dbStore.getCarpools();
    }

    return list;
  }
};
