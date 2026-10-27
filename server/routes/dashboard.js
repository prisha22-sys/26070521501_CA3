const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Maintenance = require('../models/Maintenance');
const LifecycleEvent = require('../models/LifecycleEvent');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../config/db');

router.use(requireDb);
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get comprehensive personalized database statistics for the user
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch user items
    const items = await Item.find({ user: userId });

    const totalItems = items.length;
    let totalAssetValue = 0;
    let activeWarranties = 0;
    let expiringSoonWarranties = 0;
    let expiredWarranties = 0;
    let warrantyAlerts = [];

    items.forEach((item) => {
      totalAssetValue += item.purchasePrice || 0;

      if (item.hasWarranty && item.warrantyExpiryDate) {
        const expiry = new Date(item.warrantyExpiryDate);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          expiredWarranties++;
        } else if (daysLeft <= 30) {
          expiringSoonWarranties++;
          warrantyAlerts.push({
            itemId: item._id,
            name: item.name,
            brand: item.brand,
            category: item.category,
            expiryDate: item.warrantyExpiryDate,
            daysLeft,
            status: 'expiring_soon',
          });
        } else {
          activeWarranties++;
        }
      }
    });

    // Sort warranty alerts by soonest expiry
    warrantyAlerts.sort((a, b) => a.daysLeft - b.daysLeft);

    // 2. Aggregate Maintenance Stats
    const maintenanceAggregation = await Maintenance.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const totalMaintenanceCost =
      maintenanceAggregation.length > 0 ? maintenanceAggregation[0].totalCost : 0;
    const totalMaintenanceCount =
      maintenanceAggregation.length > 0 ? maintenanceAggregation[0].totalCount : 0;

    // 3. Category Breakdown Aggregation
    const categoryStats = await Item.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Status Breakdown Aggregation
    const statusStats = await Item.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Recent Items
    const recentItems = await Item.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recent Lifecycle Events
    const recentEvents = await LifecycleEvent.find({ user: userId })
      .populate('item', 'name brand category status')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 7. Upcoming scheduled maintenance
    const upcomingMaintenance = await Maintenance.find({
      user: userId,
      status: 'Scheduled',
      nextServiceDate: { $gte: now },
    })
      .populate('item', 'name brand')
      .sort({ nextServiceDate: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalAssetValue: Math.round(totalAssetValue * 100) / 100,
          activeWarranties,
          expiringSoonWarranties,
          expiredWarranties,
          totalMaintenanceCount,
          totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
          currency: req.user.currency || 'USD',
        },
        categoryStats,
        statusStats,
        warrantyAlerts,
        upcomingMaintenance,
        recentItems,
        recentEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

