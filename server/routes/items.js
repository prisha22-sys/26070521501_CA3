const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Maintenance = require('../models/Maintenance');
const LifecycleEvent = require('../models/LifecycleEvent');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../config/db');

router.use(requireDb);
router.use(protect);

// @route   GET /api/items
// @desc    Get all items for authenticated user with search and filters
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, warrantyStatus, sort } = req.query;

    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { modelNumber: searchRegex },
        { serialNumber: searchRegex },
        { notes: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };
    else if (sort === 'name-desc') sortOption = { name: -1 };
    else if (sort === 'price-high') sortOption = { purchasePrice: -1 };
    else if (sort === 'price-low') sortOption = { purchasePrice: 1 };
    else if (sort === 'purchase-new') sortOption = { purchaseDate: -1 };
    else if (sort === 'purchase-old') sortOption = { purchaseDate: 1 };
    else if (sort === 'expiry-soon') sortOption = { warrantyExpiryDate: 1 };

    let items = await Item.find(query).sort(sortOption);

    // Filter by warrantyStatus if requested (computed virtual)
    if (warrantyStatus && warrantyStatus !== 'All') {
      items = items.filter((item) => item.warrantyStatus === warrantyStatus);
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/items/:id
// @desc    Get single item details
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or you do not have permission to view it.',
      });
    }

    // Also fetch recent maintenance and lifecycle summary
    const maintenanceCount = await Maintenance.countDocuments({
      item: item._id,
      user: req.user._id,
    });
    const totalMaintenanceCost = await Maintenance.aggregate([
      { $match: { item: item._id, user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);

    const maintenanceCost =
      totalMaintenanceCost.length > 0 ? totalMaintenanceCost[0].total : 0;

    res.json({
      success: true,
      data: {
        ...item.toObject({ virtuals: true }),
        maintenanceCount,
        maintenanceCost,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      brand,
      modelNumber,
      serialNumber,
      category,
      purchaseDate,
      purchasePrice,
      currency,
      purchaseStore,
      hasWarranty,
      warrantyDurationMonths,
      warrantyExpiryDate,
      warrantyProvider,
      status,
      location,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an item name.',
      });
    }

    const item = await Item.create({
      user: req.user._id,
      name,
      brand: brand || '',
      modelNumber: modelNumber || '',
      serialNumber: serialNumber || '',
      category: category || 'Electronics',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : 0,
      currency: currency || req.user.currency || 'USD',
      purchaseStore: purchaseStore || '',
      hasWarranty: hasWarranty !== undefined ? Boolean(hasWarranty) : true,
      warrantyDurationMonths:
        warrantyDurationMonths !== undefined ? Number(warrantyDurationMonths) : 12,
      warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined,
      warrantyProvider: warrantyProvider || 'Manufacturer Warranty',
      status: status || 'Active',
      location: location || '',
      notes: notes || '',
    });

    // Auto-create initial lifecycle event: "Purchased / Registered"
    await LifecycleEvent.create({
      user: req.user._id,
      item: item._id,
      eventType: 'Purchased',
      title: `Added "${item.name}" to inventory`,
      description: `Item registered with purchase price ${item.currency} ${item.purchasePrice}.`,
      date: item.purchaseDate || new Date(),
      metadata: {
        price: item.purchasePrice,
        currency: item.currency,
        store: item.purchaseStore,
      },
    });

    if (item.hasWarranty && item.warrantyExpiryDate) {
      await LifecycleEvent.create({
        user: req.user._id,
        item: item._id,
        eventType: 'WarrantyRegistered',
        title: `Warranty registered (${item.warrantyDurationMonths} months)`,
        description: `Covered by ${item.warrantyProvider} until ${new Date(
          item.warrantyExpiryDate
        ).toLocaleDateString()}.`,
        date: item.purchaseDate || new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: item.toObject({ virtuals: true }),
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/items/:id
// @desc    Update an existing item
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    let item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or you do not have permission to modify it.',
      });
    }

    const oldStatus = item.status;
    const oldLocation = item.location;

    // Update fields
    const fieldsToUpdate = [
      'name',
      'brand',
      'modelNumber',
      'serialNumber',
      'category',
      'purchaseDate',
      'purchasePrice',
      'currency',
      'purchaseStore',
      'hasWarranty',
      'warrantyDurationMonths',
      'warrantyExpiryDate',
      'warrantyProvider',
      'status',
      'location',
      'notes',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    // Check if status changed to log lifecycle event
    if (req.body.status && req.body.status !== oldStatus) {
      let eventType = 'StatusChanged';
      if (req.body.status === 'Sold') eventType = 'Sold';
      else if (req.body.status === 'Donated') eventType = 'Donated';
      else if (req.body.status === 'Disposed' || req.body.status === 'Recycled')
        eventType = 'Disposed';

      await LifecycleEvent.create({
        user: req.user._id,
        item: item._id,
        eventType,
        title: `Status changed to ${req.body.status}`,
        description: `Status transitioned from ${oldStatus} to ${req.body.status}.`,
        date: new Date(),
        metadata: { oldStatus, newStatus: req.body.status },
      });
    }

    // Check if location changed
    if (req.body.location && req.body.location !== oldLocation && oldLocation) {
      await LifecycleEvent.create({
        user: req.user._id,
        item: item._id,
        eventType: 'LocationChanged',
        title: `Moved to ${req.body.location}`,
        description: `Relocated from ${oldLocation} to ${req.body.location}.`,
        date: new Date(),
      });
    }

    res.json({
      success: true,
      data: item.toObject({ virtuals: true }),
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item and its associated maintenance and lifecycle records
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found or you do not have permission to delete it.',
      });
    }

    // Cascade delete maintenance and lifecycle events
    await Maintenance.deleteMany({ item: item._id, user: req.user._id });
    await LifecycleEvent.deleteMany({ item: item._id, user: req.user._id });

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item and associated history deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

