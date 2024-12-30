// backend/src/routes/cart.js
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth'); // Authentication middleware

// Kullanıcının sepetini getir
router.get('/', auth, async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            // Sepet yoksa yeni sepet oluştur
            const newCart = await prisma.cart.create({
                data: {
                    userId: req.user.id,
                    items: []
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            return res.json(newCart);
        }

        res.json(cart);
    } catch (error) {
        console.error('Sepet getirme hatası:', error);
        res.status(500).json({ message: 'Sepet bilgileri alınamadı' });
    }
});

// Sepete ürün ekle
router.post('/items', auth, async (req, res) => {
    try {
        const { productId, quantity, selectedSize, selectedColor } = req.body;

        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: req.user.id
                }
            });
        }

        // Ürünün sepette olup olmadığını kontrol et
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: parseInt(productId),
                size: selectedSize,
                color: selectedColor
            }
        });

        if (existingItem) {
            // Varsa miktarı güncelle
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity
                },
                include: {
                    product: true
                }
            });
            return res.json(updatedItem);
        }

        // Yoksa yeni ürün ekle
        const cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: parseInt(productId),
                quantity,
                size: selectedSize,
                color: selectedColor
            },
            include: {
                product: true
            }
        });

        res.json(cartItem);
    } catch (error) {
        console.error('Sepete ekleme hatası:', error);
        res.status(500).json({ message: 'Ürün sepete eklenemedi' });
    }
});

// Sepetten ürün çıkar
router.delete('/items/:itemId', auth, async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Sepet bulunamadı' });
        }

        await prisma.cartItem.delete({
            where: { 
                id: parseInt(req.params.itemId),
                cartId: cart.id
            }
        });

        res.json({ message: 'Ürün sepetten kaldırıldı' });
    } catch (error) {
        console.error('Sepetten çıkarma hatası:', error);
        res.status(500).json({ message: 'Ürün sepetten çıkarılamadı' });
    }
});

// Sepet miktarını güncelle
router.put('/items/:itemId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Sepet bulunamadı' });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { 
                id: parseInt(req.params.itemId),
                cartId: cart.id
            },
            data: { quantity },
            include: {
                product: true
            }
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Miktar güncelleme hatası:', error);
        res.status(500).json({ message: 'Miktar güncellenemedi' });
    }
});

module.exports = router;