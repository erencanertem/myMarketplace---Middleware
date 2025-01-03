// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS ayarları
const corsOptions = {
    origin: "https://my-marketplace-front-end.vercel.app",
    credentials: true
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/payment', require('./src/routes/payment'));
app.use('/api/orders', require('./src/routes/orders'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});