const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const Product = require('./models/Product');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/foresight-engine')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB not connected:', err.message));

const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ─── AI PREDICTION ────────────────────────────────────────────
app.post('/api/predict', upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const csvPath = req.file.path;
  const pythonScript = path.join(__dirname, '../ml/model.py');
  const python = spawn('python', [pythonScript, csvPath]);

  let output = '', errorOutput = '';
  python.stdout.on('data', d => output += d.toString());
  python.stderr.on('data', d => errorOutput += d.toString());

  python.on('close', async (code) => {
    fs.unlinkSync(csvPath);
    if (code !== 0) return res.status(500).json({ error: 'Python error: ' + errorOutput });
    try {
      const result = JSON.parse(output.trim());

      if (mongoose.connection.readyState === 1) {
        for (const p of result.top_products) {
          const name = p[result.product_col] || Object.values(p)[0];
          const existing = await Product.findOne({ name });
          if (!existing) await Product.create({ name, currentStock: Math.floor(Math.random() * 200) + 50 });
        }
        const products = await Product.find();
        const warnings = products
          .filter(p => p.currentStock <= p.lowStockThreshold)
          .map(p => ({ name: p.name, stock: p.currentStock, threshold: p.lowStockThreshold }));
        result.warehouseWarnings = warnings;
        result.predictedDemandWarning =
          result.predicted_qty > products.reduce((s, p) => s + p.currentStock, 0);
      }
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: 'Parse error: ' + output });
    }
  });
});

// ─── PRODUCTS ─────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find().sort({ name: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', async (req, res) => {
  try { res.json(await Product.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { type, quantity, note } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const qty = parseInt(quantity);
    if (type === 'add') product.currentStock += qty;
    else {
      if (product.currentStock < qty) return res.status(400).json({ error: 'Not enough stock' });
      product.currentStock -= qty;
    }
    product.lastUpdated = new Date();
    await product.save();
    await Transaction.create({ product: product.name, type, quantity: qty, note });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── TRANSACTIONS ─────────────────────────────────────────────
app.get('/api/transactions', async (req, res) => {
  try { res.json(await Transaction.find().sort({ date: -1 }).limit(100)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.send('Foresight Engine API ✅'));
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
