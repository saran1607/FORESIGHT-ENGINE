const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'General' },
  currentStock: { type: Number, default: 0 },
  unit: { type: String, default: 'units' },
  lowStockThreshold: { type: Number, default: 50 },
  warehouseSection: { type: String, default: 'A' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
