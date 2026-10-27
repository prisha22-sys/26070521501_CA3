const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema(
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
      required: [true, 'Please associate maintenance with an item'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title or description of service'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    serviceType: {
      type: String,
      required: [true, 'Please select a service type'],
      enum: [
        'Preventive',
        'Repair',
        'Upgrade',
        'Inspection',
        'Cleaning',
        'Battery Replacement',
        'Software Update',
        'Other',
      ],
      default: 'Repair',
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },
    provider: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Scheduled'],
      default: 'Completed',
    },
    coveredByWarranty: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    nextServiceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Maintenance', MaintenanceSchema);

