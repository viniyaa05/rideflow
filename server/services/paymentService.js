import User from '../models/User.js';
import { dbStore } from './dbStore.js';

export const paymentService = {
  /**
   * Deduct funds from user wallet
   */
  async deductWallet(userId, amount) {
    const numAmount = Number(amount);
    if (!userId || isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Valid user ID and amount are required');
    }

    let user = null;
    try {
      user = await User.findOne({ id: userId });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.id === userId);
    }

    if (!user) {
      throw new Error('User not found for wallet deduction');
    }

    const currentBal = Number(user.walletBalance || 0);
    if (currentBal < numAmount) {
      const err = new Error(`Insufficient wallet balance (₹${currentBal.toFixed(2)}). Need ₹${numAmount.toFixed(2)}.`);
      err.statusCode = 402; // Payment Required
      throw err;
    }

    const newBal = Number((currentBal - numAmount).toFixed(2));

    try {
      await User.findOneAndUpdate({ id: userId }, { $set: { walletBalance: newBal } });
    } catch {}

    // Update in local store
    if (user) {
      user.walletBalance = newBal;
      dbStore.addUser(user);
    }

    return {
      success: true,
      previousBalance: currentBal,
      deducted: numAmount,
      newBalance: newBal
    };
  },

  /**
   * Instant 100% cancellation refund back to user wallet
   */
  async refundWallet(userId, amount, reason = 'Trip cancelled before OTP start') {
    const numAmount = Number(amount);
    if (!userId || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, refunded: 0 };
    }

    let user = null;
    try {
      user = await User.findOne({ id: userId });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.id === userId);
    }

    if (!user) {
      return { success: false, refunded: 0 };
    }

    const currentBal = Number(user.walletBalance || 0);
    const newBal = Number((currentBal + numAmount).toFixed(2));

    try {
      await User.findOneAndUpdate({ id: userId }, { $set: { walletBalance: newBal } });
    } catch {}

    if (user) {
      user.walletBalance = newBal;
      dbStore.addUser(user);
    }

    return {
      success: true,
      previousBalance: currentBal,
      refunded: numAmount,
      newBalance: newBal,
      reason
    };
  },

  /**
   * Add money to wallet
   */
  async addFunds(userId, amount) {
    const numAmount = Number(amount);
    if (!userId || isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Valid user ID and amount are required');
    }

    let user = null;
    try {
      user = await User.findOneAndUpdate(
        { id: userId },
        { $inc: { walletBalance: numAmount } },
        { new: true }
      );
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.id === userId);
      if (user) {
        user.walletBalance = Number(((user.walletBalance || 0) + numAmount).toFixed(2));
        dbStore.addUser(user);
      }
    }

    return {
      success: true,
      newBalance: user ? user.walletBalance : numAmount
    };
  }
};
