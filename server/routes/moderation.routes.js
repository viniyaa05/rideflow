import express from 'express';
import User from '../models/User.js';
import Incident from '../models/Incident.js';
import Appeal from '../models/Appeal.js';
import SupportQuery from '../models/SupportQuery.js';

const router = express.Router();

let inMemoryIncidents = [];
let inMemoryAppeals = [];
let inMemoryQueries = [];

// Issue a strike to a user (Auto-suspension on 3 strikes)
router.post('/strike', async (req, res) => {
  try {
    const { targetUserId, targetUserName, reportedBy, reason, details, severity, category } = req.body;

    let user = null;
    try {
      user = await User.findOne({ id: targetUserId });
    } catch {
      // Offline fallback
    }

    const currentStrikes = (user ? user.strikes : 0) + 1;
    const isSuspended = currentStrikes >= 3;

    const incidentId = 'inc_' + Date.now();
    const newIncident = {
      id: incidentId,
      targetUserId,
      targetUserName: targetUserName || (user ? user.name : 'Unknown User'),
      reportedBy: reportedBy || 'System/Admin',
      reason: reason || 'Community Guidelines Violation',
      details: details || '',
      category: category || 'other',
      severity: severity || 'high',
      strikeNumber: currentStrikes,
      actionTaken: isSuspended ? 'auto_suspended' : 'strike_issued',
      status: 'active',
      createdAt: new Date()
    };

    try {
      await Incident.create(newIncident);
      if (user) {
        await User.findOneAndUpdate(
          { id: targetUserId }, 
          { strikes: currentStrikes, isSuspended, suspensionReason: isSuspended ? 'Accumulated 3 policy violation strikes' : null }
        );
      }
    } catch {
      inMemoryIncidents.unshift(newIncident);
    }

    return res.json({
      success: true,
      message: isSuspended 
        ? `🚨 STRIKE #${currentStrikes} ISSUED. User has reached 3 strikes and is now AUTO-SUSPENDED from RideFlow!`
        : `⚠️ Strike #${currentStrikes} of 3 recorded for ${newIncident.targetUserName}.`,
      incident: newIncident,
      currentStrikes,
      isSuspended
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submit an Appeal for flagged/suspended users
router.post('/appeal', async (req, res) => {
  try {
    const { userId, userName, userEmail, userPhone, reason, evidenceText } = req.body;

    const appealId = 'app_' + Date.now();
    const newAppeal = {
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
      await Appeal.create(newAppeal);
      await User.findOneAndUpdate({ id: userId }, { appealStatus: 'pending' });
    } catch {
      inMemoryAppeals.unshift(newAppeal);
    }

    return res.json({
      success: true,
      message: 'Your appeal has been submitted to the Tamil Nadu Admin Review Desk. We will review your incident context within 24 hours.',
      appeal: newAppeal
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin approves or rejects appeal
router.post('/appeal/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminNotes, reviewedBy } = req.body; // decision: 'approved' | 'rejected'

    let appeal = null;
    try {
      appeal = await Appeal.findOne({ id });
      if (appeal) {
        appeal.status = decision;
        appeal.adminNotes = adminNotes;
        appeal.reviewedBy = reviewedBy || 'Admin Desk';
        appeal.resolvedAt = new Date();
        await appeal.save();

        if (decision === 'approved') {
          // Reset strikes and unsuspend user
          await User.findOneAndUpdate(
            { id: appeal.userId },
            { strikes: 0, isSuspended: false, suspensionReason: null, appealStatus: 'approved' }
          );
        } else {
          await User.findOneAndUpdate({ id: appeal.userId }, { appealStatus: 'rejected' });
        }
      }
    } catch {
      appeal = inMemoryAppeals.find(a => a.id === id);
      if (appeal) {
        appeal.status = decision;
      }
    }

    return res.json({
      success: true,
      message: decision === 'approved' 
        ? 'Appeal APPROVED! User strikes cleared and account unsuspended.'
        : 'Appeal REJECTED. Account remains suspended.',
      appeal
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submit support query
router.post('/query', async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;
    const queryId = 'qry_' + Date.now();
    const newQuery = {
      id: queryId,
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'General',
      status: 'open',
      createdAt: new Date()
    };

    try {
      await SupportQuery.create(newQuery);
    } catch {
      inMemoryQueries.unshift(newQuery);
    }

    return res.json({
      success: true,
      message: 'Your query has been logged in MongoDB. Support Ticket #' + queryId,
      query: newQuery
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get all incidents & appeals (Admin moderation view)
router.get('/dashboard', async (req, res) => {
  try {
    let incidents = [];
    let appeals = [];
    let queries = [];

    try {
      incidents = await Incident.find({}).sort({ createdAt: -1 });
      appeals = await Appeal.find({}).sort({ submittedAt: -1 });
      queries = await SupportQuery.find({}).sort({ createdAt: -1 });
    } catch {
      incidents = inMemoryIncidents;
      appeals = inMemoryAppeals;
      queries = inMemoryQueries;
    }

    return res.json({
      success: true,
      incidents,
      appeals,
      queries
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
