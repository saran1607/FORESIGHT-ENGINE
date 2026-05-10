const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: { type: String, required: true },
  type: { type: String, enum: ['add', 'remove'], required: true },
  quantity: { type: Number, required: true },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
