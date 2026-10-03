const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const frontendDir = path.join(__dirname, '../../frontend');

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.static(frontendDir));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
