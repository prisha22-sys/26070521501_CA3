const express = require('express');
const router = express.Router();
const LifecycleEvent = require('../models/LifecycleEvent');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../config/db');

router.use(requireDb);
router.use(protect);

// @route   GET /api/lifecycle/item/:itemId
// @desc    Get all lifecycle timeline events for a specific item
// @access  Private
router.get('/item/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Verify item ownership
    const item = await Item.findOne({ _id: itemId, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or you do not have permission to view its history.',
      });
    }

    const events = await LifecycleEvent.find({
      item: itemId,
      user: req.user._id,
    }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/lifecycle/recent
// @desc    Get recent lifecycle events across all items for the user
// @access  Private
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const events = await LifecycleEvent.find({ user: req.user._id })
      .populate('item', 'name brand category status')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/lifecycle
// @desc    Manually record a lifecycle milestone / note on an item
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { item: itemId, eventType, title, description, date } = req.body;

    if (!itemId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an item ID and event title.',
      });
    }

    const item = await Item.findOne({ _id: itemId, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.',
      });
    }

    const event = await LifecycleEvent.create({
      user: req.user._id,
      item: item._id,
      eventType: eventType || 'CustomNote',
      title,
      description: description || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

