const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    modelNumber: {
      type: String,
      trim: true,
      default: '',
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'Home & Kitchen',
        'Vehicles & Transit',
        'Tools & Machinery',
        'Computing & Office',
        'Audio & Video',
        'Fashion & Wearables',
        'Furniture',
        'Sports & Outdoors',
        'Other',
      ],
      default: 'Electronics',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    purchaseStore: {
      type: String,
      trim: true,
      default: '',
    },
    hasWarranty: {
      type: Boolean,
      default: true,
    },
    warrantyDurationMonths: {
      type: Number,
      min: [0, 'Warranty duration cannot be negative'],
      default: 12,
    },
    warrantyExpiryDate: {
      type: Date,
    },
    warrantyProvider: {
      type: String,
      trim: true,
      default: 'Manufacturer Warranty',
    },
    status: {
      type: String,
      enum: [
        'Active',
        'In Repair',
        'Storage',
        'Sold',
        'Donated',
        'Recycled',
        'Disposed',
      ],
      default: 'Active',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-calculate warranty expiry date before save if not explicitly provided
ItemSchema.pre('save', function (next) {
  if (this.hasWarranty && this.purchaseDate && this.warrantyDurationMonths != null) {
    if (!this.warrantyExpiryDate || this.isModified('purchaseDate') || this.isModified('warrantyDurationMonths')) {
      const pDate = new Date(this.purchaseDate);
      const expDate = new Date(pDate);
      expDate.setMonth(expDate.getMonth() + parseInt(this.warrantyDurationMonths, 10));
      this.warrantyExpiryDate = expDate;
    }
  } else if (!this.hasWarranty) {
    this.warrantyExpiryDate = null;
  }
  next();
});

// Virtual for warranty status calculation
ItemSchema.virtual('warrantyStatus').get(function () {
  if (!this.hasWarranty || !this.warrantyExpiryDate) {
    return 'none';
  }
  const now = new Date();
  const expiry = new Date(this.warrantyExpiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 30) {
    return 'expiring_soon';
  }
  return 'active';
});

// Virtual for days remaining on warranty
ItemSchema.virtual('warrantyDaysRemaining').get(function () {
  if (!this.hasWarranty || !this.warrantyExpiryDate) {
    return null;
  }
  const now = new Date();
  const expiry = new Date(this.warrantyExpiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Item', ItemSchema);

