require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');
const seedAdmin  = require('./config/seedAdmin');

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Connect DB ───────────────────────────────────────────
connectDB().then(() => seedAdmin());

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve frontend static files ──────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', time: new Date() }));

// ── Catch-all ────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Global error handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`📦  API base: http://localhost:${PORT}/api\n`);
});