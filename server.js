// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS ayarları - Güncellenmiş hali
const corsOptions = {
    origin: [
        "https://my-marketplace-front-end.vercel.app",
        "http://localhost:5173",  // Geliştirme ortamı için
        "http://localhost:3000"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // CORS preflight cache süresi - 24 saat
};

app.use(cors(corsOptions));
// OPTIONS istekleri için ek handler
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes - bunlar aynı kalacak
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/payment', require('./src/routes/payment'));
app.use('/api/orders', require('./src/routes/orders'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});