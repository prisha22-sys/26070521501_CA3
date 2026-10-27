const mongoose = require('mongoose');

const LifecycleEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'Purchased',
        'WarrantyRegistered',
        'WarrantyExpired',
        'MaintenancePerformed',
        'StatusChanged',
        'LocationChanged',
        'Sold',
        'Donated',
        'Disposed',
        'CustomNote',
      ],
      default: 'CustomNote',
    },
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LifecycleEvent', LifecycleEventSchema);

