import User from '../models/User.js';
import Incident from '../models/Incident.js';
import Appeal from '../models/Appeal.js';
import SupportQuery from '../models/SupportQuery.js';
import { dbStore } from './dbStore.js';

export const moderationService = {
  /**
   * Issue a strike (3-strike rule: automatic suspension on 3rd strike)
   */
  async issueStrike({ targetUserId, targetUserName, reportedBy, reason, details, category, severity }) {
    let user = null;
    try {
      user = await User.findOne({ id: targetUserId });
    } catch {}

    if (!user) {
      user = dbStore.findUser((u) => u.id === targetUserId);
    }

    const currentStrikes = Number(user ? user.strikes || 0 : 0);
    const newStrikes = currentStrikes + 1;
    const isSuspended = newStrikes >= 3;

    // Update user
    try {
      await User.findOneAndUpdate(
        { id: targetUserId },
        { 
          $set: { 
            strikes: newStrikes, 
            isSuspended, 
            suspensionReason: isSuspended ? `Policy violation limit reached (3 strikes): ${reason}` : null 
          } 
        }
      );
    } catch {}

    if (user) {
      user.strikes = newStrikes;
      user.isSuspended = isSuspended;
      dbStore.addUser(user);
    }

    // Record incident
    const incidentId = 'inc_' + Date.now();
    const incidentDoc = {
      id: incidentId,
      targetUserId,
      targetUserName: targetUserName || user?.name || 'Member',
      targetUserRole: user?.role || 'user',
      reportedBy: reportedBy || 'System Monitor',
      reason,
      details: details || '',
      category: category || 'other',
      severity: severity || (newStrikes >= 3 ? 'critical' : 'medium'),
      strikeNumber: newStrikes,
      actionTaken: isSuspended ? 'auto_suspended' : 'strike_issued',
      status: 'active',
      createdAt: new Date()
    };

    try {
      await Incident.create(incidentDoc);
    } catch {}

    return {
      success: true,
      strikeNumber: newStrikes,
      isSuspended,
      incident: incidentDoc
    };
  },

  /**
   * Submit an appeal against a suspension/strike
   */
  async submitAppeal({ userId, userName, userEmail, userPhone, reason, evidenceText }) {
    const appealId = 'app_' + Date.now();
    const doc = {
      id: appealId,
      userId,
      userName,
      userEmail,
      userPhone,
      reason,
      evidenceText,
      status: 'pending',
      submittedAt: new Date()
    };

    try {
      await Appeal.create(doc);
      await User.findOneAndUpdate({ id: userId }, { $set: { appealStatus: 'pending' } });
    } catch {}

    return { success: true, appeal: doc };
  },

  /**
   * Admin resolves an appeal
   */
  async resolveAppeal(appealId, decision, adminNotes, reviewedBy = 'Admin Desk') {
    let appeal = null;
    try {
      appeal = await Appeal.findOne({ id: appealId });
    } catch {}

    if (!appeal) {
      const err = new Error('Appeal not found');
      err.statusCode = 404;
      throw err;
    }

    appeal.status = decision; // 'approved' | 'rejected'
    appeal.adminNotes = adminNotes;
    appeal.reviewedBy = reviewedBy;
    appeal.resolvedAt = new Date();

    try {
      await appeal.save();
    } catch {}

    // If approved, restore user account and reset/decrement strikes
    if (decision === 'approved' && appeal.userId) {
      try {
        await User.findOneAndUpdate(
          { id: appeal.userId },
          { 
            $set: { 
              isSuspended: false, 
              strikes: 1, // Reset to 1 warning
              suspensionReason: null, 
              appealStatus: 'approved' 
            } 
          }
        );
      } catch {}

      const localUser = dbStore.findUser((u) => u.id === appeal.userId);
      if (localUser) {
        localUser.isSuspended = false;
        localUser.strikes = 1;
        dbStore.addUser(localUser);
      }
    } else if (decision === 'rejected' && appeal.userId) {
      try {
        await User.findOneAndUpdate(
          { id: appeal.userId },
          { $set: { appealStatus: 'rejected' } }
        );
      } catch {}
    }

    return { success: true, appeal };
  },

  /**
   * Submit support query
   */
  async submitQuery(data) {
    const queryId = 'qry_' + Date.now();
    const doc = {
      id: queryId,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      await SupportQuery.create(doc);
    } catch {}

    return { success: true, query: doc };
  },

  /**
   * Get all moderation incidents & appeals
   */
  async getDashboardData() {
    let incidents = [];
    let appeals = [];
    let queries = [];

    try {
      incidents = await Incident.find({}).sort({ createdAt: -1 });
      appeals = await Appeal.find({}).sort({ submittedAt: -1 });
      queries = await SupportQuery.find({}).sort({ createdAt: -1 });
    } catch {}

    return { incidents, appeals, queries };
  }
};
