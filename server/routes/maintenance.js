const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Item = require('../models/Item');
const LifecycleEvent = require('../models/LifecycleEvent');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../config/db');

router.use(requireDb);
router.use(protect);

// @route   GET /api/maintenance
// @desc    Get all maintenance records for user, optionally filtered by itemId
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { itemId, serviceType, status } = req.query;
    const query = { user: req.user._id };

    if (itemId) {
      query.item = itemId;
    }
    if (serviceType && serviceType !== 'All') {
      query.serviceType = serviceType;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const records = await Maintenance.find(query)
      .populate('item', 'name brand modelNumber category serialNumber')
      .sort({ serviceDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/maintenance/:id
// @desc    Get single maintenance record
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const record = await Maintenance.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('item', 'name brand modelNumber category');

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance record not found.',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/maintenance
// @desc    Create a new maintenance record
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const {
      item: itemId,
      title,
      serviceType,
      serviceDate,
      cost,
      provider,
      status,
      coveredByWarranty,
      notes,
      nextServiceDate,
    } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'Please select an item for this maintenance record.',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a title for the service record.',
      });
    }

    // Verify item belongs to user
    const item = await Item.findOne({ _id: itemId, user: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or does not belong to you.',
      });
    }

    const maintenance = await Maintenance.create({
      user: req.user._id,
      item: item._id,
      title,
      serviceType: serviceType || 'Repair',
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
      cost: cost !== undefined ? Number(cost) : 0,
      provider: provider || '',
      status: status || 'Completed',
      coveredByWarranty: Boolean(coveredByWarranty),
      notes: notes || '',
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
    });

    // Auto-create Lifecycle event
    await LifecycleEvent.create({
      user: req.user._id,
      item: item._id,
      eventType: 'MaintenancePerformed',
      title: `${maintenance.serviceType}: ${maintenance.title}`,
      description: `${provider ? `By ${provider}. ` : ''}Cost: ${item.currency || 'USD'} ${maintenance.cost}. ${notes || ''}`.trim(),
      date: maintenance.serviceDate || new Date(),
      metadata: {
        maintenanceId: maintenance._id,
        cost: maintenance.cost,
        provider: maintenance.provider,
        serviceType: maintenance.serviceType,
      },
    });

    // If item was marked "In Repair" and status is "Completed", we can optionally note it
    if (maintenance.status === 'In Progress' && item.status !== 'In Repair') {
      item.status = 'In Repair';
      await item.save();
    }

    const populatedRecord = await Maintenance.findById(maintenance._id).populate(
      'item',
      'name brand modelNumber category'
    );

    res.status(201).json({
      success: true,
      data: populatedRecord,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance record
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance record not found.',
      });
    }

    const fields = [
      'title',
      'serviceType',
      'serviceDate',
      'cost',
      'provider',
      'status',
      'coveredByWarranty',
      'notes',
      'nextServiceDate',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        maintenance[field] = req.body[field];
      }
    });

    await maintenance.save();

    const populatedRecord = await Maintenance.findById(maintenance._id).populate(
      'item',
      'name brand modelNumber category'
    );

    res.json({
      success: true,
      data: populatedRecord,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/maintenance/:id
// @desc    Delete maintenance record
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance record not found.',
      });
    }

    await maintenance.deleteOne();

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

