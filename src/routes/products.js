// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Tüm ürünleri getir
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error('Ürünler getirilirken hata:', error);
        res.status(500).json({ message: 'Ürünler getirilirken hata oluştu' });
    }
});

// Tekil ürün getir
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Ürün getirilirken hata oluştu' });
    }
});

// Yeni ürün ekle
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock, images, features, sizes, colors } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images: images || [],
                features: features || [],
                sizes: sizes || [],
                colors: colors || []
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Ürün eklenirken hata:', error);
        res.status(500).json({ message: 'Ürün eklenirken hata oluştu' });
    }
});

// Ürün güncelle
// backend/src/routes/products.js
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, stock, images, features, sizes, colors } = req.body;
 
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images: images || [],
                features: features || [],
                sizes: sizes || [],
                colors: colors || []
            }
        });
 
        res.json(product);
    } catch (error) {
        console.error('Ürün güncellenirken hata:', error);
        res.status(500).json({ message: 'Ürün güncellenirken hata oluştu' });
    }
 });

// Ürün sil
router.delete('/:id', async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: parseInt(req.params.id) }
        });
        
        res.json({ message: 'Ürün başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Ürün silinirken hata oluştu' });
    }
});

module.exports = router;